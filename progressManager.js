// progressManager.js - Manages XP, Levels, and Achievements

export const LEVEL_DATA = [
    { level: 1, minXP: 0, name: "The Egg", icon: "🥚" },
    { level: 2, minXP: 100, name: "The Hatchling", icon: "🐣" },
    { level: 3, minXP: 300, name: "The Fledgling", icon: "🐥" },
    { level: 4, minXP: 600, name: "The Scout", icon: "🐦" },
    { level: 5, minXP: 1000, name: "The Majestic Umusambi", icon: "🦩" }
];

export const ACHIEVEMENTS = {
    EARLY_BIRD: { id: "early_bird", name: "Early Bird", desc: "Earned your first XP!", icon: "🌅" },
    BRAINIAC: { id: "brainiac", name: "Brainiac", desc: "Answered 10 questions correctly in a row!", icon: "🧠" },
    EXPLORER: { id: "explorer", name: "Explorer", desc: "Viewed 20 unique flashcards!", icon: "🗺️" },
    POLYGLOT: { id: "polyglot", name: "Polyglot", desc: "Tried all three languages!", icon: "🌍" },
    DAILY_HERO: { id: "daily_hero", name: "Daily Hero", desc: "Found the Word of the Day!", icon: "✨" }
};

class ProgressManager {
    constructor() {
        this.storageKey = 'ejo_progress';
        this.data = this.loadData();
    }

    loadData() {
        const defaults = {
            xp: 0,
            level: 1,
            achievements: [],
            streak: 0,
            languagesTried: [],
            viewedFlashcardIds: [],
            lastDailyDiscovery: null
        };
        try {
            const stored = localStorage.getItem(this.storageKey);
            return stored ? { ...defaults, ...JSON.parse(stored) } : defaults;
        } catch (e) {
            return defaults;
        }
    }

    saveData() {
        localStorage.setItem(this.storageKey, JSON.stringify(this.data));
        // Dispatch custom event for UI updates
        window.dispatchEvent(new CustomEvent('ejoProgressUpdated', { detail: this.data }));
    }

    addXP(amount) {
        if (amount <= 0) return;

        const oldXP = this.data.xp;
        this.data.xp += amount;

        if (oldXP === 0 && amount > 0) {
            this.unlockAchievement(ACHIEVEMENTS.EARLY_BIRD);
        }

        this.checkLevelUp();
        this.saveData();
    }

    checkLevelUp() {
        const currentLevel = this.data.level;
        let newLevel = currentLevel;

        for (const ld of LEVEL_DATA) {
            if (this.data.xp >= ld.minXP) {
                newLevel = ld.level;
            }
        }

        if (newLevel > currentLevel) {
            this.data.level = newLevel;
            window.dispatchEvent(new CustomEvent('ejoLevelUp', { detail: { level: newLevel, levelData: LEVEL_DATA[newLevel - 1] } }));
        }
    }

    unlockAchievement(achievement) {
        if (!this.data.achievements.includes(achievement.id)) {
            this.data.achievements.push(achievement.id);
            window.dispatchEvent(new CustomEvent('ejoAchievementUnlocked', { detail: achievement }));
            this.saveData();
        }
    }

    recordLanguageTry(lang) {
        if (!this.data.languagesTried.includes(lang)) {
            this.data.languagesTried.push(lang);
            if (this.data.languagesTried.length >= 3) {
                this.unlockAchievement(ACHIEVEMENTS.POLYGLOT);
            }
            this.saveData();
        }
    }

    recordFlashcardView(id) {
        if (!this.data.viewedFlashcardIds.includes(id)) {
            this.data.viewedFlashcardIds.push(id);
            this.addXP(5);
            if (this.data.viewedFlashcardIds.length >= 20) {
                this.unlockAchievement(ACHIEVEMENTS.EXPLORER);
            }
            this.saveData();
        }
    }

    recordQuizResult(correct, total, streak) {
        if (streak >= 10) {
            this.unlockAchievement(ACHIEVEMENTS.BRAINIAC);
        }

        // XP for completion
        this.addXP(20);
        // Bonus XP for accuracy
        const accuracyBonus = Math.floor((correct / total) * 30);
        this.addXP(accuracyBonus);

        this.saveData();
    }

    recordDailyDiscovery() {
        const today = new Date().toDateString();
        if (this.data.lastDailyDiscovery !== today) {
            this.data.lastDailyDiscovery = today;
            this.addXP(50);
            this.unlockAchievement(ACHIEVEMENTS.DAILY_HERO);
            this.saveData();
            return true;
        }
        return false;
    }

    getProgressData() {
        return { ...this.data };
    }

    getCurrentLevelData() {
        return LEVEL_DATA[this.data.level - 1];
    }

    getNextLevelXP() {
        const nextLevel = LEVEL_DATA[this.data.level];
        return nextLevel ? nextLevel.minXP : null;
    }
}

const progressManager = new ProgressManager();
export default progressManager;
