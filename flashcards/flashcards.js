let flashcards = [];
let currentIndex = 0;

async function loadFlashcards() {
	try {
		const response = await fetch("flashcards.json");
		const data = await response.json();
		flashcards = Array.isArray(data) ? data : data.flashcards;
		setupControls();
		renderFlashcard();
	} catch (error) {
		console.error("Error loading flashcards:", error);
		// Optionally show error in UI
	}
}

function renderFlashcard() {
	const container = document.getElementById("flashcard-container");
	container.innerHTML = "";
	if (!flashcards || !flashcards.length) return;
	const item = flashcards[currentIndex];
	const card = document.createElement("div");
	card.classList.add("flashcard");
	card.tabIndex = 0;
	card.onclick = () => flipCard(card);
	card.innerHTML = `
        <div class="front">
            <div class="kinyarwanda-word">${item.kinyarwandaWord}</div>
            <div class="phonetics">${item.phonetics}</div>
        </div>
        <div class="back">
            <div class="meaning">${item.meaning}</div>
            <div class="example">${item.example}</div>
        </div>
    `;
	container.appendChild(card);
}

function flipCard(card) {
	card.classList.toggle("flipped");
}

function setupControls() {
	document.getElementById("prev-flashcard").onclick = () => {
		if (!flashcards.length) return;
		currentIndex = (currentIndex - 1 + flashcards.length) % flashcards.length;
		renderFlashcard();
	};
	document.getElementById("next-flashcard").onclick = () => {
		if (!flashcards.length) return;
		currentIndex = (currentIndex + 1) % flashcards.length;
		renderFlashcard();
	};
	document.getElementById("flip-flashcard").onclick = () => {
		const card = document.querySelector(".flashcard");
		if (card) flipCard(card);
	};
}

document.addEventListener("DOMContentLoaded", loadFlashcards);
