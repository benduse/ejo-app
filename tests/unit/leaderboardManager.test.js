import { describe, it, expect, beforeEach, vi } from 'vitest';
import LeaderboardManager from '../../quiz/leaderboardManager.js';

describe('LeaderboardManager', () => {
    const storageKey = 'test_leaderboard';
    const nameKey = 'test_player_name';

    beforeEach(() => {
        localStorage.clear();
        vi.stubGlobal('prompt', vi.fn(() => 'Player'));
    });

    it('should initialize with an empty leaderboard', () => {
        const manager = new LeaderboardManager(storageKey, nameKey);
        expect(manager.getLeaderboard()).toEqual([]);
    });

    it('should add a score', () => {
        localStorage.setItem(nameKey, 'Player 1');
        const manager = new LeaderboardManager(storageKey, nameKey);
        manager.addScore(100);

        const leaderboard = manager.getLeaderboard();
        expect(leaderboard).toHaveLength(1);
        expect(leaderboard[0].name).toBe('Player 1');
        expect(leaderboard[0].score).toBe(100);
    });

    it('should maintain only top 10 scores', () => {
        localStorage.setItem(nameKey, 'Player 1');
        const manager = new LeaderboardManager(storageKey, nameKey);

        // LeaderboardManager as implemented updates the same player's score
        // To test top 10, we need different players

        for (let i = 1; i <= 15; i++) {
            // Manually set player name for each score to simulate different players
            manager.playerName = `Player ${i}`;
            manager.addScore(i * 10);
        }

        const leaderboard = manager.getLeaderboard();
        expect(leaderboard).toHaveLength(10);
        expect(leaderboard[0].score).toBe(150);
        expect(leaderboard[9].score).toBe(60);
    });

    it('should identify a high score', () => {
        localStorage.setItem(nameKey, 'Player 1');
        const manager = new LeaderboardManager(storageKey, nameKey);

        for (let i = 1; i <= 10; i++) {
            manager.playerName = `Player ${i}`;
            manager.addScore(i * 10);
        }

        expect(manager.isHighScore(105)).toBe(true);
        expect(manager.isHighScore(5)).toBe(false);
    });
});
