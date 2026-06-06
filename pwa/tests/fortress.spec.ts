import { test, expect } from '@playwright/test';
import { AppPage } from './pom/AppPage';
import { AddForm } from './pom/AddForm';

test.describe('The Universal Fortress', () => {
  test.beforeEach(async ({ page }) => {
    page.on('console', msg => console.log(`[BROWSER] ${msg.type()}: ${msg.text()}`));
    page.on('pageerror', err => console.log(`[BROWSER ERROR] ${err.message}`));
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
    
    // 1. Mock the search response for an exact tag
    // We expect the app to call search with "#subject:cs.AI"
    await app.mockProxy('/posts/recent', []);
    await app.mockProxy('/posts/all', [
      { href: 'https://example.com/1', description: 'Bookmark A', tags: 'subject:cs.AI tui', time: '2023-10-01T12:00:00Z' },
      { href: 'https://example.com/2', description: 'Bookmark B', tags: 'subject:cs.CL terminal', time: '2023-10-01T12:01:00Z' },
    ]);

    await app.goto();
    
    // We need to bypass login if token already exists, but here we'll just login
    await app.login('test:TOKEN');
    await expect(page.getByTestId('bookmark-item')).toHaveCount(2, { timeout: 10000 });

    // 2. Perform Exact Tag Search
    await app.search('#subject:cs.AI');
    
    // Assert that only Bookmark A is visible
    const list = page.getByTestId('bookmark-item');
    await expect(list).toHaveCount(1);
    await expect(list).toContainText('Bookmark A');
    await expect(list).not.toContainText('Bookmark B');
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
    await expect(app.networkStatus).toBeVisible();

    // 2. Add a bookmark while offline
    await app.toggleAddButton.click();
    await addForm.fill('https://offline.com', 'Offline Bookmark', 'offline test');
    await addForm.submit();

    // 3. Assert immediate local UI update
    const list = page.getByTestId('bookmark-item');
    await expect(list).toHaveCount(1);
    await expect(list).toContainText('Offline Bookmark');
    await expect(page.getByTestId('pending-icon')).toBeVisible();

    // 4. Assert persistence after refresh
    await context.setOffline(false);
    await page.reload();
    await expect(list).toHaveCount(1);
    await expect(list).toContainText('Offline Bookmark');
    await expect(page.getByTestId('pending-icon')).toBeVisible();
    await expect(app.networkStatus).not.toBeVisible();
  });

  test('Scenario 7: The Upstream Flush (Reconnection)', async ({ page, context }) => {
    const app = new AppPage(page);
    const addForm = new AddForm(page);

    await app.mockProxy('/posts/recent', []);
    await app.mockProxy('/posts/all', []);
    await app.mockProxy('/posts/update', { update_time: new Date().toISOString() });
    await app.mockProxy('/posts/dates', { dates: {} });
    await app.mockProxy('/posts/add', { result_code: 'done' });

    await app.goto();
    await app.login('test:TOKEN');
    await expect(app.toggleAddButton).toBeVisible({ timeout: 15000 });

    // 1. Add Bookmark Offline
    await context.setOffline(true);
    await app.toggleAddButton.click();
    await addForm.fill('https://reconnect.com', 'Reconnect Bookmark', 'test');
    await addForm.submit();
    await expect(page.getByTestId('pending-icon')).toBeVisible();

    // 2. Go Online and trigger sync
    await context.setOffline(false);
    // Sync loop should trigger automatically or we can trigger it via another add/delete
    // But here we'll just wait for the next loop or force it if we had a trigger
    
    // In main.ts, addButton.onclick calls sync.trigger()
    // So it should have already triggered, but it failed because we were offline.
    // When we go online, the next loop (60s) or a manual trigger will catch it.
    
    // Let's perform another search to trigger a refresh and check if loop starts
    await app.search('Reconnect');
    
    // Assert that the pending icon disappears
    // Note: main.ts has a 5s wait between pushes
    await expect(page.getByTestId('pending-icon')).not.toBeVisible({ timeout: 15000 });
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
});
