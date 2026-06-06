import { Locator } from '@playwright/test';

export class BookmarkItem {
  readonly locator: Locator;
  readonly titleLink: Locator;
  readonly tagsContainer: Locator;
  readonly pendingIcon: Locator;
  readonly deleteButton: Locator;

  constructor(locator: Locator) {
    this.locator = locator;
    this.titleLink = locator.locator('h3 a');
    this.tagsContainer = locator.locator('.tags').first();
    this.pendingIcon = locator.getByTestId('pending-icon');
    this.deleteButton = locator.locator('.delete-btn');
  }

  async getTags(): Promise<string[]> {
    const text = await this.tagsContainer.textContent();
    if (!text) return [];
    // Format is "Tags: tag1, tag2"
    return text.replace('Tags: ', '').split(', ').filter(Boolean);
  }
}
