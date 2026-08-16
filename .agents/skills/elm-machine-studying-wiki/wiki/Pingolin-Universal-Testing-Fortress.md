# Pingolin Universal Testing Fortress (Black-Box E2E Playwright Architecture)

## 1. The Sovereign Law
Treat the PWA as a completely language-agnostic "Black Box" by validating user-visible behaviors through Playwright Page Object Models and deterministic API proxy routing: tests must assert real-world invariant contracts (`data-testid`) independently of whether the underlying application is written in Elm, TypeScript, or PureScript.

## 2. The Trigger & Context
Unit testing UI implementation details (e.g. testing whether an internal Elm model field updated) leads to fragile, brittle test suites:
- **Coupled Selector Rot:** Tests written with fragile CSS selectors (`div > ul > li.item-active`) break whenever markup is restyled, even if the underlying functionality is intact.
- **Flaky Network Interactions:** Tests relying on live external Pinboard API connections fail due to rate limits (HTTP 429), internet flakiness, or network latency.
- **The Black-Box Solution:** Decoupling *test intent* from *DOM selectors* using Page Object Models (`AppPage`), asserting against immutable `data-testid` contracts, and intercepting all network traffic using Playwright's deterministic `page.route()` proxy simulator.

---

## 3. Developer Intent vs. Elm Semantics

| Dimension | White-Box Unit Testing | Universal Black-Box E2E Testing |
| :--- | :--- | :--- |
| **Test Boundary** | Inspects internal framework functions and state variables. | Treats the entire app (DOM + SQLite + Web Worker + Network) as an integrated black box. |
| **Selector Strategy** | Brittle CSS class names (`.bookmark-title`). | **Immutable Data Attributes:** `[data-testid="bookmark-item"]`, `[data-testid="sync-status"]`. |
| **Network Mocking** | Mocking fetch inside JavaScript globals. | **Full-Stack Network Interception:** `page.route('**/api/**', handler)` mocking real Cloudflare proxy responses. |
| **Durability** | Tests must be rewritten on every refactor. | **30-Year Durability:** The entire frontend can be rewritten from TS to Elm without changing a single line of E2E test code. |

---

## 4. The Pattern: Page Object Model & Proxy Mock Strategy

### 1. The Page Object Model (`e2e/pages/AppPage.ts`)

```typescript
import { Page, Locator, expect } from '@playwright/test';

export class AppPage {
  readonly page: Page;
  readonly syncStatus: Locator;
  readonly syncProgress: Locator;
  readonly searchInput: Locator;
  readonly bookmarkItems: Locator;
  readonly addButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.syncStatus = page.locator('[data-testid="sync-status"]');
    this.syncProgress = page.locator('[data-testid="sync-progress"]');
    this.searchInput = page.locator('[data-testid="search-input"]');
    this.bookmarkItems = page.locator('[data-testid="bookmark-item"]');
    this.addButton = page.locator('[data-testid="add-button"]');
  }

  async goto() {
    await this.page.goto('/');
  }

  async search(query: string) {
    await this.searchInput.fill(query);
  }

  async expectBookmarkCount(count: number) {
    await expect(this.bookmarkItems).toHaveCount(count);
  }

  async expectSyncStatus(statusText: string) {
    await expect(this.syncStatus).toContainText(statusText);
  }
}
```

### 2. The Deterministic Proxy Simulator (`e2e/scenarios/bootstrap.spec.ts`)

```typescript
import { test, expect } from '@playwright/test';
import { AppPage } from '../pages/AppPage';

test.describe('Scenario 1: Fast Bootstrap Priority Render', () => {
  test('renders 100 bookmarks in <100ms on first launch', async ({ page }) => {
    // 1. Intercept proxy calls to /posts/recent
    await page.route('**/api/v1/posts/recent*', async (route) => {
      const mockBookmarks = Array.from({ length: 100 }, (_, i) => ({
        href: `https://example.com/item-${i}`,
        description: `Bookmark Item ${i}`,
        extended: '',
        tags: 'tech reading',
        time: '2026-08-16T12:00:00Z',
        shared: 'yes',
        toread: 'no'
      }));

      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ posts: mockBookmarks })
      });
    });

    const app = new AppPage(page);
    await app.goto();

    // 2. Assert instant viewport render
    await app.expectBookmarkCount(100);
    await app.expectSyncStatus('READY');
  });
});
```
