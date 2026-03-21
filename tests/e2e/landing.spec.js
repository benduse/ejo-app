import { test, expect } from '@playwright/test';

test.describe('Landing Page', () => {
  test('should load the landing page', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/Kinyarwanda Flashcards/);
    await expect(page.locator('h1')).toContainText('Learn Kinyarwanda');
  });

  test('should navigate to flashcards', async ({ page }) => {
    await page.goto('/');
    await page.click('text=Flashcards');
    await expect(page).toHaveURL(/.*flashcards(\.html)?/);
  });

  test('should navigate to quiz', async ({ page }) => {
    await page.goto('/');
    await page.click('text=Quiz');
    await expect(page).toHaveURL(/.*quiz(\.html)?/);
  });
});
