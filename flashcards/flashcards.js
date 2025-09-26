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
    const skipButton = document.getElementById("skip-flashcard");
    const searchInput = document.getElementById("search-input");
    const searchResults = document.getElementById("search-results");
    const gotoCardInput = document.getElementById("goto-card");
    const currentCardElement = document.getElementById("current-card");
    const totalCardsElement = document.getElementById("total-cards");

    // ✅ Fetch flashcards from JSON file
    function loadFlashcards() {
        fetch("./flashcards/flashcards.json")
            .then(response => {
                if (!response.ok) {
                    throw new Error("Network error");
                }
                return response.json();
            })
            .then(data => {
                flashcards = data;
                totalCardsElement.textContent = flashcards.length;
                updateCard();
            })
            .catch(error => {
                console.error("Error loading flashcards:", error);
                frontContent.innerHTML = `<p class="error">Failed to load flashcards. Please try again later.</p>`;
            });
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
        updateNavButtons();
    }

    // ✅ Update navigation button states
    function updateNavButtons() {
        prevButton.disabled = currentCardIndex === 0;
        nextButton.disabled = currentCardIndex === flashcards.length - 1;
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

    function flipCard() {
        flashcardElement.classList.toggle("flipped");
    }

    // ✅ Event listeners
    prevButton.addEventListener("click", showPrevCard);
    nextButton.addEventListener("click", showNextCard);
    flipButton.addEventListener("click", flipCard);
    flashcardElement.addEventListener("click", flipCard);

    document.addEventListener("keydown", (e) => {
        // Use a switch statement for better readability
        switch (e.key) {
            case "ArrowLeft":
                showPrevCard();
                break;
            case "ArrowRight":
                showNextCard();
                break;
            case " ": // Space bar
            case "Enter":
                flipCard();
                break;
        }
    });

    // Skip to a random unviewed card
    function skipCard() {
        if (flashcards.length <= 1) return;
        const currentIndex = currentCardIndex;
        do {
            currentCardIndex = Math.floor(Math.random() * flashcards.length);
        } while (currentCardIndex === currentIndex);
        updateCard();
    }

    // Search functionality
    function searchFlashcards(query) {
        if (!query.trim()) {
            searchResults.innerHTML = '';
            searchResults.style.display = 'none';
            return;
        }

        const results = flashcards.filter((card, index) => {
            const searchString = `${card.kinyarwandaWord} ${card.meaning} ${card.phonetics || ''} ${card.example || ''}`.toLowerCase();
            return searchString.includes(query.toLowerCase());
        });

        displaySearchResults(results);
    }

    function displaySearchResults(results) {
        if (results.length === 0) {
            searchResults.innerHTML = '<p>No matches found</p>';
        } else {
            searchResults.innerHTML = results.map((card, index) => {
                const cardIndex = flashcards.findIndex(f => f === card);
                return `
                    <div class="search-result" data-index="${cardIndex}">
                        <strong>${card.kinyarwandaWord}</strong> - ${card.meaning}
                    </div>
                `;
            }).join('');
        }
        searchResults.style.display = 'block';
    }

    function goToCard(number) {
        const index = number - 1;
        if (index >= 0 && index < flashcards.length) {
            currentCardIndex = index;
            updateCard();
            return true;
        }
        return false;
    }

    // Additional event listeners
    skipButton.addEventListener("click", skipCard);

    searchInput.addEventListener("input", (e) => {
        searchFlashcards(e.target.value);
    });

    searchResults.addEventListener("click", (e) => {
        const resultElement = e.target.closest('.search-result');
        if (resultElement) {
            const index = parseInt(resultElement.dataset.index);
            currentCardIndex = index;
            updateCard();
            searchInput.value = '';
            searchResults.style.display = 'none';
        }
    });

    gotoCardInput.addEventListener("change", (e) => {
        const number = parseInt(e.target.value);
        if (goToCard(number)) {
            e.target.value = ''; // Clear the input
        } else {
            alert('Please enter a valid card number');
        }
    });

    document.addEventListener("keydown", (e) => {
        // Use a switch statement for better readability
        switch (e.key) {
            case "ArrowLeft":
                showPrevCard();
                break;
            case "ArrowRight":
                showNextCard();
                break;
            case " ": // Space bar
            case "Enter":
                flipCard();
                break;
            case "s": // Skip with 's' key
                skipCard();
                break;
        }
    });

    // Click outside search results to close them
    document.addEventListener("click", (e) => {
        if (!searchResults.contains(e.target) && e.target !== searchInput) {
            searchResults.style.display = 'none';
        }
    });

    // ✅ Initialize
    loadFlashcards();
});
