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

    // ✅ Fetch flashcards from JSON file
    async function loadFlashcards() {
        try {
            const response = await fetch("../questions/flashcards.json");
            if (!response.ok) throw new Error("Network error");
            
            flashcards = await response.json();
            totalCardsElement.textContent = flashcards.length;
            updateCard();
        } catch (error) {
            console.error("Error loading flashcards:", error);
            frontContent.innerHTML = `<p class="error">Failed to load flashcards. Please try again later.</p>`;
        }
    }

    // ✅ Update card content
    function updateCard() {
        if (flashcards.length === 0) return;

        const card = flashcards[currentCardIndex];
        frontContent.innerHTML = `
            <p class="word">${card.kinyarwandaWord}</p>
            <p class="phonetics">${card.phonetics || ""}</p>
            <p class="meaning">${card.meaning}</p>
        `;
        backContent.innerHTML = `
            <p class="example">${card.example || "No example available"}</p>
        `;

        currentCardElement.textContent = currentCardIndex + 1;
        flashcardElement.classList.remove("flipped"); // reset flip
    }

    // ✅ Navigation helpers
    function showPrevCard() {
        if (currentCardIndex > 0) {
            currentCardIndex--;
            updateCard();
        }
    }

    function showNextCard() {
        if (currentCardIndex < flashcards.length - 1) {
            currentCardIndex++;
            updateCard();
        }
    }

    // ✅ Event listeners
    prevButton.addEventListener("click", showPrevCard);
    nextButton.addEventListener("click", showNextCard);
    flipButton.addEventListener("click", () => flashcardElement.classList.toggle("flipped"));
    flashcardElement.addEventListener("click", () => flashcardElement.classList.toggle("flipped"));

    document.addEventListener("keydown", (e) => {
        if (e.key === "ArrowLeft") showPrevCard();
        else if (e.key === "ArrowRight") showNextCard();
        else if (e.key === " " || e.key === "Enter") flashcardElement.classList.toggle("flipped");
    });

    // ✅ Initialize
    loadFlashcards();
});
