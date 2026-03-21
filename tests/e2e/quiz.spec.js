import { test, expect } from '@playwright/test';

test.describe('Quiz functionality', () => {
  test('should load questions and allow playing', async ({ page }) => {
    await page.goto('/quiz/quiz.html');
    await expect(page.locator('#question')).not.toBeEmpty();

    // Choose the first answer
    const choices = page.locator('.choice-btn');
    await choices.first().click();

    // Check if score updates
    await expect(page.locator('#score')).not.toHaveText('0');
  });

  test('should restart quiz', async ({ page }) => {
    await page.goto('/quiz/quiz.html');
    await page.click('.choice-btn >> nth=0');
    await page.click('#end-quiz-btn');
    await page.click('#restart-btn');
    await expect(page.locator('#score')).toHaveText('0');
  });

  test('should end quiz early', async ({ page }) => {
    await page.goto('/quiz/quiz.html');
    await page.click('#end-quiz-btn');
    await expect(page.locator('#result-container')).not.toHaveClass(/hide/);
    await expect(page.locator('#final-score')).toContainText('ended by user');
  });
});
