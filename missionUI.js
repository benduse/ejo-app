// missionUI.js - Renders mission cards and weekly challenges
import missionManager from './missionManager.js';
import { DIFFICULTY_TIERS, CHAPTERS, WEEKLY_CHALLENGE } from './missionData.js';
import { launchConfetti } from './utils.js';

class MissionUI {
    constructor() {
        this.container = document.getElementById('daily-container');
        this.init();
    }

    init() {
        if (!this.container) return;
        this.render();
        this.setupEventListeners();
        this.startTimer();
    }

    setupEventListeners() {
        window.addEventListener('ejoMissionsUpdated', () => this.render());
        window.addEventListener('ejoMissionCompleted', (e) => this.handleMissionCompleted(e.detail));
    }

    startTimer() {
        setInterval(() => {
            const timerEl = document.getElementById('mission-reset-timer');
            if (timerEl) {
                const ms = missionManager.getTimeUntilReset();
                const hours = Math.floor(ms / 3600000);
                const minutes = Math.floor((ms % 3600000) / 60000);
                const seconds = Math.floor((ms % 60000) / 1000);
                timerEl.textContent = `${hours}h ${minutes}m ${seconds}s`;
            }
        }, 1000);
    }

    render() {
        const data = missionManager.getMissionData();
        const mission = data.currentMission;

        if (!mission) {
            this.renderDifficultySelection();
        } else {
            this.renderMissionCard(mission);
        }

        this.renderWeeklyChallenge(data.weeklyChallenge);
    }

    renderDifficultySelection() {
        const chapterIndex = (missionManager.data.narrativeDay - 1) % CHAPTERS.length;
        const chapter = CHAPTERS[chapterIndex];

        this.container.innerHTML = `
            <div class="app-card narrative-intro">
                <h2>Chapter ${missionManager.data.narrativeDay}: ${chapter.title}</h2>
                <p class="story-text">${chapter.story}</p>
                <hr>
                <p><strong>Choose your journey's difficulty for today:</strong></p>
                <div class="difficulty-options">
                    ${Object.values(DIFFICULTY_TIERS).map(tier => `
                        <button class="btn difficulty-btn tier-${tier.id}" data-tier="${tier.id}">
                            ${tier.name}<br>
                            <small>${tier.reward.xp} XP | ${tier.reward.coins} Coins</small>
                        </button>
                    `).join('')}
                </div>
            </div>
            <div id="weekly-challenge-container"></div>
        `;

        this.container.querySelectorAll('.difficulty-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                missionManager.generateDailyMission(btn.dataset.tier);
            });
        });
    }

    renderMissionCard(mission) {
        this.container.innerHTML = `
            <div class="app-card mission-card ${mission.completed ? 'completed' : ''}">
                <div class="mission-header">
                    <span class="mission-badge tier-${mission.difficulty}">${mission.difficulty.toUpperCase()}</span>
                    <span class="reset-timer">Resets in: <span id="mission-reset-timer">--h --m --s</span></span>
                </div>
                <h2>${mission.title}</h2>
                <p class="story-text">"${mission.story}"</p>

                <div class="task-list">
                    ${mission.tasks.map(task => {
                        const isDone = task.progress >= task.target;
                        const percent = Math.min(100, (task.progress / task.target) * 100);
                        return `
                            <div class="task-item ${isDone ? 'done' : ''}">
                                <div class="task-info">
                                    <span>${isDone ? '✅' : '⏳'} ${task.label}</span>
                                    <span>${task.progress} / ${task.target}${task.type === 'accuracy' ? '%' : ''}</span>
                                </div>
                                <div class="task-progress-bar">
                                    <div class="task-progress-fill" style="width: ${percent}%"></div>
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>

                <div class="mission-footer">
                    <div class="mission-rewards">
                        <span>XP: +${mission.reward.xp}</span>
                        <span>Coins: +${mission.reward.coins}</span>
                    </div>
                    ${mission.completed && !mission.claimed ?
                        `<button id="claim-mission-reward" class="btn btn-primary">Claim Reward</button>` :
                        mission.claimed ? `<button class="btn" disabled>Claimed</button>` :
                        `<button class="btn" disabled>In Progress...</button>`
                    }
                </div>
            </div>
            <div id="weekly-challenge-container"></div>
        `;

        const claimBtn = document.getElementById('claim-mission-reward');
        if (claimBtn) {
            claimBtn.addEventListener('click', () => {
                missionManager.claimReward();
                launchConfetti();
            });
        }
    }

    renderWeeklyChallenge(weekly) {
        const weeklyContainer = document.getElementById('weekly-challenge-container');
        if (!weeklyContainer) return;

        const allTasksDone = weekly.tasks.every(t => t.progress >= t.target);
        const totalProgress = weekly.tasks.reduce((sum, t) => sum + Math.min(1, t.progress / t.target), 0);
        const overallPercent = (totalProgress / weekly.tasks.length) * 100;

        weeklyContainer.innerHTML = `
            <div class="app-card weekly-card">
                <h3>🗓️ Weekly Challenge: ${WEEKLY_CHALLENGE.title}</h3>
                <p>${WEEKLY_CHALLENGE.description}</p>

                <div class="overall-progress">
                    <div class="progress-label">Overall Progress: ${Math.round(overallPercent)}%</div>
                    <div class="task-progress-bar">
                        <div class="task-progress-fill" style="width: ${overallPercent}%"></div>
                    </div>
                </div>

                <div class="weekly-tasks">
                    ${weekly.tasks.map(task => `
                        <div class="weekly-task-mini ${task.progress >= task.target ? 'done' : ''}">
                            <span>${task.label}</span>
                            <span>${task.progress} / ${task.target}</span>
                        </div>
                    `).join('')}
                </div>

                <div class="weekly-reward">
                    <strong>Reward:</strong> ${WEEKLY_CHALLENGE.reward.xp} XP, ${WEEKLY_CHALLENGE.reward.coins} Coins
                </div>
            </div>
        `;
    }

    handleMissionCompleted(mission) {
        // We could show a special narrative modal here
        console.log("Mission Completed!", mission);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new MissionUI();
});
