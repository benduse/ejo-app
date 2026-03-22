import { test, expect } from '@playwright/test';

test.describe('Ejo App Navigation', () => {
    test('should navigate between Home, Flashcards, and Quiz', async ({ page }) => {
        await page.goto('/');
        await expect(page).toHaveTitle(/Kinyarwanda Flashcards/);

        // Navigate to Flashcards via top nav
        const flashcardsLink = page.locator('nav a[href*="flashcards.html"]').first();
        await flashcardsLink.click();

        await expect(page).toHaveURL(/flashcards/);
        await expect(page.locator('h1')).toContainText('Flashcards');

        // Navigate back to Home via top nav
        await page.locator('nav a[href*="index.html"]').first().click();
        await expect(page).toHaveURL(/\/|index/);

        // Navigate to Quiz via top nav
        await page.locator('nav a[href*="quiz.html"]').first().click();
        await expect(page).toHaveURL(/quiz/);
    });
});

test.describe('Flashcards functionality', () => {
    test('should load flashcards and allow flipping', async ({ page }) => {
        await page.goto('/flashcards/flashcards.html');

        const flashcard = page.locator('#flashcard');
        await expect(flashcard).toBeVisible();

        // Wait for flashcards to load
        await expect(page.locator('#front-content .word')).not.toBeEmpty();

        // Flip card
        await flashcard.click();
        await expect(flashcard).toHaveClass(/flipped/);

        await flashcard.click();
        await expect(flashcard).not.toHaveClass(/flipped/);
    });

    test('should navigate through flashcards', async ({ page }) => {
        await page.goto('/flashcards/flashcards.html');

        await expect(page.locator('#front-content .word')).not.toBeEmpty();
        const initialCardText = await page.locator('#front-content .word').textContent();

        await page.click('#next-flashcard');

        await expect(async () => {
            const nextCardText = await page.locator('#front-content .word').textContent();
            expect(initialCardText).not.toBe(nextCardText);
        }).toPass();

        await page.click('#prev-flashcard');
        await expect(page.locator('#front-content .word')).toHaveText(initialCardText);
    });
});

test.describe('Quiz functionality', () => {
    test('should complete a quiz and show results', async ({ page }) => {
        await page.goto('/quiz/quiz.html');

        // Check if question is loaded
        await expect(page.locator('#question')).not.toHaveText('Loading question...');

        // Answer questions until result-container is visible or we hit a reasonable limit
        for (let i = 0; i < 15; i++) {
            if (await page.locator('#result-container').isVisible()) {
                break;
            }

            const choices = page.locator('.choice-btn');
            // Check if choices exist and are enabled
            if (await choices.count() > 0) {
                const firstChoice = choices.first();
                if (await firstChoice.isEnabled()) {
                    await firstChoice.click();
                }
            }

            // Wait for transition (1200ms in script.js)
            await page.waitForTimeout(1500);
        }

        await expect(page.locator('#result-container')).toBeVisible();
        await expect(page.locator('#final-score')).not.toBeEmpty();
    });
});

test.describe('Gamification and Shop', () => {
    test('should open shop and show coins', async ({ page }) => {
        await page.goto('/');

        const coinsDisplay = page.locator('#ejo-coins-text');
        await expect(coinsDisplay).toBeVisible();

        await coinsDisplay.click();
        await expect(page.locator('#ejo-shop-modal')).toBeVisible();
        await expect(page.locator('.theme-item')).toHaveCount(4);

        await page.click('.close-modal');
        await expect(page.locator('#ejo-shop-modal')).not.toBeVisible();
    });
});
