import { describe, it, expect, beforeEach, vi } from 'vitest';
import progressManager from '../../progressManager.js';

describe('ProgressManager', () => {
    beforeEach(() => {
        localStorage.clear();
        // Reset progressManager state if possible, or just rely on localStorage clearing
        // Since it's a singleton, we might need to be careful.
    });

    it('should initialize with default values', () => {
        const data = progressManager.getProgressData();
        expect(data.xp).toBe(0);
        expect(data.level).toBe(1);
        expect(data.coins).toBe(0);
    });

    it('should add XP and level up', () => {
        progressManager.addXP(150);
        const data = progressManager.getProgressData();
        expect(data.xp).toBe(150);
        expect(data.level).toBe(2);
    });

    it('should add coins', () => {
        progressManager.addCoins(50);
        const data = progressManager.getProgressData();
        expect(data.coins).toBe(50);
    });

    it('should unlock achievements', () => {
        progressManager.addXP(10);
        const data = progressManager.getProgressData();
        expect(data.achievements).toContain('early_bird');
    });
});
