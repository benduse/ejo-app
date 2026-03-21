import { describe, it, expect, beforeEach, vi } from 'vitest';
import missionManager from '../../missionManager.js';
import progressManager from '../../progressManager.js';

describe('missionManager.js', () => {
  beforeEach(() => {
    localStorage.clear();
    missionManager.data = missionManager.loadData();
    progressManager.data = progressManager.loadData();
  });

  it('should generate a daily mission', () => {
    const mission = missionManager.generateDailyMission('easy');
    expect(mission).toBeDefined();
    expect(mission.difficulty).toBe('easy');
    expect(mission.tasks.length).toBeGreaterThan(0);
  });

  it('should update task progress', () => {
    missionManager.generateDailyMission('easy');
    const initialProgress = missionManager.data.currentMission.tasks[0].progress;
    const taskType = missionManager.data.currentMission.tasks[0].type;

    missionManager.updateTaskProgress(taskType, 1);
    expect(missionManager.data.currentMission.tasks[0].progress).toBe(initialProgress + 1);
  });

  it('should complete mission when all tasks are done', () => {
    missionManager.generateDailyMission('easy');
    missionManager.data.currentMission.tasks.forEach(task => {
      missionManager.updateTaskProgress(task.type, task.target);
    });
    expect(missionManager.data.currentMission.completed).toBe(true);
  });
});
