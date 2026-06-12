import { test, expect } from '@playwright/test';
import { AppPage } from './pom/AppPage';
import { AddForm } from './pom/AddForm';

test.describe('The Universal Fortress', () => {
  test.beforeEach(async ({ page }) => {
    page.on('console', msg => console.log(`[BROWSER] ${msg.type()}: ${msg.text()}`));
    page.on('pageerror', err => console.log(`[BROWSER ERROR] ${err.message}`));
    
    // Capture worker console logs and errors explicitly
    page.on('worker', worker => {
      worker.on('console', msg => console.log(`[WORKER] ${msg.type()}: ${msg.text()}`));
      worker.on('close', () => console.log(`[WORKER] Closed: ${worker.url()}`));
    });
  });

  test('Smoke Test: App Loads and shows Login', async ({ page }) => {
    const app = new AppPage(page);
    await app.goto();

    await expect(app.loginContainer).toBeVisible();
    await expect(app.authTokenInput).toBeVisible();
    await expect(app.syncButton).toBeVisible();
  });

  test('Scenario 1: The First Awakening (Bootstrap Sync Attempt)', async ({ page }) => {
    const app = new AppPage(page);

    // Mock Proxy calls
    await app.mockProxy('/posts/recent', [
      { href: 'https://example.com/1', description: 'Bookmark 1', tags: 'tag1', time: '2023-10-01T12:00:00Z' },
      { href: 'https://example.com/2', description: 'Bookmark 2', tags: 'tag2', time: '2023-10-01T12:01:00Z' },
    ]);

    // Mock /posts/all as well since worker.ts currently uses it for hydration
    await app.mockProxy('/posts/all', [
      { href: 'https://example.com/1', description: 'Bookmark 1', tags: 'tag1', time: '2023-10-01T12:00:00Z' },
      { href: 'https://example.com/2', description: 'Bookmark 2', tags: 'tag2', time: '2023-10-01T12:01:00Z' },
    ]);

    await app.goto();
    await app.login('test:TOKEN');

    // Assert that the list eventually shows the items
    const list = page.getByTestId('bookmark-item');
    await expect(list).toHaveCount(2, { timeout: 10000 });
    await expect(list.first()).toContainText('Bookmark 2'); // Sorted by time DESC
  });

  test('Scenario 3: The Punctuation Paradox (Exact Tag Matching)', async ({ page }) => {
    const app = new AppPage(page);
    const dbName = `test-punct-${Math.random().toString(36).substring(7)}.db`;

    // Rigorous Data: Testing space-padding and complex delimiters
    const bookmarks = [
      { href: '1', description: 'Target', tags: 'subject:cs.AI tui', time: '2023-10-01T12:00:00Z' },
      { href: '2', description: 'False Positive 1', tags: 'subject:cs.AI:ext', time: '2023-10-01T12:01:00Z' },
      { href: '3', description: 'False Positive 2', tags: 'not:subject:cs.AI', time: '2023-10-01T12:02:00Z' },
      { href: '4', description: 'Partial Match', tags: 'cs.AI', time: '2023-10-01T12:03:00Z' },
    ];

    await app.mockProxy('/posts/recent', []);
    await app.mockProxy('/posts/all', bookmarks);
    await app.mockProxy('/posts/update', { update_time: '2023-10-01T12:00:00Z' });
    await app.mockProxy('/posts/dates', { dates: {} });

    await page.goto(`/?dbName=${dbName}`);
    await app.login('test:TOKEN');
    await expect(page.getByTestId('bookmark-item')).toHaveCount(4, { timeout: 10000 });

    // 1. Perform Exact Tag Search
    await app.search('#subject:cs.AI');

    // Assert: Only exactly 'subject:cs.AI' should match due to our space-padding heuristic
    const list = page.getByTestId('bookmark-item');
    await expect(list).toHaveCount(1);
    await expect(list).toContainText('Target');
    await expect(list).not.toContainText('False Positive');
    await expect(list).not.toContainText('Partial Match');

    // 2. Perform another exact search for the partial one
    await app.search('#cs.AI');
    await expect(list).toHaveCount(1);
    await expect(list).toContainText('Partial Match');
    await expect(list).not.toContainText('Target');
  });

  test('Scenario 6: The Offline Fortress (Persistence)', async ({ page, context }) => {
    const app = new AppPage(page);
    const addForm = new AddForm(page);

    await app.mockProxy('/posts/recent', []);
    await app.mockProxy('/posts/all', []);
    await app.mockProxy('/posts/update', { update_time: new Date().toISOString() });
    await app.mockProxy('/posts/dates', { dates: {} });

    await app.goto();
    await app.login('test:TOKEN');

    // Wait for setup to complete and UI to unlock
    await expect(app.toggleAddButton).toBeVisible({ timeout: 15000 });
    await expect(app.loginContainer).not.toBeVisible();

    // 1. Go Offline
    await context.setOffline(true);
    await app.expectOffline();

    // 2. Add a bookmark while offline
    await app.toggleAddForm();
    await addForm.fill('https://offline.com', 'Offline Bookmark', 'offline test');
    await addForm.submit();

    // 3. Assert immediate local UI update
    await app.expectBookmarkCount(1);
    const item = app.getBookmarkItem(0);
    await item.expectTitle('Offline Bookmark');
    await item.expectPending(true);

    // 4. Assert persistence after refresh
    await context.setOffline(false);
    await page.reload();
    await app.expectBookmarkCount(1);
    const reloadedItem = app.getBookmarkItem(0);
    await reloadedItem.expectTitle('Offline Bookmark');
    await reloadedItem.expectPending(true);
    await app.expectOnline();
  });

  test('Scenario 7: The Upstream Flush (Reconnection)', async ({ page, context }) => {
    const app = new AppPage(page);
    const addForm = new AddForm(page);

    await app.mockProxy('/posts/recent', []);
    await app.mockProxy('/posts/all', []);
    await app.mockProxy('/posts/update', { update_time: new Date().toISOString() });
    await app.mockProxy('/posts/dates', { dates: {} });
    // Mock /posts/add to return raw XML as returned by Pinboard on success
    await page.context().route(url => url.href.includes('/posts/add'), async (r) => {
      await r.fulfill({
        status: 200,
        contentType: 'text/xml',
        body: '<result code="done" />',
      });
    });

    await app.goto();
    await app.login('test:TOKEN');
    await expect(app.toggleAddButton).toBeVisible({ timeout: 15000 });

    // 1. Add Bookmark Offline
    await context.setOffline(true);
    await app.toggleAddForm();
    await addForm.fill('https://reconnect.com', 'Reconnect Bookmark', 'test');
    await addForm.submit();

    const item = app.getBookmarkItem(0);
    await item.expectPending(true);

    // 2. Go Online and trigger sync
    await context.setOffline(false);
    await page.evaluate(() => (window as any).sync.setThrottle(100));

    // Let's perform another search to trigger a refresh and check if loop starts
    await app.search('Reconnect');

    // Assert that the pending icon disappears
    await item.expectPending(false, { timeout: 15000 });
  });

  test('Scenario 11: Search Persistence during Sync', async ({ page }) => {
    const app = new AppPage(page);

    // Initial State: 2 bookmarks
    const initialBookmarks = [
      { href: 'https://a.com', description: 'Apple', tags: 'fruit', time: '2023-10-01T12:00:00Z' },
      { href: 'https://b.com', description: 'Banana', tags: 'fruit', time: '2023-10-01T12:01:00Z' },
    ];

    await app.mockProxy('/posts/recent', []);
    await app.mockProxy('/posts/all', initialBookmarks);
    await app.mockProxy('/posts/update', { update_time: '2023-10-01T13:00:00Z' });
    await app.mockProxy('/posts/dates', { dates: {} });

    await app.goto();
    await app.login('test:TOKEN');
    await expect(page.getByTestId('bookmark-item')).toHaveCount(2, { timeout: 10000 });

    // 1. Perform Search for "Apple"
    await app.search('Apple');
    await expect(page.getByTestId('bookmark-item')).toHaveCount(1);
    await expect(page.getByTestId('bookmark-item')).toContainText('Apple');

    // 2. Mock a NEW bookmark arriving via delta sync
    const newBookmark = { href: 'https://c.com', description: 'Cherry', tags: 'fruit', time: '2023-10-01T12:02:00Z' };

    // We need /posts/update to return a NEWER timestamp to trigger the delta fetch in the loop
    // Note: We use a new mock route that will override the previous ones
    await app.mockProxy('/posts/update', { update_time: '2023-10-01T14:00:00Z' });
    await app.mockProxy('/posts/all', [newBookmark]);

    // Force a sync trigger by calling startLoop directly
    await page.evaluate(() => (window as any).sync.startLoop());

    // If the bug exists, the list will eventually show 3 items because search is cleared.
    // We want to ASSERT that it stays at 1.
    const list = page.getByTestId('bookmark-item');
    await expect(list).toHaveCount(1, { timeout: 20000 });
    await expect(list).toContainText('Apple');
  });

  test('Scenario 12: Deep Link Refresh (Persistence)', async ({ page }) => {
    const app = new AppPage(page);
    const dbName = `test-deep-${Math.random().toString(36).substring(7)}.db`;

    const bookmarks = [
      { href: 'https://year.com', description: 'Yearly Review', tags: 'year', time: '2023-10-01T12:00:00Z' },
      { href: 'https://other.com', description: 'Other', tags: 'other', time: '2023-10-01T12:01:00Z' },
    ];

    await app.mockProxy('/posts/recent', []);
    await app.mockProxy('/posts/all', bookmarks);
    await app.mockProxy('/posts/update', { update_time: '2023-10-01T13:00:00Z' });
    await app.mockProxy('/posts/dates', { dates: {} });

    // 1. Initial Load and Login
    await page.goto(`/?dbName=${dbName}`);
    await app.login('test:TOKEN');
    await app.expectBookmarkCount(2, { timeout: 10000 });

    // 2. Perform Search to set URL
    await app.search('year');
    await app.expectBookmarkCount(1);
    await expect(page.url()).toContain('q=year');

    // 3. REFRESH the page with the query in URL
    // We need to keep the dbName so it doesn't create a fresh empty DB
    await page.goto(`/?dbName=${dbName}&q=year`);

    // 4. Assert that the search is still active and results are visible
    await app.expectSearchQuery('year');
    await app.expectBookmarkCount(1, { timeout: 10000 });
    await app.getBookmarkItem(0).expectTitle('Yearly Review');
  });

  test('Scenario 13: The Heartbeat Ritual (Autosync Verification)', async ({ page }) => {
    const app = new AppPage(page);

    await app.mockProxy('/posts/recent', []);
    await app.mockProxy('/posts/all', [
      { href: 'https://pulse.com', description: 'Pulse 1', tags: 'test', time: '2023-10-01T12:00:00Z' }
    ]);
    await app.mockProxy('/posts/update', { update_time: '2023-10-01T12:00:00Z' });
    await app.mockProxy('/posts/dates', { dates: {} });

    await app.goto();
    await app.login('test:TOKEN');
    await expect(page.getByTestId('bookmark-item')).toHaveCount(1, { timeout: 10000 });

    // 1. Accelerate the heartbeat for testing
    await page.evaluate(() => {
      (window as any).sync.setInterval(2000);
      (window as any).sync.startLoop();
    });

    // 2. Mock a NEW bookmark appearing on the server
    const newBookmark = { href: 'https://pulse2.com', description: 'Pulse 2', tags: 'test', time: '2023-10-01T12:05:00Z' };

    // We need update_time to change to trigger delta sync
    await app.mockProxy('/posts/update', { update_time: '2023-10-01T13:00:00Z' });
    await app.mockProxy('/posts/all', [newBookmark]);

    // 3. Wait for the autosync to trigger and fetch the new bookmark
    // We expect this to happen automatically within ~10-15s (2s interval + loop overhead)
    const list = page.getByTestId('bookmark-item');
    await expect(list).toHaveCount(2, { timeout: 20000 });
    await expect(list.first()).toContainText('Pulse 2');
  });

  test('Scenario 14: The Zombie Database (Self-Healing Sync)', async ({ page }) => {
    const app = new AppPage(page);
    const dbName = `test-zombie-${Math.random().toString(36).substring(7)}.db`;

    // 1. Setup a "Zombie" state: Data exists, but NO sync sentinel
    await app.mockProxy('/posts/recent', []);
    await app.mockProxy('/posts/all', [
      { href: 'https://zombie.com', description: 'Zombie Bookmark', tags: 'undead', time: '2023-10-01T12:00:00Z' }
    ]);

    // We mock /posts/update to see if the app tries to sync after healing
    await app.mockProxy('/posts/update', { update_time: '2023-10-01T13:00:00Z' });
    await app.mockProxy('/posts/dates', { dates: {} });

    await page.goto(`/?dbName=${dbName}`);
    await app.login('test:TOKEN');

    // Wait for initial sync to "complete" (ingest data)
    await app.expectBookmarkCount(1, { timeout: 10000 });

    // 2. SIMULATE ZOMBIE STATE: Manually clear the sync sentinel in metadata
    await page.evaluate(async () => {
      const db = (window as any).db;
      // This mimics an interrupted sync where data was written but sentinel wasn't
      await db.send('EXEC', { sql: "DELETE FROM metadata WHERE key = 'last_full_sync_time'" });
      location.reload();
    });

    // 3. Page reloads. Database has 1 bookmark, but no sentinel.
    // The logs in the prompt show: "[Sync] Loop aborted: No previous sync found."
    // We want to ASSERT that the sync loop RECOVERS and fetches updates.

    // Mock a NEW bookmark that only a functioning sync loop would catch
    const revivalBookmark = { href: 'https://revival.com', description: 'Revived!', tags: 'life', time: '2023-10-01T14:00:00Z' };
    await app.mockProxy('/posts/all', [revivalBookmark]);

    // If the bug exists, the count will stay 1.
    // If we fix it, the count should become 2.
    await app.expectBookmarkCount(2, { timeout: 20000 });
    await app.getBookmarkItem(0).expectTitle('Revived!');
  });

  test('Scenario 15: The Deletion Exorcism (The Dates Hack)', async ({ page }) => {
    const app = new AppPage(page);
    const dbName = `test-dates-${Math.random().toString(36).substring(7)}.db`;

    const date = '2023-10-01';
    const b1 = { href: 'https://keep.com', description: 'Keep Me', tags: 'test', time: `${date}T12:00:00Z` };
    const b2 = { href: 'https://delete.com', description: 'Delete Me', tags: 'test', time: `${date}T13:00:00Z` };

    await app.mockProxy('/posts/recent', []);
    await app.mockProxy('/posts/all', [b1, b2]);
    await app.mockProxy('/posts/update', { update_time: `${date}T14:00:00Z` });

    // Initial Load: Ingest both bookmarks
    await page.goto(`/?dbName=${dbName}`);
    await app.login('test:TOKEN');
    await expect(page.getByTestId('bookmark-item')).toHaveCount(2, { timeout: 15000 });

    // 1. Mock a DELETION on the server
    // /posts/dates will show only 1 bookmark for this date (Local has 2)
    await app.mockProxy('/posts/dates', { dates: { [date]: '1' } });

    // /posts/get?dt=... will return only the surviving bookmark
    // We use a broader route to avoid issues with parameter ordering
    await app.mockProxy('/posts/get', [b1]);

    // 2. Accelerate the heartbeat and trigger sync
    await page.evaluate(() => {
      (window as any).sync.setInterval(2000);
      (window as any).sync.setDebugCap(0); // Force Deletion Check
      (window as any).sync.setThrottle(100); // Speed up reconciliation
      (window as any).sync.startLoop();
    });

    // 3. Assert that the ghost record (b2) is pruned
    // The list count should drop to 1
    const list = page.getByTestId('bookmark-item');
    await expect(list).toHaveCount(1, { timeout: 20000 });
    await expect(list).toContainText('Keep Me');
    await expect(list).not.toContainText('Delete Me');
  });

  test('Scenario 16: Tag Rename Workaround (Atomic Chain)', async ({ page }) => {
    const app = new AppPage(page);
    const dbName = `test-rename-${Math.random().toString(36).substring(7)}.db`;

    const bookmark = { href: 'https://rename.com', description: 'Rename Me', tags: 'old-tag other', time: '2023-10-01T12:00:00Z' };

    await app.mockProxy('/posts/recent', []);
    await app.mockProxy('/posts/all', [bookmark]);
    await app.mockProxy('/posts/update', { update_time: '2023-10-01T13:00:00Z' });
    await app.mockProxy('/posts/dates', { dates: {} });

    // Mocks for the workaround steps
    // Mock /posts/add and /tags/delete to return raw XML as returned by Pinboard on success
    await page.context().route(url => url.href.includes('/posts/add'), async (r) => {
      await r.fulfill({
        status: 200,
        contentType: 'text/xml',
        body: '<result code="done" />',
      });
    });
    await page.context().route(url => url.href.includes('/tags/delete'), async (r) => {
      await r.fulfill({
        status: 200,
        contentType: 'text/xml',
        body: '<result code="done" />',
      });
    });

    await page.goto(`/?dbName=${dbName}`);
    await app.login('test:TOKEN');
    await expect(page.getByTestId('bookmark-item')).toHaveCount(1, { timeout: 10000 });

    // 1. Initiate Rename Workaround
    await page.evaluate(async () => {
      (window as any).sync.setThrottle(100); // Speed up
      await (window as any).sync.renameTag('old-tag', 'new-tag');
    });

    const list = page.getByTestId('bookmark-item');
    await expect(list).toContainText('new-tag');
    await expect(list).not.toContainText('old-tag');
  });

  test('Scenario 17: Simplified Tag Autocomplete', async ({ page }) => {
    const app = new AppPage(page);
    const dbName = `test-heur-${Math.random().toString(36).substring(7)}.db`;

    await app.mockProxy('/posts/recent', []);
    await app.mockProxy('/posts/all', [
      { href: 'https://example.com/1', description: 'Existing', tags: 'rust programming', time: '2023-10-01T12:00:00Z' }
    ]);
    await app.mockProxy('/posts/update', { update_time: '2023-10-01T13:00:00Z' });
    await app.mockProxy('/posts/dates', { dates: {} });

    await page.goto(`/?dbName=${dbName}`);
    await app.login('test:TOKEN');
    await expect(page.getByTestId('bookmark-item')).toHaveCount(1, { timeout: 10000 });

    // 1. Setup Alias: rust -> system
    await page.evaluate(async () => {
      const db = (window as any).db;
      await db.upsertTagAlias('rust', 'system');
    });

    // 2. Trigger Add Form and type "ru"
    await app.toggleAddButton.click();
    const tagsInput = page.getByTestId('new-tags');
    await tagsInput.click();
    await tagsInput.type('ru');

    // 3. Assert suggestions include Prefix-matched "rust" and the Alias "system" (on full word)
    const datalist = page.locator('#tag-suggestions');
    await expect(datalist.locator('option[value$="rust"]')).toBeAttached({ timeout: 10000 });

    // Type the full word to trigger alias
    await tagsInput.type('st');
    await expect(datalist.locator('option[value$=\"system\"]')).toBeAttached();
  });

  test('Scenario 18: The Virtual Scroll Ritual', async ({ page }) => {
    const app = new AppPage(page);
    await app.goto('/?dbName=test-scroll.db');

    // 1. Inject a large number of bookmarks directly into DB
    const count = 100;
    const bookmarks = Array.from({ length: count }, (_, i) => ({
      href: `https://test-${i}.com`,
      description: `Bookmark ${i}`,
      tags: 'scroll test',
      time: new Date(Date.now() - i * 1000).toISOString()
    }));

    await page.evaluate(async (items) => {
      await window.db.debugClearDb();
      for (const item of items) {
        await window.db.send('LOCAL_UPSERT', item);
      }
      // Ensure "last_full_sync_time" exists to unlock UI
      await window.db.query("INSERT INTO metadata (key, value) VALUES ('last_full_sync_time', ?)", [new Date().toISOString()]);
    }, bookmarks);

    await page.reload();
    // Use an auto-retrying expect to wait for the async ritual
    await expect(app.syncStatus).toHaveText(/Session Restored|Archive Online/, { timeout: 10000 });

    const telemetry = await app.syncStatus.innerText();
    console.log(`Telemetry: ${telemetry}`);

    const container = page.locator('.archive-scroll-container');
    const clientHeight = await container.evaluate(el => el.clientHeight);
    console.log(`Container clientHeight: ${clientHeight}`);

    // 2. Assert that DOM count is small (viewport ~800px, item 120px + buffer = ~15-20 items)
    const list = page.getByTestId('bookmark-item');
    const initialDomCount = await list.count();
    console.log(`Initial DOM count: ${initialDomCount}`);
    expect(initialDomCount).toBeLessThan(30);
    await expect(list.first()).toContainText('Bookmark 0');

    // 3. Scroll to the middle
    await container.evaluate(el => el.scrollTop = 120 * 50); // Scroll to item 50

    // Wait for Elm to catch up
    await page.waitForTimeout(500);

    // 4. Assert that content has shifted but DOM count is still small
    const scrolledDomCount = await list.count();
    console.log(`Scrolled DOM count: ${scrolledDomCount}`);
    expect(scrolledDomCount).toBeLessThan(30);

    // Bookmark 0 should be gone from the entire list
    const content = await list.allTextContents();
    const hasBookmark0 = content.some(t => t.includes('Bookmark 0'));
    const hasBookmark50 = content.some(t => t.includes('Bookmark 50'));

    expect(hasBookmark0).toBe(false);
    expect(hasBookmark50).toBe(true);
  });

  test('Scenario 19: The Empty Search Ritual', async ({ page }) => {
    const app = new AppPage(page);
    await app.goto('/?dbName=test-empty-search.db');

    // 1. Setup DB with some items
    await page.evaluate(async () => {
      await window.db.debugClearDb();
      await window.db.send('LOCAL_UPSERT', { href: 'https://a.com', description: 'Apple', tags: 'fruit', time: new Date().toISOString() });
      await window.db.send('LOCAL_UPSERT', { href: 'https://b.com', description: 'Banana', tags: 'fruit', time: new Date().toISOString() });
      await window.db.query("INSERT INTO metadata (key, value) VALUES ('last_full_sync_time', ?)", [new Date().toISOString()]);
    });

    await page.reload();
    await expect(page.getByTestId('bookmark-item')).toHaveCount(2);

    // 2. Perform a search
    await app.searchInput.fill('Apple');
    await expect(page.getByTestId('bookmark-item')).toHaveCount(1);
    await expect(page.getByTestId('bookmark-item')).toContainText('Apple');

    // 3. Clear search
    await app.searchInput.fill('');
    const list = page.getByTestId('bookmark-item');
    await expect(list).toHaveCount(2);
    const allText = await list.allTextContents();
    expect(allText.some(t => t.includes('Banana'))).toBe(true);
  });

  test('Scenario 20: Safe Recovery from Empty/Invalid Proxy URL', async ({ page }) => {
    const app = new AppPage(page);
    const dbName = `test-invalid-proxy-${Math.random().toString(36).substring(7)}.db`;

    // 1. Set up an invalid proxy URL in the DB metadata
    await page.goto(`/?dbName=${dbName}`);
    await page.evaluate(async () => {
      const db = (window as any).db;
      await db.send('EXEC', {
        sql: "INSERT INTO metadata (key, value) VALUES ('auth_token', 'test:token'), ('proxy_url', 'undefined') ON CONFLICT(key) DO UPDATE SET value=excluded.value"
      });
    });

    // 2. Reload the page - the worker should restore the session and attempt to check for updates,
    // but because base URL is invalid, it should log a "Ritual Void Failure" instead of throwing an unhandled TypeError.
    const consoleMsgs: string[] = [];
    page.on('console', msg => {
      consoleMsgs.push(msg.text());
    });

    await page.reload();

    // The app should boot and not crash the UI (it should restore session and stay online)
    await app.expectOnline();

    // Wait for the worker to process updates check and print the void warning
    await page.waitForTimeout(1000);

    const hasVoidWarning = consoleMsgs.some(m => m.includes('Ritual Void Failure') || m.includes('not a valid absolute URL'));
    expect(hasVoidWarning).toBe(true);
  });

  test('Scenario 21: Error Status Propagation (HTTP 500/522)', async ({ page }) => {
    const app = new AppPage(page);
    const dbName = `test-err-prop-${Math.random().toString(36).substring(7)}.db`;

    // Clear local storage for this origin
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());

    await app.mockProxy('/posts/recent', []);
    await app.mockProxy('/posts/all', []);
    await app.mockProxy('/posts/dates', { dates: {} });

    // Mock /posts/update to return 500 Internal Server Error with custom body
    await page.context().route(url => url.href.includes('/posts/update'), async (r) => {
      await r.fulfill({
        status: 500,
        contentType: 'text/plain',
        body: 'Cloudflare Proxy Error: 522 Origin Connection Timeout',
      });
    });

    await page.goto(`/?dbName=${dbName}`);
    await app.login('test:TOKEN');



    // We expect the status to reflect the error instead of getting stuck on "Syncing..."
    await expect(app.syncStatus).toContainText(/HTTP 500: Cloudflare Proxy Error/, { timeout: 15000 });
  });

  test('Scenario 22: Remote Tag Edit Ingestion', async ({ page }) => {
    const app = new AppPage(page);
    const dbName = `test-remote-tag-${Math.random().toString(36).substring(7)}.db`;

    // Clear local storage for this origin
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());

    const initialBookmark = { href: 'https://edit-tags.com', description: 'Original', tags: 'old-tag', time: '2023-10-01T12:00:00Z' };

    await app.mockProxy('/posts/recent', []);
    await app.mockProxy('/posts/all', [initialBookmark]);
    await app.mockProxy('/posts/update', { update_time: '2023-10-01T13:00:00Z' });
    await app.mockProxy('/posts/dates', { dates: { '2023-10-01': '1' } });

    // 1. Load page and login
    await page.goto(`/?dbName=${dbName}`);
    await app.login('test:TOKEN');
    await app.expectBookmarkCount(1, { timeout: 10000 });
    await app.getBookmarkItem(0).expectTitle('Original');
    // Check old tag is visible
    const item = app.getBookmarkItem(0);
    await item.expectTags(['old-tag']);

    // 2. Mock a tag edit on the server (represented as update_time changing and posts/all returning modified tag)
    const updatedBookmark = { href: 'https://edit-tags.com', description: 'Original', tags: 'new-tag', time: '2023-10-01T12:00:00Z' };
    await app.mockProxy('/posts/update', { update_time: '2023-10-01T14:00:00Z' });
    await app.mockProxy('/posts/all', [updatedBookmark]);

    // Trigger sync
    await page.evaluate(async () => {
      (window as any).sync.setThrottle(100);
      await (window as any).db.send('CHECK_FOR_UPDATES', {
        proxyUrl: (window as any).sync.proxyUrl,
        authToken: (window as any).sync.authToken
      });
    });

    // 3. Verify that the tag updates in the UI
    const row = await page.evaluate(async () => {
      const db = (window as any).db;
      return db.query("SELECT * FROM bookmarks WHERE href = 'https://edit-tags.com'");
    });
    console.log("DB Row after Delta Sync:", JSON.stringify(row));

    await item.expectTags(['new-tag']);
    await item.expectNotTags(['old-tag']);
  });

  test('Scenario 23: Token Persistence Fallback (Transient Storage)', async ({ page }) => {
    const app = new AppPage(page);
    const dbName = `test-transient-${Math.random().toString(36).substring(7)}.db`;

    await app.mockProxy('/posts/recent', []);
    await app.mockProxy('/posts/all', []);
    await app.mockProxy('/posts/update', { update_time: '2023-10-01T13:00:00Z' });
    await app.mockProxy('/posts/dates', { dates: {} });

    // 1. Initial Login
    await page.goto(`/?dbName=${dbName}`);
    await app.login('test:TOKEN');
    await app.expectOnline();

    // 2. Simulate complete wiping of the DB (transient storage reset on reload)
    await page.evaluate(async () => {
      const db = (window as any).db;
      await db.send('DEBUG_CLEAR_DB');
    });

    // 3. Reload the page
    await page.reload();

    // 4. Assert that the session is restored from localStorage fallback
    await expect(page.getByTestId('login-container')).not.toBeVisible({ timeout: 15000 });
    await app.expectOnline();
  });

  test('Scenario 24: Search Query Clear Scroll Reset', async ({ page }) => {
    const app = new AppPage(page);
    const dbName = `test-scroll-reset-${Math.random().toString(36).substring(7)}.db`;

    // 1. Mock 15 bookmarks to ensure scrollability
    const bookmarks = Array.from({ length: 15 }, (_, i) => ({
      href: `https://test-${i}.com`,
      description: `Bookmark ${i}`,
      tags: i % 2 === 0 ? 'even' : 'odd',
      time: `2023-10-01T12:00:${i.toString().padStart(2, '0')}Z`
    }));

    await app.mockProxy('/posts/recent', []);
    await app.mockProxy('/posts/all', bookmarks);
    await app.mockProxy('/posts/update', { update_time: '2023-10-01T13:00:00Z' });
    await app.mockProxy('/posts/dates', { dates: {} });

    // 2. Login
    await page.goto(`/?dbName=${dbName}`);
    await app.login('test:TOKEN');
    await expect(app.syncStatus).toContainText('Archive Online: 15', { timeout: 10000 });

    // 3. Scroll container down
    const scrollContainer = page.locator('.archive-scroll-container');
    await scrollContainer.evaluate(el => el.scrollTop = 200);
    
    // Verify physical scrollTop is greater than 0
    let scrollTop = await scrollContainer.evaluate(el => el.scrollTop);
    expect(scrollTop).toBeGreaterThan(0);

    // 4. Search for "even"
    await app.search('even');
    
    // ScrollTop should reset to 0
    scrollTop = await scrollContainer.evaluate(el => el.scrollTop);
    expect(scrollTop).toBe(0);

    // 5. Scroll down again on search results
    await scrollContainer.evaluate(el => el.scrollTop = 50);
    scrollTop = await scrollContainer.evaluate(el => el.scrollTop);
    expect(scrollTop).toBeGreaterThan(0);

    // 6. Clear search query
    await app.search('');
    
    // ScrollTop should reset to 0 again
    scrollTop = await scrollContainer.evaluate(el => el.scrollTop);
    expect(scrollTop).toBe(0);
  });
});

