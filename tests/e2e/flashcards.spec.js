import { test, expect } from '@playwright/test';

test.describe('Flashcards functionality', () => {
  test('should load flashcards and allow flipping', async ({ page }) => {
    await page.goto('/flashcards/flashcards.html');
    await expect(page.locator('.word')).not.toBeEmpty();

    const card = page.locator('#flashcard');
    await expect(card).not.toHaveClass(/flipped/);
    await card.click();
    await expect(card).toHaveClass(/flipped/);
  });

  test('should navigate through cards', async ({ page }) => {
    await page.goto('/flashcards/flashcards.html');
    const firstWord = await page.textContent('.word');
    await page.click('#next-flashcard');
    const secondWord = await page.textContent('.word');
    expect(firstWord).not.toBe(secondWord);
  });

  test('should toggle mastery', async ({ page }) => {
    await page.goto('/flashcards/flashcards.html');
    const masteryBtn = page.locator('#mastered-toggle');
    await expect(masteryBtn).not.toHaveClass(/is-mastered/);
    await masteryBtn.click();
    await expect(masteryBtn).toHaveClass(/is-mastered/);
  });

  test('should search for cards', async ({ page }) => {
    await page.goto('/flashcards/flashcards.html');
    await page.fill('#search-input', 'Muraho');
    await expect(page.locator('.search-result')).toContainText('Muraho');
  });
});
