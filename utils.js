// Shared utility functions

export function shuffleArray(array) {
    for (let currentIndex = array.length - 1; currentIndex > 0; currentIndex--) {
        const swapIndex = Math.floor(Math.random() * (currentIndex + 1));
        [array[currentIndex], array[swapIndex]] = [array[swapIndex], array[currentIndex]];
    }
    return array;
}

const ALLOWED_JSON_PATH = /^\.{1,2}(\/[\w-]+)*\/[\w-]+\.json$/;

export async function fetchJSON(path) {
    if (!ALLOWED_JSON_PATH.test(path)) throw new Error(`Blocked request to disallowed path: ${path}`);
    const response = await fetch(path);
    if (!response.ok) throw new Error(`Failed to load: ${path}`);
    return response.json();
}

export function renderLeaderboard(listEl, entries) {
    listEl.innerHTML = '';
    entries.forEach(entry => {
        const li = document.createElement('li');
        li.textContent = entry.date
            ? `${entry.name} - ${entry.score} (${entry.date})`
            : `${entry.name} - ${entry.score}`;
        listEl.appendChild(li);
    });
}

export function launchConfetti() {
    const confettiContainer = document.createElement('div');
    confettiContainer.className = 'confetti';
    document.body.appendChild(confettiContainer);
    for (let i = 0; i < 120; i++) {
        const confettiPiece = document.createElement('div');
        confettiPiece.style.cssText = `
            position: absolute;
            width: 8px;
            height: 16px;
            background: hsl(${Math.random() * 360}, 80%, 60%);
            left: ${Math.random() * 100}vw;
            top: -20px;
            opacity: 0.8;
            transform: rotate(${Math.random() * 360}deg);
        `;
        confettiContainer.appendChild(confettiPiece);
        setTimeout(() => {
            confettiPiece.style.transition = 'top 2.2s cubic-bezier(.23,1.02,.64,1), transform 2.2s';
            confettiPiece.style.top = `${80 + Math.random() * 20}vh`;
            confettiPiece.style.transform += ` scale(${0.7 + Math.random() * 0.6})`;
        }, 10);
    }
    setTimeout(() => confettiContainer.remove(), 2500);
}
