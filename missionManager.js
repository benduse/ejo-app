// missionManager.js - Manages missions, rewards, and narrative progression
import { CHAPTERS, DIFFICULTY_TIERS, WEEKLY_CHALLENGE } from './missionData.js';
import progressManager from './progressManager.js';

class MissionManager {
    constructor() {
        this.storageKey = 'ejo_missions';
        this.data = this.loadData();
        this.init();
    }

    init() {
        this.checkDailyReset();
        this.syncWithProgress();
        window.addEventListener('ejoProgressUpdated', (e) => {
            this.syncWithProgress(e.detail);
        });
    }

    syncWithProgress(progressData) {
        const pd = progressData || progressManager.getProgressData();
        const streak = pd.streak || 0;
        let changed = false;
        this.data.weeklyChallenge.tasks.forEach(task => {
            if (task.type === 'streak_days') {
                if (task.progress !== streak) {
                    task.progress = streak;
                    changed = true;
                }
            }
        });
        if (changed) this.saveData();
    }

    loadData() {
        const defaults = {
            currentMission: null,
            lastReset: null,
            narrativeDay: 1,
            weeklyChallenge: {
                id: WEEKLY_CHALLENGE.id,
                tasks: WEEKLY_CHALLENGE.tasks.map(t => ({ ...t, progress: 0 })),
                completed: false
            },
            completedMissionsCount: 0,
            history: []
        };
        try {
            const stored = localStorage.getItem(this.storageKey);
            if (stored) {
                const parsed = JSON.parse(stored);
                // Ensure weekly challenge structure is up to date
                if (!parsed.weeklyChallenge || parsed.weeklyChallenge.id !== WEEKLY_CHALLENGE.id) {
                    parsed.weeklyChallenge = defaults.weeklyChallenge;
                }
                return { ...defaults, ...parsed };
            }
            return defaults;
        } catch (e) {
            return defaults;
        }
    }

    saveData() {
        localStorage.setItem(this.storageKey, JSON.stringify(this.data));
        window.dispatchEvent(new CustomEvent('ejoMissionsUpdated', { detail: this.data }));
    }

    checkDailyReset() {
        const today = new Date().toDateString();
        if (this.data.lastReset !== today) {
            this.resetDailyMission(today);
        }
    }

    resetDailyMission(dateString) {
        this.data.lastReset = dateString;
        this.data.currentMission = null; // UI will prompt to pick difficulty
        this.saveData();
    }

    generateDailyMission(difficultyId) {
        const difficulty = DIFFICULTY_TIERS[difficultyId.toUpperCase()] || DIFFICULTY_TIERS.EASY;
        const chapterIndex = (this.data.narrativeDay - 1) % CHAPTERS.length;
        const chapter = CHAPTERS[chapterIndex];

        this.data.currentMission = {
            id: `mission_${Date.now()}`,
            title: chapter.title,
            story: chapter.story,
            difficulty: difficulty.id,
            tasks: difficulty.tasks.map(t => ({ ...t, progress: 0 })),
            reward: difficulty.reward,
            completed: false,
            claimed: false,
            createdAt: new Date().toISOString()
        };
        this.saveData();
        return this.data.currentMission;
    }

    updateTaskProgress(type, amount, meta = {}) {
        let changed = false;

        // Update daily mission tasks
        if (this.data.currentMission && !this.data.currentMission.completed) {
            this.data.currentMission.tasks.forEach(task => {
                if (task.type === type) {
                    if (type === 'accuracy') {
                        // For accuracy, we might take the best or latest
                        task.progress = Math.max(task.progress, amount);
                    } else {
                        task.progress += amount;
                    }
                    changed = true;
                }
            });

            // Check for completion
            const allTasksDone = this.data.currentMission.tasks.every(task => task.progress >= task.target);
            if (allTasksDone && !this.data.currentMission.completed) {
                this.data.currentMission.completed = true;
                changed = true;
            }
        }

        // Update weekly challenge
        if (type === 'flashcards' || type === 'quizzes') {
            const weeklyType = type === 'flashcards' ? 'total_words' : 'total_quizzes';
            this.data.weeklyChallenge.tasks.forEach(task => {
                if (task.type === weeklyType) {
                    task.progress += amount;
                    changed = true;
                }
            });
        }

        // Streak is special, handled elsewhere or via progressManager
        const progressData = progressManager.getProgressData();
        this.data.weeklyChallenge.tasks.forEach(task => {
            if (task.type === 'streak_days') {
                task.progress = progressData.streak || 0;
            }
        });

        if (changed) {
            this.saveData();
        }
    }

    claimReward() {
        if (!this.data.currentMission || !this.data.currentMission.completed || this.data.currentMission.claimed) return;

        const reward = this.data.currentMission.reward;
        this.data.currentMission.claimed = true;
        this.data.completedMissionsCount += 1;
        this.data.narrativeDay += 1;

        progressManager.addXP(reward.xp);
        progressManager.addCoins(reward.coins);

        this.saveData();
        window.dispatchEvent(new CustomEvent('ejoMissionCompleted', { detail: this.data.currentMission }));
    }

    getMissionData() {
        return { ...this.data };
    }

    getTimeUntilReset() {
        const now = new Date();
        const tomorrow = new Date(now);
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(0, 0, 0, 0);
        return tomorrow.getTime() - now.getTime();
    }
}

const missionManager = new MissionManager();
export default missionManager;
