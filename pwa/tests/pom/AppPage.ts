import { Page, Locator, expect } from '@playwright/test';
import { BookmarkItem } from './BookmarkItem';

export class AppPage {
  readonly page: Page;
  readonly syncStatus: Locator;
  readonly syncProgress: Locator;
  readonly networkStatus: Locator;
  readonly searchInput: Locator;
  readonly loginContainer: Locator;
  readonly authTokenInput: Locator;
  readonly syncButton: Locator;
  readonly toggleAddButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.syncStatus = page.getByTestId('sync-status');
    this.syncProgress = page.getByTestId('sync-progress');
    this.networkStatus = page.getByTestId('network-status');
    this.searchInput = page.getByTestId('search-input');
    this.loginContainer = page.getByTestId('login-container');
    this.authTokenInput = page.getByTestId('auth-token');
    this.syncButton = page.getByTestId('sync-button');
    this.toggleAddButton = page.locator('#toggle-add-btn');
  }

  async goto(url?: string) {
    if (url) {
      await this.page.goto(url);
    } else {
      const dbName = `test-${Math.random().toString(36).substring(7)}.db`;
      await this.page.goto(`/?dbName=${dbName}`);
    }
  }

  async login(token: string) {
    await this.authTokenInput.fill(token);
    await this.syncButton.click();
  }

  async search(query: string) {
    await this.searchInput.fill(query);
  }

  async mockProxy(route: string, data: any) {
    await this.page.context().route(url => url.href.includes(route), async (r) => {
      await r.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(data),
      });
    });
  }

  async expectOnline() {
    await expect(this.networkStatus).toHaveText('ONLINE');
  }

  async expectOffline() {
    await expect(this.networkStatus).toHaveText('OFFLINE');
  }

  async expectBookmarkCount(count: number, options?: { timeout?: number }) {
    await expect(this.page.getByTestId('bookmark-item')).toHaveCount(count, options);
  }

  getBookmarkItem(index: number): BookmarkItem {
    return new BookmarkItem(this.page.getByTestId('bookmark-item').nth(index));
  }

  async expectSearchQuery(query: string) {
    await expect(this.searchInput).toHaveValue(query);
  }

  async toggleAddForm() {
    await this.toggleAddButton.click();
  }
}
