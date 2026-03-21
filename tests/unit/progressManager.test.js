import { describe, it, expect, beforeEach, vi } from 'vitest';
import progressManager from '../../progressManager.js';

describe('progressManager.js', () => {
  beforeEach(() => {
    localStorage.clear();
    // Re-initialize progressManager data
    progressManager.data = progressManager.loadData();
    vi.clearAllMocks();
  });

  it('should initialize with default values', () => {
    const data = progressManager.getProgressData();
    expect(data.xp).toBe(0);
    expect(data.level).toBe(1);
    expect(data.coins).toBe(0);
  });

  it('should add XP and level up', () => {
    vi.spyOn(window, 'dispatchEvent');
    progressManager.addXP(150);
    const data = progressManager.getProgressData();
    expect(data.xp).toBe(150);
    expect(data.level).toBe(2);
    expect(window.dispatchEvent).toHaveBeenCalled();
  });

  it('should add coins', () => {
    progressManager.addCoins(50);
    expect(progressManager.getProgressData().coins).toBe(50);
  });

  it('should unlock achievements', () => {
    const ach = { id: "test", name: "Test", desc: "Test desc", icon: "T" };
    progressManager.unlockAchievement(ach);
    expect(progressManager.getProgressData().achievements).toContain("test");
  });

  it('should update streak on initialization', () => {
      // Manual trigger of updateStreak because it's called in constructor
      // Since it's a singleton, constructor already ran.
      progressManager.updateStreak();
      expect(progressManager.getProgressData().streak).toBe(1);
  });

  it('should increment streak on consecutive days', () => {
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      progressManager.data.lastVisitDate = yesterday.toDateString();
      progressManager.data.streak = 1;

      progressManager.updateStreak();
      expect(progressManager.getProgressData().streak).toBe(2);
  });

  it('should reset streak on missed days', () => {
      const today = new Date();
      const longAgo = new Date(today);
      longAgo.setDate(longAgo.getDate() - 3);

      progressManager.data.lastVisitDate = longAgo.toDateString();
      progressManager.data.streak = 5;

      progressManager.updateStreak();
      expect(progressManager.getProgressData().streak).toBe(1);
  });
});
