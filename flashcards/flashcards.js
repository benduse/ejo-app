document.addEventListener("DOMContentLoaded", () => {
	let flashcards = [];
	let currentCardIndex = 0;

	// DOM elements
	const flashcardElement = document.getElementById("flashcard");
	const frontContent = document.getElementById("front-content");
	const backContent = document.getElementById("back-content");
	const prevButton = document.getElementById("prev-flashcard");
	const nextButton = document.getElementById("next-flashcard");
	const flipButton = document.getElementById("flip-flashcard");
	const currentCardElement = document.getElementById("current-card");
	const totalCardsElement = document.getElementById("total-cards");

	// Fetch the JSON data
	fetch("flashcards.json")
		.then((response) => response.json())
		.then((data) => {
			flashcards = data.flashcards;
			// Update total card count
			totalCardsElement.textContent = flashcards.length;
			// Display the first card
			updateCard();
		})
		.catch((error) => {
			console.error("Error loading JSON:", error);
			// Fallback if JSON fails to load
			flashcardElement.querySelector(
				".card-front .card-content p"
			).textContent = "Error loading flashcards";
		});

	// Function to update card content
	function updateCard() {
		if (flashcards.length === 0) return;

		const card = flashcards[currentCardIndex];

		// Update front side with Kinyarwanda word, meaning, and phonetics
		frontContent.innerHTML = `
            <div>
                <p class="word">${card.kinyarwandaWord}</p>
				<p class="phonetics">${card.phonetics || ""}</p>
                <p class="meaning">${card.meaning}</p>
                
            </div>
        `;

		// Update back side with phonetics and example
		backContent.innerHTML = `
            <div>
                <p class="example">${card.example || "No example available"}</p>
            </div>
        `;

		// Update card counter
		currentCardElement.textContent = currentCardIndex + 1;

		// Reset card to front face when changing cards
		flashcardElement.classList.remove("flipped");
	}

	// Previous button functionality
	prevButton.addEventListener("click", () => {
		if (currentCardIndex > 0) {
			currentCardIndex--;
			updateCard();
		}
	});

	// Flip button functionality
	flipButton.addEventListener("click", () => {
		flashcardElement.classList.toggle("flipped");
	});

	// Click on card to flip (additional convenience)
	flashcardElement.addEventListener("click", () => {
		flashcardElement.classList.toggle("flipped");
	});

	// Next button functionality
	nextButton.addEventListener("click", () => {
		if (currentCardIndex < flashcards.length - 1) {
			currentCardIndex++;
			updateCard();
		}
	});

	// Keyboard navigation
	document.addEventListener("keydown", (e) => {
		if (e.key === "ArrowLeft") {
			prevButton.click();
		} else if (e.key === "ArrowRight") {
			nextButton.click();
		} else if (e.key === " " || e.key === "Enter") {
			flipButton.click();
		}
	});
});
