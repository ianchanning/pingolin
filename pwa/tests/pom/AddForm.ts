import { Page, Locator } from '@playwright/test';

export class AddForm {
  readonly page: Page;
  readonly container: Locator;
  readonly urlInput: Locator;
  readonly titleInput: Locator;
  readonly tagsInput: Locator;
  readonly addButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.container = page.getByTestId('add-form');
    this.urlInput = page.getByTestId('new-url');
    this.titleInput = page.getByTestId('new-title');
    this.tagsInput = page.getByTestId('new-tags');
    this.addButton = page.getByTestId('add-button');
  }

  async fill(url: string, title: string, tags: string) {
    await this.urlInput.fill(url);
    await this.titleInput.fill(title);
    await this.tagsInput.fill(tags);
  }

  async submit() {
    await this.addButton.click();
  }
}
