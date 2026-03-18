// gamificationUI.js - Handles global gamification UI elements
import progressManager from './progressManager.js';
import { launchConfetti } from './utils.js';

class GamificationUI {
    constructor() {
        this.init();
    }

    init() {
        this.injectWidget();
        this.setupEventListeners();
        this.updateUI();
    }

    injectWidget() {
        const header = document.querySelector('.app-header');
        if (!header) return;

        const widget = document.createElement('div');
        widget.className = 'user-progress-widget';
        widget.innerHTML = `
            <div class="level-icon" id="ejo-level-icon" title=""></div>
            <div class="xp-container">
                <div style="display: flex; justify-content: space-between; font-size: 0.7rem;">
                    <span id="ejo-level-name"></span>
                    <span id="ejo-xp-text"></span>
                </div>
                <div class="xp-bar-outer">
                    <div class="xp-bar-inner" id="ejo-xp-bar"></div>
                </div>
            </div>
        `;

        // Insert before nav toggle or at the end
        const navToggle = header.querySelector('.nav-toggle');
        if (navToggle) {
            header.insertBefore(widget, navToggle);
        } else {
            header.appendChild(widget);
        }
    }

    setupEventListeners() {
        window.addEventListener('ejoProgressUpdated', () => this.updateUI());
        window.addEventListener('ejoLevelUp', (e) => this.handleLevelUp(e.detail));
        window.addEventListener('ejoAchievementUnlocked', (e) => this.showToast(e.detail));
    }

    updateUI() {
        const data = progressManager.getProgressData();
        const levelData = progressManager.getCurrentLevelData();
        const nextLevelXP = progressManager.getNextLevelXP();

        const levelIcon = document.getElementById('ejo-level-icon');
        const levelName = document.getElementById('ejo-level-name');
        const xpText = document.getElementById('ejo-xp-text');
        const xpBar = document.getElementById('ejo-xp-bar');

        if (levelIcon) {
            levelIcon.textContent = levelData.icon;
            levelIcon.title = `Level ${data.level}: ${levelData.name}`;
        }
        if (levelName) levelName.textContent = `Lvl ${data.level}`;

        if (xpText && xpBar) {
            if (nextLevelXP) {
                const currentLevelMin = levelData.minXP;
                const progressInLevel = data.xp - currentLevelMin;
                const totalInLevel = nextLevelXP - currentLevelMin;
                const percentage = Math.min(100, (progressInLevel / totalInLevel) * 100);

                xpText.textContent = `${data.xp} / ${nextLevelXP} XP`;
                xpBar.style.width = `${percentage}%`;
            } else {
                xpText.textContent = `${data.xp} XP (Max Level)`;
                xpBar.style.width = `100%`;
            }
        }
    }

    handleLevelUp(detail) {
        this.showToast({
            name: "Level Up!",
            desc: `Congratulations! You've reached Level ${detail.level}: ${detail.levelData.name}`,
            icon: "🆙"
        });
        launchConfetti();
    }

    showToast(achievement) {
        const toast = document.createElement('div');
        toast.className = 'ejo-toast';
        toast.innerHTML = `
            <div class="toast-icon">${achievement.icon}</div>
            <div class="toast-content">
                <h4>${achievement.name}</h4>
                <p>${achievement.desc}</p>
            </div>
        `;
        document.body.appendChild(toast);

        setTimeout(() => {
            toast.style.transform = 'translateX(120%)';
            toast.style.transition = 'transform 0.5s ease-in';
            setTimeout(() => toast.remove(), 500);
        }, 5000);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new GamificationUI();
});
