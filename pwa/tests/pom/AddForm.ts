import { Page, Locator, expect } from '@playwright/test';

export class AddForm {
  readonly page: Page;
  readonly container: Locator;
  readonly urlInput: Locator;
  readonly titleInput: Locator;
  readonly tagsInput: Locator;
  readonly addButton: Locator;
  readonly suggestionsDropdown: Locator;

  constructor(page: Page) {
    this.page = page;
    this.container = page.getByTestId('add-form');
    this.urlInput = page.getByTestId('new-url');
    this.titleInput = page.getByTestId('new-title');
    this.tagsInput = page.getByTestId('new-tags');
    this.addButton = page.getByTestId('add-button');
    this.suggestionsDropdown = page.getByTestId('tag-suggestions-cloud');
  }

  async fill(url: string, title: string, tags: string) {
    await this.urlInput.fill(url);
    await this.titleInput.fill(title);
    await this.tagsInput.fill(tags);
  }

  async submit() {
    await this.addButton.click();
  }

  getSuggestionItem(tag: string): Locator {
    return this.suggestionsDropdown.locator('button.tag-suggestion-item', {
      hasText: tag,
    });
  }

  async selectSuggestion(tag: string) {
    const item = this.getSuggestionItem(tag);
    await item.click();
  }

  async getVisibleSuggestions(): Promise<string[]> {
    return this.suggestionsDropdown
      .locator('button.tag-suggestion-item')
      .allInnerTexts();
  }

  async expectSuggestionsHidden() {
    await expect(this.suggestionsDropdown).toBeHidden();
  }

  async expectSuggestionsVisible(options?: { timeout?: number }) {
    await expect(this.suggestionsDropdown).toBeVisible(options);
  }
}
