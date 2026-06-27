import { test, expect, Worker } from '@playwright/test';
import { AppPage } from './pom/AppPage';
import { AddForm } from './pom/AddForm';
import fs from 'fs';
import path from 'path';

test.describe('The Universal Fortress', () => {
  test.beforeEach(async ({ page }) => {
    page.on('console', (msg) =>
      console.log(`[BROWSER] ${msg.type()}: ${msg.text()}`)
    );
    page.on('pageerror', (err) =>
      console.log(`[BROWSER ERROR] ${err.message}`)
    );

    // Capture worker console logs and errors explicitly
    page.on('worker', (worker: Worker) => {
      worker.on('console', (msg) =>
        console.log(`[WORKER] ${msg.type()}: ${msg.text()}`)
      );
      worker.on('close', () => console.log(`[WORKER] Closed: ${worker.url()}`));
    });

    // THE OMNISCIENT WIRETAP: Injected before every single test
    await page.addInitScript(() => {
      (window as any).__outboundRpcLog = [];
      const OriginalWorker = window.Worker;
      (window as any).Worker = function (
        scriptURL: string | URL,
        options?: WorkerOptions
      ) {
        const worker = new OriginalWorker(scriptURL, options);
        const originalPost = worker.postMessage.bind(worker);
        worker.postMessage = function (msg: any) {
          (window as any).__outboundRpcLog.push(msg);
          return originalPost(msg);
        };
        return worker;
      };
    });
  });

  test.afterEach(async ({ page }, testInfo) => {
    // If the test already failed for UI reasons, don't clutter the logs
    if (testInfo.status !== 'passed' && testInfo.status !== 'skipped') return;

    // Retrieve the log of all messages sent to the worker during this test
    const msgs = await page.evaluate<any[]>(
      () => (window as any).__outboundRpcLog || []
    );

    // THE UNIVERSAL LAW: Validate every message against the strict RPC contract
    for (const msg of msgs) {
      expect(msg).toHaveProperty('type');
      expect(typeof msg.type).toBe('string');

      // All Phase 5.0 messages MUST have an ID for the RPC correlation loop
      expect(msg).toHaveProperty('id');
      expect(typeof msg.id).toBe('string');

      switch (msg.type) {
        case 'RPC_FETCH':
          expect(msg.payload).toMatchObject({
            proxyUrl: expect.any(String),
            path: expect.any(String),
            params: expect.any(Object), // The precise fix you implemented!
          });
          break;
        case 'RPC_SQL_QUERY':
        case 'RPC_SQL_EXEC':
          expect(msg.payload).toMatchObject({
            sql: expect.any(String),
            bind: expect.any(Array),
          });
          break;
        case 'RPC_SQL_TRANSACTION':
          expect(Array.isArray(msg.payload)).toBe(true);
          if (msg.payload.length > 0) {
            expect(msg.payload[0]).toMatchObject({
              sql: expect.any(String),
              bind: expect.any(Array),
            });
          }
          break;
        case 'START_HYDRATION':
          expect(msg.payload).toMatchObject({
            proxyUrl: expect.any(String),
            authToken: expect.any(String),
          });
          break;
        // ----------------------------------------------------------------
        // THE LEGACY EXEMPTION ZONE (Phase 5.0 Transition)
        // Accept these without strict schema checks until they are migrated
        // to pure RPC commands and subsequently deleted.
        // ----------------------------------------------------------------
        case 'GET_POPULAR_TAGS':
        case 'CHECK_FOR_UPDATES':
        case 'QUERY_ALL':
        case 'QUERY_SEARCH':
        case 'LOCAL_UPSERT':
        case 'LOCAL_DELETE':
        case 'INIT':
        case 'DEBUG_CLEAR_DB':
        case 'EXEC':
        case 'QUERY':
        case 'UPSERT_TAG_ALIAS':
        case 'RENAME_TAG':
        case 'START_SYNC_LOOP':
        case 'SET_SYNC_INTERVAL':
        case 'SET_THROTTLE':
        case 'SET_DEBUG_CAP':
          break;
        default:
          throw new Error(
            `[CONTRACT VIOLATION] Unknown message type sent to Worker: ${msg.type}`
          );
      }
    }
  });

  test('Smoke Test: App Loads and shows Login', async ({ page }) => {
    const app = new AppPage(page);
    await app.goto();

    await expect(app.loginContainer).toBeVisible();
    await expect(app.authTokenInput).toBeVisible();
    await expect(app.syncButton).toBeVisible();
  });

  test('Scenario 1: The First Awakening (Bootstrap Sync Attempt)', async ({
    page,
  }) => {
    const app = new AppPage(page);

    // Mock Proxy calls
    await app.mockProxy('/posts/recent', [
      {
        href: 'https://example.com/1',
        description: 'Bookmark 1',
        tags: 'tag1',
        time: '2023-10-01T12:00:00Z',
      },
      {
        href: 'https://example.com/2',
        description: 'Bookmark 2',
        tags: 'tag2',
        time: '2023-10-01T12:01:00Z',
      },
    ]);

    // Mock /posts/all as well since worker.ts currently uses it for hydration
    await app.mockProxy('/posts/all', [
      {
        href: 'https://example.com/1',
        description: 'Bookmark 1',
        tags: 'tag1',
        time: '2023-10-01T12:00:00Z',
      },
      {
        href: 'https://example.com/2',
        description: 'Bookmark 2',
        tags: 'tag2',
        time: '2023-10-01T12:01:00Z',
      },
    ]);

    await app.goto();
    await app.login('test:TOKEN');

    // Assert that the list eventually shows the items
    const list = page.getByTestId('bookmark-item');
    await expect(list).toHaveCount(2, { timeout: 10000 });
    await expect(list.first()).toContainText('Bookmark 2'); // Sorted by time DESC
  });

  test('Scenario 3: The Punctuation Paradox (Exact Tag Matching)', async ({
    page,
  }) => {
    const app = new AppPage(page);
    const dbName = `test-punct-${Math.random().toString(36).substring(7)}.db`;

    // Rigorous Data: Testing space-padding and complex delimiters
    const bookmarks = [
      {
        href: '1',
        description: 'Target',
        tags: 'subject:cs.AI tui',
        time: '2023-10-01T12:00:00Z',
      },
      {
        href: '2',
        description: 'False Positive 1',
        tags: 'subject:cs.AI:ext',
        time: '2023-10-01T12:01:00Z',
      },
      {
        href: '3',
        description: 'False Positive 2',
        tags: 'not:subject:cs.AI',
        time: '2023-10-01T12:02:00Z',
      },
      {
        href: '4',
        description: 'Partial Match',
        tags: 'cs.AI',
        time: '2023-10-01T12:03:00Z',
      },
    ];

    await app.mockProxy('/posts/recent', []);
    await app.mockProxy('/posts/all', bookmarks);
    await app.mockProxy('/posts/update', {
      update_time: '2023-10-01T12:00:00Z',
    });
    await app.mockProxy('/posts/dates', { dates: {} });

    await page.goto(`/?dbName=${dbName}`);
    await app.login('test:TOKEN');
    await expect(page.getByTestId('bookmark-item')).toHaveCount(4, {
      timeout: 10000,
    });

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

  test('Scenario 6: The Offline Fortress (Persistence)', async ({
    page,
    context,
  }) => {
    const app = new AppPage(page);
    const addForm = new AddForm(page);

    await app.mockProxy('/posts/recent', []);
    await app.mockProxy('/posts/all', []);
    await app.mockProxy('/posts/update', {
      update_time: new Date().toISOString(),
    });
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
    await addForm.fill(
      'https://offline.com',
      'Offline Bookmark',
      'offline test'
    );
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

  test('Scenario 7: The Upstream Flush (Reconnection)', async ({
    page,
    context,
  }) => {
    const app = new AppPage(page);
    const addForm = new AddForm(page);

    await app.mockProxy('/posts/recent', []);
    await app.mockProxy('/posts/all', []);
    await app.mockProxy('/posts/update', {
      update_time: new Date().toISOString(),
    });
    await app.mockProxy('/posts/dates', { dates: {} });
    // Mock /posts/add to return raw XML as returned by Pinboard on success
    await page.context().route(
      (url) => url.href.includes('/posts/add'),
      async (r) => {
        await r.fulfill({
          status: 200,
          contentType: 'text/xml',
          body: '<result code="done" />',
        });
      }
    );

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

    // 2. Go Online — then trigger ManualRefresh (↻) to kick the flush loop
    await context.setOffline(false);
    await page.getByTitle('Force Sync').click();

    // Assert that the pending icon disappears within the flush window
    await item.expectPending(false, { timeout: 20000 });
  });

  test('Scenario 11: Search Persistence during Sync', async ({ page }) => {
    const app = new AppPage(page);

    // Initial State: 2 bookmarks
    const initialBookmarks = [
      {
        href: 'https://a.com',
        description: 'Apple',
        tags: 'fruit',
        time: '2023-10-01T12:00:00Z',
      },
      {
        href: 'https://b.com',
        description: 'Banana',
        tags: 'fruit',
        time: '2023-10-01T12:01:00Z',
      },
    ];

    await app.mockProxy('/posts/recent', []);
    await app.mockProxy('/posts/all', initialBookmarks);
    await app.mockProxy('/posts/update', {
      update_time: '2023-10-01T13:00:00Z',
    });
    await app.mockProxy('/posts/dates', { dates: {} });

    await app.goto();
    await app.login('test:TOKEN');
    await expect(page.getByTestId('bookmark-item')).toHaveCount(2, {
      timeout: 10000,
    });

    // 1. Perform Search for "Apple"
    await app.search('Apple');
    await expect(page.getByTestId('bookmark-item')).toHaveCount(1);
    await expect(page.getByTestId('bookmark-item')).toContainText('Apple');

    // 2. Force a sync via ManualRefresh (↻) — the Elm heartbeat must not clear the active search
    const newBookmark = {
      href: 'https://c.com',
      description: 'Cherry',
      tags: 'fruit',
      time: '2023-10-01T12:02:00Z',
    };
    await app.mockProxy('/posts/update', {
      update_time: '2023-10-01T14:00:00Z',
    });
    await app.mockProxy('/posts/all', [newBookmark]);
    await page.getByTitle('Force Sync').click();

    // If the bug exists, the list will show 3 items because search was cleared during sync.
    // We assert it stays at 1 — Cherry should NOT appear since search is "Apple".
    const list = page.getByTestId('bookmark-item');
    await expect(list).toHaveCount(1, { timeout: 20000 });
    await expect(list).toContainText('Apple');
  });

  test('Scenario 12: Deep Link Refresh (Persistence)', async ({ page }) => {
    const app = new AppPage(page);
    const dbName = `test-deep-${Math.random().toString(36).substring(7)}.db`;

    const bookmarks = [
      {
        href: 'https://year.com',
        description: 'Yearly Review',
        tags: 'year',
        time: '2023-10-01T12:00:00Z',
      },
      {
        href: 'https://other.com',
        description: 'Other',
        tags: 'other',
        time: '2023-10-01T12:01:00Z',
      },
    ];

    await app.mockProxy('/posts/recent', []);
    await app.mockProxy('/posts/all', bookmarks);
    await app.mockProxy('/posts/update', {
      update_time: '2023-10-01T13:00:00Z',
    });
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

  // PHASE 5.2: Elm Time.every heartbeat will replace the JS sync loop.
  // Re-enable once the Sovereign State Machine drives the sync cycle.
  test('Scenario 13: The Heartbeat Ritual (Autosync Verification)', async ({
    page,
  }) => {
    // ── Purpose ────────────────────────────────────────────────────────────────
    // Verifies that the automatic heartbeat (Time.every 60s in Main.elm) picks up
    // a new bookmark from the server WITHOUT the user clicking refresh.
    //
    // Previously skipped because the old window.sync.setInterval() API was deleted
    // when the JS timer was replaced with Elm-native Time.every.
    //
    // Fix: use Playwright's page.clock API to synthetically advance the browser
    // clock past 60 000ms, triggering the Elm Tick subscription and the
    // hb-update → delta sync cycle — no waiting, no real timers.
    // ──────────────────────────────────────────────────────────────────────────

    const app = new AppPage(page);
    const INITIAL_SYNC_TIME = '2023-10-01T12:00:00Z';
    const SERVER_UPDATE_TIME = '2023-10-01T13:00:00Z'; // ahead → triggers delta

    // Install fake clock BEFORE page load so Elm's setInterval is captured.
    // We pin the initial time so Date.now() is deterministic.
    await page.clock.install({ time: new Date(INITIAL_SYNC_TIME).getTime() });

    // Seed mocks: initial state is 1 bookmark, server is "up to date"
    await app.mockProxy('/posts/update', { update_time: INITIAL_SYNC_TIME });
    await app.mockProxy('/posts/all', [
      {
        href: 'https://pulse.com',
        description: 'Pulse 1',
        tags: 'test',
        time: INITIAL_SYNC_TIME,
      },
    ]);
    await app.mockProxy('/posts/dates', { dates: {} });

    await app.goto();
    await app.login('test:TOKEN');

    // Wait for the initial sync to complete — 1 bookmark loaded
    await expect(page.getByTestId('bookmark-item')).toHaveCount(1, {
      timeout: 15000,
    });

    // A new bookmark appears on the server between heartbeats.
    // Re-route /posts/update to return the newer time → triggers delta sync.
    // Re-route /posts/all to return the new bookmark.
    await page.context().unroute((url) => url.href.includes('/posts/update'));
    await page.context().route(
      (url) => url.href.includes('/posts/update'),
      async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ update_time: SERVER_UPDATE_TIME }),
        });
      }
    );

    await page.context().unroute((url) => url.href.includes('/posts/all'));
    await page.context().route(
      (url) => url.href.includes('/posts/all'),
      async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify([
            {
              href: 'https://pulse2.com',
              description: 'Pulse 2',
              tags: 'test',
              time: SERVER_UPDATE_TIME,
            },
          ]),
        });
      }
    );

    // Fast-forward 61 seconds — fires the Elm Time.every (60 * 1000) Tick subscription.
    // This triggers hb-update → /posts/update returns SERVER_UPDATE_TIME →
    // handleHeartbeatUpdate sees serverTime != lastSyncTime → delta sync fires.
    await page.clock.fastForward(61_000);

    // The new bookmark should now appear automatically — no user action required.
    const list = page.getByTestId('bookmark-item');
    await expect(list).toHaveCount(2, { timeout: 10000 });
    await expect(list.first()).toContainText('Pulse 2');
  });

  test('Scenario 14: The Zombie Database (Self-Healing Sync)', async ({
    page,
  }) => {
    const app = new AppPage(page);
    const dbName = `test-zombie-${Math.random().toString(36).substring(7)}.db`;

    // 1. Setup a "Zombie" state: Data exists, but NO sync sentinel
    await app.mockProxy('/posts/recent', []);
    await app.mockProxy('/posts/all', [
      {
        href: 'https://zombie.com',
        description: 'Zombie Bookmark',
        tags: 'undead',
        time: '2023-10-01T12:00:00Z',
      },
    ]);

    // We mock /posts/update to see if the app tries to sync after healing
    await app.mockProxy('/posts/update', {
      update_time: '2023-10-01T13:00:00Z',
    });
    await app.mockProxy('/posts/dates', { dates: {} });

    await page.goto(`/?dbName=${dbName}`);
    await app.login('test:TOKEN');

    // Wait for initial sync to "complete" (ingest data)
    await app.expectBookmarkCount(1, { timeout: 10000 });

    // 2. SIMULATE ZOMBIE STATE: Manually clear the sync sentinel in metadata
    await page.evaluate(async () => {
      const db = (window as any).db;
      // This mimics an interrupted sync where data was written but sentinel wasn't
      await db.send('EXEC', {
        sql: "DELETE FROM metadata WHERE key = 'last_full_sync_time'",
      });
      location.reload();
    });

    // 3. Page reloads. Database has 1 bookmark, but no sentinel.
    // The logs in the prompt show: "[Sync] Loop aborted: No previous sync found."
    // We want to ASSERT that the sync loop RECOVERS and fetches updates.

    // Mock a NEW bookmark that only a functioning sync loop would catch
    const revivalBookmark = {
      href: 'https://revival.com',
      description: 'Revived!',
      tags: 'life',
      time: '2023-10-01T14:00:00Z',
    };
    await app.mockProxy('/posts/all', [revivalBookmark]);

    // If the bug exists, the count will stay 1.
    // If we fix it, the count should become 2.
    await app.expectBookmarkCount(2, { timeout: 20000 });
    await app.getBookmarkItem(0).expectTitle('Revived!');
  });

  test('Scenario 15: The Deletion Exorcism (The Dates Hack)', async ({
    page,
  }) => {
    const app = new AppPage(page);
    const dbName = `test-dates-${Math.random().toString(36).substring(7)}.db`;

    const date = '2023-10-01';
    const b1 = {
      href: 'https://keep.com',
      description: 'Keep Me',
      tags: 'test',
      time: `${date}T12:00:00Z`,
    };
    const b2 = {
      href: 'https://delete.com',
      description: 'Delete Me',
      tags: 'test',
      time: `${date}T13:00:00Z`,
    };

    await app.mockProxy('/posts/recent', []);
    await app.mockProxy('/posts/all', [b1, b2]);
    await app.mockProxy('/posts/update', { update_time: `${date}T14:00:00Z` });
    await app.mockProxy('/posts/dates', { dates: { [date]: '2' } });
    await app.mockProxy('/posts/get', [b1, b2]);

    // Initial Load: Ingest both bookmarks
    await page.goto(`/?dbName=${dbName}`);
    await app.login('test:TOKEN');
    await expect(page.getByTestId('bookmark-item')).toHaveCount(2, {
      timeout: 15000,
    });

    // 1. Mock a DELETION on the server
    // /posts/dates will show only 1 bookmark for this date (Local has 2)
    await app.mockProxy('/posts/dates', { dates: { [date]: '1' } });

    // /posts/get?dt=... will return only the surviving bookmark
    // We use a broader route to avoid issues with parameter ordering
    await app.mockProxy('/posts/get', [b1]);

    // 2. Trigger sync via ↻ ManualRefresh — Elm will detect the count mismatch and prune the ghost
    await page.getByTitle('Force Sync').click();

    // 3. Assert that the ghost record (b2) is pruned
    // The list count should drop to 1
    const list = page.getByTestId('bookmark-item');
    await expect(list).toHaveCount(1, { timeout: 20000 });
    await expect(list).toContainText('Keep Me');
    await expect(list).not.toContainText('Delete Me');
  });

  // PHASE 5.4: Tag rename loop moves to Elm pure orchestration.
  // Re-enable once Elm drives the throttled RPC_FETCH chain for /posts/add + /tags/delete.
  test('Scenario 16: Tag Rename Workaround (Atomic Chain)', async ({
    page,
  }) => {
    const app = new AppPage(page);
    const dbName = `test-rename-${Math.random().toString(36).substring(7)}.db`;

    const bookmark = {
      href: 'https://rename.com',
      description: 'Rename Me',
      tags: 'old-tag other',
      time: '2023-10-01T12:00:00Z',
    };

    await app.mockProxy('/posts/recent', []);
    await app.mockProxy('/posts/all', [bookmark]);
    await app.mockProxy('/posts/update', {
      update_time: '2023-10-01T13:00:00Z',
    });
    await app.mockProxy('/posts/dates', { dates: {} });

    // Mocks for the workaround steps
    // Mock /posts/add and /tags/delete to return raw XML as returned by Pinboard on success
    await page.context().route(
      (url) => url.href.includes('/posts/add'),
      async (r) => {
        await r.fulfill({
          status: 200,
          contentType: 'text/xml',
          body: '<result code="done" />',
        });
      }
    );
    await page.context().route(
      (url) => url.href.includes('/tags/delete'),
      async (r) => {
        await r.fulfill({
          status: 200,
          contentType: 'text/xml',
          body: '<result code="done" />',
        });
      }
    );

    await page.goto(`/?dbName=${dbName}`);
    await app.login('test:TOKEN');
    await expect(page.getByTestId('bookmark-item')).toHaveCount(1, {
      timeout: 10000,
    });

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
      {
        href: 'https://example.com/1',
        description: 'Existing',
        tags: 'rust programming',
        time: '2023-10-01T12:00:00Z',
      },
    ]);
    await app.mockProxy('/posts/update', {
      update_time: '2023-10-01T13:00:00Z',
    });
    await app.mockProxy('/posts/dates', { dates: {} });

    await page.goto(`/?dbName=${dbName}`);
    await app.login('test:TOKEN');
    await expect(page.getByTestId('bookmark-item')).toHaveCount(1, {
      timeout: 10000,
    });

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
    await expect(datalist.locator('option[value$="rust"]')).toBeAttached({
      timeout: 10000,
    });

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
      time: new Date(Date.now() - i * 1000).toISOString(),
    }));

    await page.evaluate(async (items) => {
      await window.db.debugClearDb(false);
      for (const item of items) {
        await window.db.send('LOCAL_UPSERT', item);
      }
      // Ensure "last_full_sync_time" exists to unlock UI
      await window.db.query(
        "INSERT INTO metadata (key, value) VALUES ('last_full_sync_time', ?)",
        [new Date().toISOString()]
      );
    }, bookmarks);

    await page.reload();
    // Use an auto-retrying expect to wait for the async ritual
    await expect(app.syncStatus).toHaveText(/Session Restored|Archive Online/, {
      timeout: 10000,
    });

    const telemetry = await app.syncStatus.innerText();
    console.log(`Telemetry: ${telemetry}`);

    const container = page.locator('.archive-scroll-container');
    const clientHeight = await container.evaluate((el) => el.clientHeight);
    console.log(`Container clientHeight: ${clientHeight}`);

    // 2. Assert that DOM count is small (viewport ~800px, item 120px + buffer = ~15-20 items)
    const list = page.getByTestId('bookmark-item');
    const initialDomCount = await list.count();
    console.log(`Initial DOM count: ${initialDomCount}`);
    expect(initialDomCount).toBeLessThan(30);
    await expect(list.first()).toContainText('Bookmark 0');

    // 3. Scroll to the middle
    await container.evaluate((el) => (el.scrollTop = 120 * 50)); // Scroll to item 50

    // Wait for Elm to catch up
    await page.waitForTimeout(500);

    // 4. Assert that content has shifted but DOM count is still small
    const scrolledDomCount = await list.count();
    console.log(`Scrolled DOM count: ${scrolledDomCount}`);
    expect(scrolledDomCount).toBeLessThan(30);

    // Bookmark 0 should be gone from the entire list
    const content = await list.allTextContents();
    const hasBookmark0 = content.some((t) => t.includes('Bookmark 0'));
    const hasBookmark50 = content.some((t) => t.includes('Bookmark 50'));

    expect(hasBookmark0).toBe(false);
    expect(hasBookmark50).toBe(true);
  });

  test('Scenario 19: The Empty Search Ritual', async ({ page }) => {
    const app = new AppPage(page);
    await app.goto('/?dbName=test-empty-search.db');

    // 1. Setup DB with some items
    await page.evaluate(async () => {
      await window.db.debugClearDb(false);
      await window.db.send('LOCAL_UPSERT', {
        href: 'https://a.com',
        description: 'Apple',
        tags: 'fruit',
        time: new Date().toISOString(),
      });
      await window.db.send('LOCAL_UPSERT', {
        href: 'https://b.com',
        description: 'Banana',
        tags: 'fruit',
        time: new Date().toISOString(),
      });
      await window.db.query(
        "INSERT INTO metadata (key, value) VALUES ('last_full_sync_time', ?)",
        [new Date().toISOString()]
      );
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
    expect(allText.some((t) => t.includes('Banana'))).toBe(true);
  });

  test('Scenario 20: Safe Recovery from Empty/Invalid Proxy URL', async ({
    page,
  }) => {
    const app = new AppPage(page);
    const dbName = `test-invalid-proxy-${Math.random().toString(36).substring(7)}.db`;

    // 1. Set up an invalid proxy URL in the DB metadata
    await page.goto(`/?dbName=${dbName}`);
    await page.evaluate(async () => {
      const db = (window as any).db;
      await db.send('EXEC', {
        sql: "INSERT INTO metadata (key, value) VALUES ('auth_token', 'test:token'), ('proxy_url', 'undefined') ON CONFLICT(key) DO UPDATE SET value=excluded.value",
      });
    });

    // 2. Reload the page - the worker should restore the session and attempt to check for updates,
    // but because base URL is invalid, it should log a "Ritual Void Failure" instead of throwing an unhandled TypeError.
    const consoleMsgs: string[] = [];
    page.on('console', (msg) => {
      consoleMsgs.push(msg.text());
    });

    await page.reload();

    // The app should boot and not crash the UI (it should restore session and stay online)
    await app.expectOnline();

    // The app auto-triggers a heartbeat update check on session restore.
    // With an invalid proxy URL, the RPC_FETCH will fail and the worker logs a network error.
    await page.waitForTimeout(2000);

    const hasVoidWarning = consoleMsgs.some(
      (m) =>
        m.includes('RPC_ERROR') ||
        m.includes('NETWORK_ERROR') ||
        m.includes('not a valid absolute URL') ||
        m.includes('Ritual Void Failure')
    );
    expect(hasVoidWarning).toBe(true);
  });

  test('Scenario 21: Error Status Propagation (HTTP 500/522)', async ({
    page,
  }) => {
    const app = new AppPage(page);
    const dbName = `test-err-prop-${Math.random().toString(36).substring(7)}.db`;

    // Clear local storage for this origin
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());

    await app.mockProxy('/posts/recent', []);
    await app.mockProxy('/posts/all', []);
    await app.mockProxy('/posts/dates', { dates: {} });

    // Mock /posts/update to return 500 Internal Server Error with custom body
    await page.context().route(
      (url) => url.href.includes('/posts/update'),
      async (r) => {
        await r.fulfill({
          status: 500,
          contentType: 'text/plain',
          body: 'Cloudflare Proxy Error: 522 Origin Connection Timeout',
        });
      }
    );

    await page.goto(`/?dbName=${dbName}`);
    await app.login('test:TOKEN');
    await app.expectBookmarkCount(0, { timeout: 10000 });

    // Reload the page to trigger session restoration, which auto-triggers the heartbeat check
    await page.reload();

    // We expect the status to reflect the error.
    await expect(app.syncStatus).toContainText(/Error.*HTTP_500|HTTP 500/, {
      timeout: 15000,
    });
  });

  test('Scenario 22: Remote Tag Edit Ingestion', async ({ page }) => {
    const app = new AppPage(page);
    const dbName = `test-remote-tag-${Math.random().toString(36).substring(7)}.db`;

    // Clear local storage for this origin
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());

    const initialBookmark = {
      href: 'https://edit-tags.com',
      description: 'Original',
      tags: 'old-tag',
      time: '2023-10-01T12:00:00Z',
    };

    await app.mockProxy('/posts/recent', []);
    await app.mockProxy('/posts/all', [initialBookmark]);
    await app.mockProxy('/posts/update', {
      update_time: '2023-10-01T13:00:00Z',
    });
    await app.mockProxy('/posts/dates', { dates: { '2023-10-01': '1' } });

    // 1. Load page and login
    await page.goto(`/?dbName=${dbName}`);
    await app.login('test:TOKEN');
    await app.expectBookmarkCount(1, { timeout: 10000 });
    await app.getBookmarkItem(0).expectTitle('Original');
    // Check old tag is visible
    const item = app.getBookmarkItem(0);
    await item.expectTags(['old-tag']);

    // 2. Mock a tag edit on the server and trigger sync via ↻ ManualRefresh
    const updatedBookmark = {
      href: 'https://edit-tags.com',
      description: 'Original',
      tags: 'new-tag',
      time: '2023-10-01T12:00:00Z',
    };
    await app.mockProxy('/posts/update', {
      update_time: '2023-10-01T14:00:00Z',
    });
    await app.mockProxy('/posts/all', [updatedBookmark]);
    await page.getByTitle('Force Sync').click();

    // 3. Wait for the new sync to complete and verify the tag updated in the UI
    await item.expectTags(['new-tag'], { timeout: 20000 });
    await item.expectNotTags(['old-tag']);
  });

  test('Scenario 23: Token Persistence Fallback (Transient Storage)', async ({
    page,
  }) => {
    const app = new AppPage(page);
    const dbName = `test-transient-${Math.random().toString(36).substring(7)}.db`;

    await app.mockProxy('/posts/recent', []);
    await app.mockProxy('/posts/all', []);
    await app.mockProxy('/posts/update', {
      update_time: '2023-10-01T13:00:00Z',
    });
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
    await expect(page.getByTestId('login-container')).not.toBeVisible({
      timeout: 15000,
    });
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
      time: `2023-10-01T12:00:${i.toString().padStart(2, '0')}Z`,
    }));

    await app.mockProxy('/posts/recent', []);
    await app.mockProxy('/posts/all', bookmarks);
    await app.mockProxy('/posts/update', {
      update_time: '2023-10-01T13:00:00Z',
    });
    await app.mockProxy('/posts/dates', { dates: {} });

    // 2. Login
    await page.goto(`/?dbName=${dbName}`);
    await app.login('test:TOKEN');
    await expect(app.syncStatus).toContainText('Archive Online: 15', {
      timeout: 10000,
    });

    // 3. Scroll container down
    const scrollContainer = page.locator('.archive-scroll-container');
    await scrollContainer.evaluate((el) => (el.scrollTop = 200));

    // Verify physical scrollTop is greater than 0
    let scrollTop = await scrollContainer.evaluate((el) => el.scrollTop);
    expect(scrollTop).toBeGreaterThan(0);

    // 4. Search for "even"
    await app.search('even');

    // ScrollTop should reset to 0
    await expect
      .poll(async () => {
        return await scrollContainer.evaluate((el) => el.scrollTop);
      })
      .toBe(0);

    // 5. Scroll down again on search results
    await scrollContainer.evaluate((el) => (el.scrollTop = 50));
    scrollTop = await scrollContainer.evaluate((el) => el.scrollTop);
    expect(scrollTop).toBeGreaterThan(0);

    // 6. Clear search query
    await app.search('');

    // ScrollTop should reset to 0 again
    await expect
      .poll(async () => {
        return await scrollContainer.evaluate((el) => el.scrollTop);
      })
      .toBe(0);
  });

  test('Scenario 25: Debugging Tools and Help Toggle Verification', async ({
    page,
  }) => {
    const app = new AppPage(page);
    const dbName = `test-debug-tools-${Math.random().toString(36).substring(7)}.db`;

    await app.mockProxy('/posts/recent', []);
    await app.mockProxy('/posts/all', [
      {
        href: 'https://test-debug.com',
        description: 'Debug Bookmark',
        tags: 'debug',
        time: '2023-10-01T12:00:00Z',
      },
    ]);
    await app.mockProxy('/posts/update', {
      update_time: '2023-10-01T13:00:00Z',
    });
    await app.mockProxy('/posts/dates', { dates: {} });

    // 1. Initial Load & Login
    await page.goto(`/?dbName=${dbName}`);
    await app.login('test:TOKEN');
    await app.expectBookmarkCount(1, { timeout: 10000 });

    // 2. Verify help button toggles the login container
    const helpBtn = page.locator('#help-toggle-btn');
    await expect(helpBtn).toBeVisible();

    // Login container should be hidden initially when logged in
    await expect(app.loginContainer).not.toBeVisible();

    // Click help toggles it visible
    await helpBtn.click();
    await expect(app.loginContainer).toBeVisible();

    // Verify it displays the version of the PWA
    const pkg = JSON.parse(
      fs.readFileSync(path.join(process.cwd(), 'package.json'), 'utf8')
    );
    const expectedVersion = `v${pkg.version}`;
    const versionTag = page.locator('.version-tag');
    await expect(versionTag).toBeVisible();
    await expect(versionTag).toContainText(expectedVersion);

    // Click help again toggles it hidden
    await helpBtn.click();
    await expect(app.loginContainer).not.toBeVisible();

    // 3. Verify window.db is exposed and works
    const dbResult = await page.evaluate(async () => {
      return await (window as any).db.query(
        "SELECT description FROM bookmarks WHERE tags = 'debug'"
      );
    });
    expect(dbResult).toEqual([{ description: 'Debug Bookmark' }]);

    // 4. Verify refreshApp() works
    // Let's modify the local database manually and verify refreshApp pulls updates
    await page.evaluate(async () => {
      await (window as any).db.query(
        "UPDATE bookmarks SET description = 'Refreshed' WHERE tags = 'debug'"
      );
      await (window as any).refreshApp();
    });
    const reloadedItem = app.getBookmarkItem(0);
    await reloadedItem.expectTitle('Refreshed');

    // 5. Verify debugClearDb() resets back to login state
    // We register the mock for initial boot again because it will reload the page
    await app.mockProxy('/posts/recent', []);
    await app.mockProxy('/posts/all', []);
    await app.mockProxy('/posts/update', {
      update_time: '2023-10-01T13:00:00Z',
    });
    await app.mockProxy('/posts/dates', { dates: {} });

    await page.evaluate(async () => {
      await (window as any).db.debugClearDb();
    });

    // Page should reload and we should see the login container open by default
    await expect(app.loginContainer).toBeVisible({ timeout: 15000 });
  });

  test('Scenario 26: RPC Error Recovery (Resilient Propagation)', async ({
    page,
  }) => {
    const app = new AppPage(page);
    const dbName = `test-err-recovery-${Math.random().toString(36).substring(7)}.db`;

    await app.mockProxy('/posts/recent', []);
    await app.mockProxy('/posts/all', [
      {
        href: 'https://test-err.com',
        description: 'Err Bookmark',
        tags: 'err',
        time: '2023-10-01T12:00:00Z',
      },
    ]);
    await app.mockProxy('/posts/update', {
      update_time: '2023-10-01T13:00:00Z',
    });
    await app.mockProxy('/posts/dates', { dates: {} });

    // 1. Initial Load & Login
    await page.goto(`/?dbName=${dbName}`);
    await app.login('test:TOKEN');
    await app.expectBookmarkCount(1, { timeout: 10000 });

    // 2. Simulate proxy failure by routing /posts/update to return 500 error
    await page.context().route(
      (url) => url.href.includes('/posts/update'),
      async (route) => {
        await route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({ message: 'Internal Server Error' }),
        });
      }
    );

    // 3. Click Force Sync to trigger sync check
    await page.getByTitle('Force Sync').click();

    // 4. Verify sync status surfaces the error contract properly
    const syncStatus = page.getByTestId('sync-status');
    await expect(syncStatus).toContainText('Error (HTTP_500)', {
      timeout: 10000,
    });

    // 5. Verify the app remains usable and doesn't freeze/go blank
    await page.locator('#toggle-add-btn').click();
    await expect(page.getByTestId('add-form')).toBeVisible();

    // Check we can search and read list
    await page.getByTestId('search-input').fill('Err Bookmark');
    await app.expectBookmarkCount(1);
  });

  test('Scenario 27: The Cache-Busting Offline Trap (Worker Assassination)', async ({
    page,
  }) => {
    const app = new AppPage(page);

    // 1. Initial Load: Boot the app.
    await app.goto('/');

    // 2. Guarantee the SW is active and controlling the page.
    await page.evaluate(async () => {
      await navigator.serviceWorker.ready;
      // Brief pause to ensure clients.claim() has taken full effect
      await new Promise((r) => setTimeout(r, 500));
    });

    // 3. Second Load: Now the SW is in control.
    // It intercepts `sync-worker.js?v=1` and caches it via Strategy B.
    await page.reload();
    await expect(app.loginContainer).toBeVisible();

    // 4. The Assassination: We intercept the exact worker request and kill it.
    // This forces the Service Worker into the `.catch()` block.
    await page.route('**/sync-worker.js*', (route) => {
      console.log(
        `[TEST] Forcing network failure for: ${route.request().url()}`
      );
      route.abort('failed');
    });

    // 5. The Trigger: Reload. app.js asks for `sync-worker.js?v=2`.
    // The network fails. The SW checks the cache for `v=2`. It misses.
    // The SW returns a 503 text response. The browser refuses to boot the worker.
    await page.reload();

    // 6. The Assertion: Prove the bug exists by watching the app die.
    // Because the worker never boots, Elm never receives INIT_SUCCESS.
    // The UI should be permanently stuck on the initial state.
    const statusText = page.getByTestId('sync-status');

    // If the bug is ACTIVE, the status will never change from the initial state.
    // Note: We use a short timeout because we EXPECT it to be stuck.
    await expect(statusText).toContainText('Awakening Ritual...', {
      timeout: 3000,
    });

    // (Once we fix the bug, we will change this assertion to expect the login container or online status!)
  });

  test('Scenario 28: The Boundary Contract (Elm -> Worker JSON Verification)', async ({
    page,
  }) => {
    const app = new AppPage(page);

    // 1. The Wiretap: Inject a script to hijack the Web Worker API before Elm boots.
    await page.addInitScript(() => {
      (window as any).__interceptedWorkerMessages = [];
      const OriginalWorker = window.Worker;

      // Explicitly define the parameters to appease the TypeScript compiler.
      // The Worker constructor takes a URL and an optional WorkerOptions object.
      (window as any).Worker = function (
        scriptURL: string | URL,
        options?: WorkerOptions
      ) {
        // Now we pass them cleanly, without the chaotic spread operator.
        const worker = new OriginalWorker(scriptURL, options);
        const originalPost = worker.postMessage.bind(worker);

        // Intercept all outgoing messages from Elm
        worker.postMessage = function (msg: any) {
          (window as any).__interceptedWorkerMessages.push(msg);
          return originalPost(msg);
        };
        return worker;
      };
    });

    // 2. Boot the app and trigger the network
    await app.mockProxy('/posts/recent', []);
    await app.mockProxy('/posts/all', []);
    await app.mockProxy('/posts/update', {
      update_time: '2023-10-01T12:00:00Z',
    });
    await app.mockProxy('/posts/dates', { dates: {} });

    await app.goto('/?dbName=test-contract.db');
    await app.login('test:TOKEN');

    // Trigger a manual heartbeat to force an RPC_FETCH
    await page.getByTitle('Force Sync').click();
    await page.waitForTimeout(500); // Give Elm a moment to dispatch the Cmd

    // Define the strict shapes of the RPC Contract
    interface RpcFetchMessage {
      type: 'RPC_FETCH';
      id: string;
      payload: {
        proxyUrl: string;
        path: string;
        params: Record<string, string>;
      };
    }

    interface GenericWorkerMessage {
      type: string;
      id?: string;
      payload?: any;
    }

    // A Union Type representing everything Elm can send
    type OutboundWorkerMessage = RpcFetchMessage | GenericWorkerMessage;

    // 3. Extract the wiretapped messages, explicitly typing the bridge output
    const msgs = await page.evaluate<OutboundWorkerMessage[]>(() => {
      return (window as any).__interceptedWorkerMessages;
    });

    // 4. THE CONTRACT ASSERTION
    // Use a TypeScript Type Guard `(m): m is RpcFetchMessage` in the filter.
    // This tells the TS Compiler: "If this returns true, treat 'm' exactly as an RpcFetchMessage!"
    const rpcFetchMsgs = msgs.filter(
      (m): m is RpcFetchMessage => m.type === 'RPC_FETCH'
    );
    expect(rpcFetchMsgs.length).toBeGreaterThan(0);

    const fetchMsg = rpcFetchMsgs[0];

    // Now TypeScript provides full autocomplete and safety here!
    // It KNOWS payload.params exists and is a Record<string, string>.
    expect(fetchMsg).toMatchObject({
      type: 'RPC_FETCH',
      id: expect.any(String),
      payload: {
        proxyUrl: expect.any(String),
        path: expect.any(String),
        params: expect.any(Object),
      },
    });

    expect(fetchMsg.payload.params).toHaveProperty('auth_token');
  });

  /**
   * REGRESSION TEST: Delta Sync (The "Dates Hack" Regression)
   *
   * This test ensures that clicking the refresh-btn triggers an incremental
   * update rather than a full import of the entire collection.
   */
  test('Scenario 29: Refresh action should only import new items and NOT flood the Pinboard API', async ({
    page,
  }) => {
    // 1a. Navigation FIRST — use a RANDOM db name per run so OPFS never persists
    // lastSyncTime across runs. A fixed name would cause the second run to restore
    // `lastSyncTime = MOCK_SERVER_TIME`, making serverTime == lastSyncTime and
    // skipping the delta-sync branch entirely.
    const uniqueDb = `test-scenario29-${Date.now()}.db`;
    await page.goto(`http://localhost:5173/?dbName=${uniqueDb}`);

    // 1b. Seed localStorage SECOND
    const MOCK_LAST_SYNC = '2023-10-01T00:00:00Z';
    // NOTE: MOCK_SERVER_TIME must differ from MOCK_LAST_SYNC so `needsSync = true`
    // in handleHeartbeatUpdate (serverTime /= model.lastSyncTime).
    const MOCK_SERVER_TIME = '2025-06-01T00:00:00Z';
    await page.evaluate((timestamp) => {
      localStorage.setItem('fortress_last_sync_date', timestamp);
      localStorage.setItem('pingolin_auth_token', 'test:TOKEN');
      localStorage.setItem('pingolin_proxy_url', 'https://pinboard.net/api');
      localStorage.setItem('pingolin_hydrated', 'true');
    }, MOCK_LAST_SYNC);

    // 2. Setup interception BEFORE reload to capture the automatic sync on boot
    let pinboardRequestCount = 0;
    let dateFilterSent = false;

    // Use page.context().route to intercept requests and print URLs for debugging
    await page.context().route(
      (url) => url.href.includes('pinboard.net/api'),
      async (route) => {
        const urlStr = route.request().url();
        console.log(`[TEST INTERCEPT] Intercepted Pinboard API request: ${urlStr}`);
        pinboardRequestCount++;

        // Verify the "Dates Hack": The request MUST contain the date filter parameter.
        // If this is missing, the Pinboard API defaults to a full import.
        if (
          urlStr.includes('updated_since=') ||
          urlStr.includes('date=') ||
          urlStr.includes('since=')
        ) {
          dateFilterSent = true;
        }

        // Check the path to return appropriate mock data
        if (urlStr.includes('/posts/update')) {
          // Return a server time well ahead of MOCK_LAST_SYNC so needsSync=true is guaranteed
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({
              update_time: MOCK_SERVER_TIME,
            }),
          });
        } else if (urlStr.includes('/posts/all')) {
          // Delta sync: return exactly ONE item using the Pinboard API format
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify([
              {
                href: 'https://example.com/delta',
                description: 'Delta Item',
                extended: '',
                tags: '',
                time: '2024-01-01T12:00:00Z',
                shared: 'yes',
                toread: 'no',
                meta: '',
              },
            ]),
          });
        } else if (urlStr.includes('/posts/dates')) {
          // Dates Hack: Elm's serverDatesDecoder expects { dates: { "YYYY-MM-DD": "N" } }
          // with STRING values (not ints). Matching the one delta item keeps localC == serverC → no prune.
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({ dates: { '2024-01-01': '1' } }),
          });
        } else if (urlStr.includes('/posts/get')) {
          // Dates Hack day-check: confirm the delta item exists on the server for this date
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({
              posts: [
                {
                  href: 'https://example.com/delta',
                  description: 'Delta Item',
                  time: '2024-01-01T12:00:00Z',
                },
              ],
            }),
          });
        } else {
          // Fallback: empty success
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({}),
          });
        }
      }
    );

    // 3. Reload to apply seeded localStorage and start the sync
    await page.reload();

    // 4. Wait for the login form to disappear (session restored)
    await expect(page.getByTestId('login-container')).not.toBeVisible();

    // 5. Action: click the refresh button in Main.elm to verify it is active
    await page.click('.refresh-btn');

    // 6. Print debug logs of messages sent to the worker
    const msgs = await page.evaluate<any[]>(
      () => (window as any).__outboundRpcLog || []
    );
    console.log(`[TEST DEBUG] Outbound messages to worker: ${JSON.stringify(msgs, null, 2)}`);

    // 6b. assertion: Verify the "Dates Hack" was actually used.
    expect(
      dateFilterSent,
      'REGRESSION: Refresh request sent WITHOUT date filter. Pinboard API will return all items!'
    ).toBe(true);

    // 7. assertion: Verify the request count.
    // A full delta sync cycle makes ~6 legitimate requests:
    //   hb-update check × 2, posts/all (delta), posts/dates, posts/get (day check), hb-update post-sync.
    // A full import of 23k links would be dozens of paginated requests.
    // Threshold is set comfortably above the legitimate cycle count.
    expect(
      pinboardRequestCount,
      `FLOOD DETECTED: ${pinboardRequestCount} requests sent. Delta sync failed!`
    ).toBeLessThan(10);

    // 8. Log UI state for diagnostics (not asserted — the status oscillates due to the 60s heartbeat
    // cycling through "Checking for updates..." → "Synchronized." in quick succession).
    const statusAtEnd = await page.locator('.status-chamber').innerText().catch(() => '<not visible>');
    const itemsAtEnd = await page.locator('.bookmark-shrine').count();

    console.log(
      `Delta sync verified: ${pinboardRequestCount} requests, date filter used: ${dateFilterSent}.\n` +
      `UI status at assertion time: "${statusAtEnd}", bookmark count: ${itemsAtEnd}`
    );
  });

  test('Scenario 30: The DB Session Restore Contract (Cold Boot from OPFS Metadata)', async ({
    page,
  }) => {
    // ── Purpose ────────────────────────────────────────────────────────────────
    // This test exercises the REAL session restore path: worker reads
    // last_full_sync_time from OPFS metadata on INIT, not from the
    // app.js localStorage bypass. This is the critical path changed by the
    // TS migration (sync-worker.ts line ~237).
    //
    // If the metadata key name changed, or the SQL query broke silently,
    // SESSION_RESTORED would fire with lastSync="" → handleHeartbeatUpdate
    // would trigger START_HYDRATION (full re-import of 23k links) instead of
    // the delta sync path. This test catches that regression.
    // ──────────────────────────────────────────────────────────────────────────

    const KNOWN_LAST_SYNC = '2024-03-15T10:00:00Z';
    const MOCK_SERVER_TIME = '2024-03-16T09:00:00Z'; // ahead of KNOWN_LAST_SYNC → delta sync
    const uniqueDb = `test-scenario30-${Date.now()}.db`;

    // ── Phase 1: Bootstrap a fresh DB with known metadata ──────────────────
    // Navigate to seed the DB, login, then write metadata directly via the
    // RPC_SQL_EXEC channel so the worker's OPFS file has real persisted state.
    await page.goto(`http://localhost:5173/?dbName=${uniqueDb}`);
    await page.evaluate(() => {
      localStorage.setItem('pingolin_auth_token', 'test:TOKEN');
      localStorage.setItem('pingolin_proxy_url', 'https://pinboard.net/api');
      localStorage.setItem('pingolin_hydrated', 'true');
    });

    // Clear any routes registered by prior tests in this context before seeding
    await page.context().unroute((url) => url.href.includes('pinboard.net/api'));

    // Intercept all Pinboard API calls during seeding — return empty/stable mocks
    await page.context().route(
      (url) => url.href.includes('pinboard.net/api'),
      async (route) => {
        const url = route.request().url();
        if (url.includes('/posts/update')) {
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({ update_time: KNOWN_LAST_SYNC }),
          });
        } else if (url.includes('/posts/dates')) {
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({ dates: {} }),
          });
        } else {
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify([]),
          });
        }
      }
    );

    // Reload to bootstrap the DB via INIT
    await page.reload();
    await expect(page.getByTestId('login-container')).not.toBeVisible({ timeout: 10000 });

    // Seed the metadata row directly via window.db (DatabaseBridge exposed by app.js).
    // This simulates what a real completed sync would have written to the DB.
    const seededValue = await page.evaluate(async (lastSync) => {
      // Write the anchor
      await (window as any).db.send('RPC_SQL_EXEC', {
        sql: "INSERT INTO metadata (key, value) VALUES ('last_full_sync_time', ?), ('last_sync_time', ?) ON CONFLICT(key) DO UPDATE SET value=excluded.value",
        bind: [lastSync, lastSync],
      });
      // Read it back to confirm the write landed in OPFS
      const rows = await (window as any).db.send('QUERY', {
        sql: "SELECT value FROM metadata WHERE key = 'last_full_sync_time'",
        bind: [],
      });
      return rows?.[0]?.value ?? null;
    }, KNOWN_LAST_SYNC);

    // Guard: if the write didn't land, the test setup itself is broken
    if (seededValue !== KNOWN_LAST_SYNC) {
      throw new Error(
        `[Scenario 30 Setup] Metadata write failed! Expected "${KNOWN_LAST_SYNC}", ` +
        `got "${seededValue}". The window.db bridge may not be reaching the correct worker.`
      );
    }

    // ── Phase 2: Cold boot — verify SESSION_RESTORED carries the DB value ──
    // Ensure the app.js localStorage bypass is NOT active — real worker path only.
    await page.evaluate(() => {
      localStorage.removeItem('fortress_last_sync_date');
    });

    // Track outbound RPC messages on the NEXT page load via the wiretap.
    // If SESSION_RESTORED fires with lastSync="", Elm sends START_HYDRATION.
    // If it fires with lastSync=KNOWN_LAST_SYNC, Elm sends hb-delta-fetch with fromdt/since.
    let startHydrationSent = false;
    let deltaFetchSent = false;
    let deltaFetchParams: Record<string, string> = {};

    // Update the intercept so /posts/update returns the NEWER server time
    await page.context().unroute((url) => url.href.includes('pinboard.net/api'));
    await page.context().route(
      (url) => url.href.includes('pinboard.net/api'),
      async (route) => {
        const url = route.request().url();
        if (url.includes('/posts/update')) {
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({ update_time: MOCK_SERVER_TIME }),
          });
        } else if (url.includes('/posts/all')) {
          // Capture whether fromdt/since params are present
          const parsedUrl = new URL(url);
          deltaFetchSent = true;
          deltaFetchParams = Object.fromEntries(parsedUrl.searchParams.entries());
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify([]),
          });
        } else if (url.includes('/posts/dates')) {
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({ dates: {} }),
          });
        } else {
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({}),
          });
        }
      }
    );

    // Cold boot — NO fortress_last_sync_date in localStorage
    await page.reload();
    await expect(page.getByTestId('login-container')).not.toBeVisible({ timeout: 10000 });

    // Inspect the outbound RPC log after boot settles
    await page.waitForTimeout(3000); // allow heartbeat + delta fetch to complete
    const msgs = await page.evaluate<any[]>(() => (window as any).__outboundRpcLog || []);

    // ── Assertions ─────────────────────────────────────────────────────────

    // 1. START_HYDRATION must NOT have been sent — that would mean lastSync="" (DB read failed)
    startHydrationSent = msgs.some((m) => m.type === 'START_HYDRATION');
    expect(
      startHydrationSent,
      'REGRESSION: START_HYDRATION fired — DB metadata read failed, lastSync="" on cold boot!'
    ).toBe(false);

    // 2. A delta fetch (hb-delta-fetch) MUST have been sent — proves lastSync was restored
    expect(
      deltaFetchSent,
      'REGRESSION: No delta fetch fired — SESSION_RESTORED did not carry lastSync from DB'
    ).toBe(true);

    // 3. The delta fetch MUST carry the correct date filter from the DB
    expect(
      deltaFetchParams['fromdt'] || deltaFetchParams['since'],
      `REGRESSION: Delta fetch had no date filter. Params were: ${JSON.stringify(deltaFetchParams)}`
    ).toBe(KNOWN_LAST_SYNC);

    console.log(
      `Scenario 30 passed: DB session restore verified.\n` +
      `lastSync restored from OPFS: ${deltaFetchParams['fromdt'] || deltaFetchParams['since']}`
    );
  });

  test('Scenario 32: The Metadata Write Contract (Delta Sync Persists New Anchor)', async ({
    page,
  }) => {
    // ── Purpose ────────────────────────────────────────────────────────────────
    // Companion to Scenario 30. That test proved the READ path; this proves WRITE.
    //
    // After a delta sync completes, the new serverTime MUST be persisted to OPFS
    // so the next cold boot SESSION_RESTORED carries the UPDATED anchor — not the
    // stale original. Without this, every cold boot re-triggers the same delta
    // sync from the original date (infinite repeated work).
    //
    // The bug vector: Main.elm delta sync transaction writes 'last_sync_time' but
    // sync-worker.ts INIT reads 'last_full_sync_time'. If these stay mismatched,
    // SESSION_RESTORED always sends the old anchor → perpetual delta loop.
    // ──────────────────────────────────────────────────────────────────────────

    const ORIGINAL_SYNC = '2024-03-15T10:00:00Z';
    const SERVER_TIME   = '2024-06-01T00:00:00Z'; // newer → triggers delta
    const uniqueDb = `test-scenario32-${Date.now()}.db`;

    // ── Phase 1: Seed DB with a known last_full_sync_time ──────────────────
    await page.goto(`http://localhost:5173/?dbName=${uniqueDb}`);
    await page.evaluate(() => {
      localStorage.setItem('pingolin_auth_token', 'test:TOKEN');
      localStorage.setItem('pingolin_proxy_url', 'https://pinboard.net/api');
      localStorage.setItem('pingolin_hydrated', 'true');
    });

    await page.context().route(
      (url) => url.href.includes('pinboard.net/api'),
      async (route) => {
        const url = route.request().url();
        if (url.includes('/posts/update')) {
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            // Phase 1: server matches original — no delta triggered yet
            body: JSON.stringify({ update_time: ORIGINAL_SYNC }),
          });
        } else if (url.includes('/posts/dates')) {
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({ dates: {} }),
          });
        } else {
          await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([]) });
        }
      }
    );

    await page.reload();
    await expect(page.getByTestId('login-container')).not.toBeVisible({ timeout: 10000 });

    // Seed the original anchor into OPFS metadata
    await page.evaluate(async (ts) => {
      await (window as any).db.send('RPC_SQL_EXEC', {
        sql: "INSERT INTO metadata (key, value) VALUES ('last_full_sync_time', ?), ('last_sync_time', ?) ON CONFLICT(key) DO UPDATE SET value=excluded.value",
        bind: [ts, ts],
      });
    }, ORIGINAL_SYNC);

    // ── Phase 2: Trigger a delta sync (server time advanced) ──────────────
    // Update the mock so /posts/update returns the newer SERVER_TIME.
    // This drives handleHeartbeatUpdate → delta branch → hb-delta-tx writes
    // last_sync_time = SERVER_TIME.
    await page.context().unroute((url) => url.href.includes('pinboard.net/api'));
    await page.context().route(
      (url) => url.href.includes('pinboard.net/api'),
      async (route) => {
        const url = route.request().url();
        if (url.includes('/posts/update')) {
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({ update_time: SERVER_TIME }),
          });
        } else if (url.includes('/posts/all')) {
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify([]), // empty delta — no new bookmarks
          });
        } else if (url.includes('/posts/dates')) {
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({ dates: {} }),
          });
        } else {
          await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({}) });
        }
      }
    );

    // Use the fortress_last_sync_date helper to inject ORIGINAL_SYNC as lastSync
    // so Elm's model.lastSyncTime starts from our known anchor
    await page.evaluate((ts) => {
      localStorage.setItem('fortress_last_sync_date', ts);
    }, ORIGINAL_SYNC);

    // Reload to run the delta sync cycle
    await page.reload();
    await expect(page.getByTestId('login-container')).not.toBeVisible({ timeout: 10000 });
    // Wait for the delta sync + metadata write to complete
    await page.waitForTimeout(3000);

    // ── Phase 3: Cold boot — verify SESSION_RESTORED carries SERVER_TIME ──
    // Strip all localStorage overrides — real DB path only
    await page.evaluate(() => {
      localStorage.removeItem('fortress_last_sync_date');
    });

    let coldBootLastSync = '';
    let deltaFiredAgain = false;

    await page.context().unroute((url) => url.href.includes('pinboard.net/api'));
    await page.context().route(
      (url) => url.href.includes('pinboard.net/api'),
      async (route) => {
        const url = route.request().url();
        if (url.includes('/posts/update')) {
          // Return SERVER_TIME again — if SESSION_RESTORED correctly carries SERVER_TIME,
          // then serverTime == lastSyncTime → NO delta, goes to Dates Hack only.
          // If SESSION_RESTORED carries ORIGINAL_SYNC, serverTime != lastSyncTime → delta fires AGAIN.
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({ update_time: SERVER_TIME }),
          });
        } else if (url.includes('/posts/all')) {
          // If this fires, the anchor wasn't updated — the bug is confirmed
          deltaFiredAgain = true;
          const parsedUrl = new URL(url);
          coldBootLastSync = parsedUrl.searchParams.get('fromdt') || parsedUrl.searchParams.get('since') || '';
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify([]),
          });
        } else if (url.includes('/posts/dates')) {
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({ dates: {} }),
          });
        } else {
          await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({}) });
        }
      }
    );

    await page.reload();
    await expect(page.getByTestId('login-container')).not.toBeVisible({ timeout: 10000 });
    await page.waitForTimeout(3000);

    // ── Assertions ─────────────────────────────────────────────────────────

    // After a delta sync, the next cold boot must NOT re-trigger a delta.
    // If deltaFiredAgain=true, the anchor wasn't updated → perpetual re-sync bug.
    expect(
      deltaFiredAgain,
      `REGRESSION: Delta sync fired again on cold boot! ` +
      `The metadata write did not update the session anchor. ` +
      `Session sent fromdt="${coldBootLastSync}" (should have been "${SERVER_TIME}" → no delta needed)`
    ).toBe(false);

    console.log(`Scenario 32 passed: Delta sync metadata write verified. Anchor updated to ${SERVER_TIME}.`);
  });

  test('Scenario 34: The Infinite Loop Prevention Guard (fortress_last_sync_date removeItem)', async ({
    page,
  }) => {
    // ── Purpose ────────────────────────────────────────────────────────────────
    // Guards the localStorage.removeItem('fortress_last_sync_date') call in app.js.
    //
    // The loop: fortress_last_sync_date set → Elm sends hb-update → app.js injects
    // SESSION_RESTORED → handleSessionRestored immediately fires ANOTHER hb-update →
    // app.js sees the key again → injects ANOTHER SESSION_RESTORED → ♾️
    //
    // The fix: app.js calls removeItem BEFORE injecting SESSION_RESTORED, so the
    // very next hb-update finds no key and skips the injection.
    //
    // If someone reverts the removeItem, hb-update count spirals to 10+ in seconds.
    // This test catches that with a 4-second observation window.
    // ──────────────────────────────────────────────────────────────────────────

    const MOCK_LAST_SYNC = '2024-05-01T00:00:00Z';
    const uniqueDb = `test-scenario34-${Date.now()}.db`;

    // Route ALL Pinboard API calls to stable mocks — we don't want real network
    // calls complicating the hb-update count
    await page.context().route(
      (url) => url.href.includes('pinboard.net/api'),
      async (route) => {
        const url = route.request().url();
        if (url.includes('/posts/update')) {
          // Return same time as MOCK_LAST_SYNC → needsSync=false → Dates Hack only.
          // This keeps the delta-sync branch from firing and inflating the count.
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({ update_time: MOCK_LAST_SYNC }),
          });
        } else if (url.includes('/posts/dates')) {
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({ dates: {} }),
          });
        } else {
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({}),
          });
        }
      }
    );

    await page.goto(`http://localhost:5173/?dbName=${uniqueDb}`);

    // Seed the trigger: fortress_last_sync_date in localStorage
    await page.evaluate((ts) => {
      localStorage.setItem('fortress_last_sync_date', ts);
      localStorage.setItem('pingolin_auth_token', 'test:TOKEN');
      localStorage.setItem('pingolin_proxy_url', 'https://pinboard.net/api');
      localStorage.setItem('pingolin_hydrated', 'true');
    }, MOCK_LAST_SYNC);

    await page.reload();
    await expect(page.getByTestId('login-container')).not.toBeVisible({ timeout: 10000 });

    // Observe for 4 seconds — enough for a loop to spiral to 10+ hb-updates if broken
    await page.waitForTimeout(4000);

    // ── Collect evidence ───────────────────────────────────────────────────
    const msgs = await page.evaluate<any[]>(() => (window as any).__outboundRpcLog || []);
    const hbUpdateCount = msgs.filter(
      (m) => m.type === 'RPC_FETCH' && m.id === 'hb-update'
    ).length;

    const keyStillPresent = await page.evaluate(
      () => localStorage.getItem('fortress_last_sync_date') !== null
    );

    console.log(
      `[Scenario 34] hb-update calls in 4s: ${hbUpdateCount}, ` +
      `fortress_last_sync_date still in localStorage: ${keyStillPresent}`
    );

    // ── Assertions ─────────────────────────────────────────────────────────

    // 1. The override key MUST be gone — removeItem must have fired
    expect(
      keyStillPresent,
      'REGRESSION: fortress_last_sync_date still in localStorage after boot! ' +
      'The removeItem guard is missing — infinite SESSION_RESTORED loop is possible.'
    ).toBe(false);

    // 2. hb-update call count must be sane (≤ 4 for a 4s window with 60s heartbeat).
    // An infinite loop would produce 10+ calls within seconds.
    expect(
      hbUpdateCount,
      `REGRESSION: ${hbUpdateCount} hb-update calls in 4s — infinite loop detected! ` +
      `The removeItem guard in app.js is broken.`
    ).toBeLessThanOrEqual(4);
  });

  test('Scenario 31: The Empty LastSync Gate (New Device Gets Full Hydration)', async ({
    page,
  }) => {
    // ── Purpose ────────────────────────────────────────────────────────────────
    // Guards the critical branch in handleHeartbeatUpdate (Main.elm line ~734):
    //
    //   if model.lastSyncTime == "" then START_HYDRATION   ← full import
    //   else                              hb-delta-fetch   ← date-filtered delta
    //
    // Real-world trigger: returning user on a NEW device (or cleared OPFS).
    // Their token is in localStorage but the OPFS DB is empty — no last_full_sync_time.
    // Worker sends SESSION_RESTORED with lastSync="" → Elm must do a full pull.
    //
    // If this gate breaks (e.g. lastSyncTime is somehow non-empty on a fresh DB),
    // the user gets an empty bookmark list and no error — silent data loss.
    // ──────────────────────────────────────────────────────────────────────────

    const MOCK_SERVER_TIME = '2024-09-01T00:00:00Z';
    const uniqueDb = `test-scenario31-${Date.now()}.db`;

    // Track the /posts/all request to verify it has NO date filter
    let postsAllUrl = '';
    let startHydrationSent = false;

    await page.context().route(
      (url) => url.href.includes('pinboard.net/api'),
      async (route) => {
        const url = route.request().url();
        if (url.includes('/posts/update')) {
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({ update_time: MOCK_SERVER_TIME }),
          });
        } else if (url.includes('/posts/all')) {
          postsAllUrl = url; // capture full URL to inspect params
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify([
              {
                href: 'https://hydrated.com',
                description: 'Hydrated Bookmark',
                tags: 'test',
                time: MOCK_SERVER_TIME,
              },
            ]),
          });
        } else if (url.includes('/posts/dates')) {
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({ dates: {} }),
          });
        } else {
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({}),
          });
        }
      }
    );

    // Cold boot: token in localStorage, but OPFS is EMPTY (fresh DB, no metadata).
    // DO NOT seed fortress_last_sync_date — we want the real empty-lastSync path.
    await page.goto(`http://localhost:5173/?dbName=${uniqueDb}`);
    await page.evaluate(() => {
      localStorage.setItem('pingolin_auth_token', 'test:TOKEN');
      localStorage.setItem('pingolin_proxy_url', 'https://pinboard.net/api');
      localStorage.setItem('pingolin_hydrated', 'true');
      // Explicitly confirm no override key
      localStorage.removeItem('fortress_last_sync_date');
    });

    await page.reload();
    await expect(page.getByTestId('login-container')).not.toBeVisible({ timeout: 10000 });

    // Allow time for the full boot → SESSION_RESTORED → hb-update → START_HYDRATION cycle
    await page.waitForTimeout(3000);

    // ── Collect evidence ───────────────────────────────────────────────────
    const msgs = await page.evaluate<any[]>(() => (window as any).__outboundRpcLog || []);

    startHydrationSent = msgs.some((m) => m.type === 'START_HYDRATION');

    const deltaFetchSent = msgs.some(
      (m) => m.type === 'RPC_FETCH' && m.id === 'hb-delta-fetch'
    );

    const postsAllParams = postsAllUrl
      ? Object.fromEntries(new URL(postsAllUrl).searchParams.entries())
      : {};
    const hasDateFilter =
      'fromdt' in postsAllParams || 'since' in postsAllParams;

    console.log(
      `[Scenario 31] START_HYDRATION sent: ${startHydrationSent}, ` +
      `hb-delta-fetch sent: ${deltaFetchSent}, ` +
      `/posts/all date filter: ${hasDateFilter ? JSON.stringify(postsAllParams) : 'none'}`
    );

    // ── Assertions ─────────────────────────────────────────────────────────

    // 1. START_HYDRATION MUST fire — empty lastSyncTime triggers the full pull gate
    expect(
      startHydrationSent,
      'REGRESSION: START_HYDRATION was NOT sent for a new device with empty OPFS. ' +
      'The user will get an empty bookmark list — silent data loss!'
    ).toBe(true);

    // 2. hb-delta-fetch must NOT fire — there is no prior anchor to delta from
    expect(
      deltaFetchSent,
      'REGRESSION: hb-delta-fetch fired for a fresh DB with no lastSyncTime. ' +
      'A date-filtered delta on an empty DB will silently miss all historical bookmarks.'
    ).toBe(false);

    // 3. The /posts/all call (from START_HYDRATION) must have NO date filter
    expect(
      hasDateFilter,
      `REGRESSION: /posts/all was called WITH a date filter (${JSON.stringify(postsAllParams)}) ` +
      `on a fresh DB — only new bookmarks would be imported, not the full archive.`
    ).toBe(false);

    // 4. Verify the bookmark actually appeared — hydration delivered data
    await expect(page.getByTestId('bookmark-item')).toHaveCount(1, { timeout: 5000 });

    console.log('Scenario 31 passed: New device correctly gets START_HYDRATION (full pull).');
  });
});
