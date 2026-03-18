import progressManager from './progressManager.js';
import { fetchJSON } from './utils.js';

document.addEventListener('DOMContentLoaded', function() {
    // Word of the Day / Daily Discovery
    async function initDailyDiscovery() {
        const dailyContainer = document.getElementById('daily-container');
        if (!dailyContainer) return;

        try {
            const data = await fetchJSON('./flashcards/flashcards.json');
            const flashcards = data.flashcards;

            // Use date to pick a consistent word for the day
            const today = new Date();
            const seed = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();
            const index = seed % flashcards.length;
            const dailyWord = flashcards[index];

            const alreadyClaimed = progressManager.getProgressData().lastDailyDiscovery === today.toDateString();

            dailyContainer.innerHTML = `
                <div class="app-card daily-card">
                    <h3>🌟 Daily Discovery</h3>
                    <p>Learn a new word every day and earn bonus XP!</p>
                    <div class="word-box">${dailyWord.kinyarwandaWord}</div>
                    <p><em>${dailyWord.meaning}</em></p>
                    <button id="claim-xp" class="btn btn-secondary" ${alreadyClaimed ? 'disabled' : ''}>
                        ${alreadyClaimed ? 'XP Claimed Today' : 'Claim 50 XP'}
                    </button>
                </div>
            `;

            const claimBtn = document.getElementById('claim-xp');
            if (claimBtn && !alreadyClaimed) {
                claimBtn.addEventListener('click', () => {
                    if (progressManager.recordDailyDiscovery()) {
                        claimBtn.disabled = true;
                        claimBtn.textContent = 'XP Claimed Today';
                    }
                });
            }
        } catch (e) {
            console.error("Failed to load daily word", e);
        }
    }

    initDailyDiscovery();

    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop - 70, // Adjust for header height
                    behavior: 'smooth'
                });
            }
        });
    });
    
    // Mobile navigation toggle (a hamburger menu for smaller screens)
    const navToggle = document.querySelector('.nav-toggle');
    const navLinks = document.querySelector('.nav-links');
    if (navToggle) {
        navToggle.addEventListener('click', () => {
            navLinks.classList.toggle('active');
        });
    }
});