import { describe, it, expect, beforeEach, vi } from 'vitest';
// We need to mock progressManager because missionManager imports it
vi.mock('../../progressManager.js', () => {
    return {
        default: {
            getProgressData: vi.fn(() => ({ streak: 0 })),
            addXP: vi.fn(),
            addCoins: vi.fn(),
        }
    };
});

import missionManager from '../../missionManager.js';
import { DIFFICULTY_TIERS } from '../../missionData.js';

describe('MissionManager', () => {
    beforeEach(() => {
        localStorage.clear();
        // Since it's a singleton, we might need to reset its internal state if possible
        // but for now let's see how it behaves.
    });

    it('should initialize with default values', () => {
        const data = missionManager.getMissionData();
        expect(data.narrativeDay).toBe(1);
        expect(data.completedMissionsCount).toBe(0);
    });

    it('should generate a daily mission', () => {
        missionManager.generateDailyMission('EASY');
        const data = missionManager.getMissionData();
        expect(data.currentMission).not.toBeNull();
        expect(data.currentMission.difficulty).toBe('easy');
        expect(data.currentMission.tasks.length).toBe(DIFFICULTY_TIERS.EASY.tasks.length);
    });

    it('should update task progress', () => {
        missionManager.generateDailyMission('EASY');
        missionManager.updateTaskProgress('flashcards', 2);
        const data = missionManager.getMissionData();
        expect(data.currentMission.tasks.find(t => t.type === 'flashcards').progress).toBe(2);
    });

    it('should complete mission when all tasks are done', () => {
        missionManager.generateDailyMission('EASY');
        // Easy tasks are 5 flashcards and 1 quiz
        missionManager.updateTaskProgress('flashcards', 5);
        missionManager.updateTaskProgress('quizzes', 1);
        const data = missionManager.getMissionData();
        expect(data.currentMission.completed).toBe(true);
    });
});
