// Simple confetti animation for celebratory effect
function launchConfetti() {
    const confettiContainer = document.createElement('div');
    confettiContainer.className = 'confetti';
    document.body.appendChild(confettiContainer);
    for (let i = 0; i < 120; i++) {
        const conf = document.createElement('div');
        conf.style.position = 'absolute';
        conf.style.width = '8px';
        conf.style.height = '16px';
        conf.style.background = `hsl(${Math.random()*360}, 80%, 60%)`;
        conf.style.left = Math.random() * 100 + 'vw';
        conf.style.top = '-20px';
        conf.style.opacity = 0.8;
        conf.style.transform = `rotate(${Math.random()*360}deg)`;
        confettiContainer.appendChild(conf);
        setTimeout(() => {
            conf.style.transition = 'top 2.2s cubic-bezier(.23,1.02,.64,1), transform 2.2s';
            conf.style.top = (80 + Math.random()*20) + 'vh';
            conf.style.transform += ` scale(${0.7 + Math.random()*0.6})`;
        }, 10);
    }
    setTimeout(() => {
        confettiContainer.remove();
    }, 2500);
}
