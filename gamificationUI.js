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
        this.applyActiveTheme();
    }

    injectWidget() {
        const header = document.querySelector('.app-header');
        if (!header) return;

        const widget = document.createElement('div');
        widget.className = 'user-progress-widget';
        widget.innerHTML = `
            <div class="level-icon" id="ejo-level-icon" title=""></div>
            <div class="xp-container">
                <div style="display: flex; justify-content: space-between; font-size: 0.7rem; align-items: center;">
                    <span id="ejo-level-name"></span>
                    <span id="ejo-xp-text"></span>
                    <div style="display: flex; gap: 8px; align-items: center;">
                        <span id="ejo-streak-text" style="color: #FF6B6B;" title="Daily Streak"></span>
                        <span id="ejo-coins-text" class="coins-display" style="color: #FFD700; cursor: pointer;" title="Open Shop"></span>
                    </div>
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
        window.addEventListener('ejoProgressUpdated', () => {
            this.updateUI();
            this.applyActiveTheme();
        });
        window.addEventListener('ejoLevelUp', (e) => this.handleLevelUp(e.detail));
        window.addEventListener('ejoAchievementUnlocked', (e) => this.showToast(e.detail));

        const coinsText = document.getElementById('ejo-coins-text');
        if (coinsText) {
            coinsText.addEventListener('click', () => this.toggleShop());
        }
    }

    applyActiveTheme() {
        const theme = progressManager.getProgressData().activeTheme || 'default';
        if (theme === 'default') {
            document.documentElement.removeAttribute('data-theme');
        } else {
            document.documentElement.setAttribute('data-theme', theme);
        }
    }

    updateUI() {
        const data = progressManager.getProgressData();
        const levelData = progressManager.getCurrentLevelData();
        const nextLevelXP = progressManager.getNextLevelXP();

        const levelIcon = document.getElementById('ejo-level-icon');
        const levelName = document.getElementById('ejo-level-name');
        const xpText = document.getElementById('ejo-xp-text');
        const xpBar = document.getElementById('ejo-xp-bar');
        const coinsText = document.getElementById('ejo-coins-text');
        const streakText = document.getElementById('ejo-streak-text');

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

        if (coinsText) {
            coinsText.innerHTML = `<i class="fas fa-coins"></i> ${data.coins || 0}`;
        }
        if (streakText) {
            streakText.innerHTML = `<i class="fas fa-fire"></i> ${data.streak || 0}`;
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

    toggleShop() {
        let shopModal = document.getElementById('ejo-shop-modal');
        if (shopModal) {
            shopModal.remove();
            return;
        }

        const data = progressManager.getProgressData();
        const themes = [
            { id: 'default', name: 'Original', cost: 0, icon: '🎨' },
            { id: 'midnight', name: 'Midnight', cost: 50, icon: '🌙' },
            { id: 'forest', name: 'Forest', cost: 50, icon: '🌲' },
            { id: 'sunset', name: 'Sunset', cost: 50, icon: '🌅' }
        ];

        shopModal = document.createElement('div');
        shopModal.id = 'ejo-shop-modal';
        shopModal.className = 'ejo-modal';
        shopModal.innerHTML = `
            <div class="modal-content">
                <span class="close-modal">&times;</span>
                <h3>ejo Shop</h3>
                <p>Use your coins to unlock new themes!</p>
                <div class="theme-list">
                    ${themes.map(theme => {
                        const isUnlocked = data.unlockedThemes.includes(theme.id);
                        const isActive = data.activeTheme === theme.id;
                        return `
                            <div class="theme-item ${isActive ? 'active' : ''}">
                                <div class="theme-icon">${theme.icon}</div>
                                <div class="theme-info">
                                    <strong>${theme.name}</strong>
                                    <span>${theme.cost} <i class="fas fa-coins"></i></span>
                                </div>
                                <button class="btn ${isUnlocked ? 'btn-secondary' : 'btn-primary'}"
                                        data-theme-id="${theme.id}"
                                        data-cost="${theme.cost}"
                                        ${isActive ? 'disabled' : ''}>
                                    ${isActive ? 'Active' : isUnlocked ? 'Use' : 'Buy'}
                                </button>
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
        `;
        document.body.appendChild(shopModal);

        shopModal.querySelector('.close-modal').addEventListener('click', () => shopModal.remove());
        shopModal.addEventListener('click', (e) => { if (e.target === shopModal) shopModal.remove(); });

        shopModal.querySelectorAll('button').forEach(btn => {
            btn.addEventListener('click', () => {
                const themeId = btn.dataset.themeId;
                const cost = parseInt(btn.dataset.cost);
                const isUnlocked = data.unlockedThemes.includes(themeId);

                if (isUnlocked) {
                    progressManager.setActiveTheme(themeId);
                    this.toggleShop(); // Re-render
                } else {
                    if (progressManager.unlockTheme(themeId, cost)) {
                        progressManager.setActiveTheme(themeId);
                        this.toggleShop(); // Re-render
                    } else {
                        alert("Not enough coins!");
                    }
                }
            });
        });
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
