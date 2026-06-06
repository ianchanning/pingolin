import { Page, Locator } from '@playwright/test';

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

  async goto() {
    const dbName = `test-${Math.random().toString(36).substring(7)}.db`;
    await this.page.goto(`/?dbName=${dbName}`);
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
}
