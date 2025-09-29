document.addEventListener("DOMContentLoaded", () => {
    let flashcards = [];
    let currentCardIndex = 0;
    let viewedCards = new Set(); // ✅ Track viewed cards

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

    // ✅ Quiz DOM elements
    const startQuizButton = document.getElementById("start-quiz");
    const quizContainer = document.getElementById("quiz-container");
    const quizQuestion = document.getElementById("quiz-question");
    const quizOptions = document.getElementById("quiz-options");
    const quizFeedback = document.getElementById("quiz-feedback");
    const nextQuestionBtn = document.getElementById("next-question");
    const quizScoreElement = document.getElementById("quiz-score");

    let quizIndex = 0;
    let score = 0;
    let quizCards = [];

    // ✅ Fetch flashcards from JSON file
    function loadFlashcards() {
        fetch("./flashcards.json")
            .then(response => {
                if (!response.ok) {
                    throw new Error("Network error");
                }
                return response.json();
            })
            .then(data => {
                flashcards = data.flashcards;
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

        // Track as viewed
        viewedCards.add(card.id);

        frontContent.innerHTML = `
            <p class="word">${card.kinyarwandaWord}</p>
            <p class="phonetics">${card.phonetics || ""}</p>
            <p class="meaning">${card.meaning}</p>
        `;
        backContent.innerHTML = `
            <p class="example">${card.example || "No example available"}</p>
        `;

        currentCardElement.textContent = currentCardIndex + 1;
        flashcardElement.classList.remove("flipped");
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
        switch (e.key) {
            case "ArrowLeft":
                showPrevCard();
                break;
            case "ArrowRight":
                showNextCard();
                break;
            case " ": 
            case "Enter":
                flipCard();
                break;
        }
    });

    // Skip to a random card
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

        const results = flashcards.filter((card) => {
            const searchString = `${card.kinyarwandaWord} ${card.meaning} ${card.phonetics || ''} ${card.example || ''}`.toLowerCase();
            return searchString.includes(query.toLowerCase());
        });

        displaySearchResults(results);
    }

    function displaySearchResults(results) {
        if (results.length === 0) {
            searchResults.innerHTML = '<p>No matches found</p>';
        } else {
            searchResults.innerHTML = results.map((card) => {
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
            e.target.value = '';
        } else {
            alert('Please enter a valid card number');
        }
    });

    document.addEventListener("keydown", (e) => {
        switch (e.key) {
            case "ArrowLeft":
                showPrevCard();
                break;
            case "ArrowRight":
                showNextCard();
                break;
            case " ": 
            case "Enter":
                flipCard();
                break;
            case "s": 
                skipCard();
                break;
        }
    });

    document.addEventListener("click", (e) => {
        if (!searchResults.contains(e.target) && e.target !== searchInput) {
            searchResults.style.display = 'none';
        }
    });

    // ✅ QUIZ MODE FUNCTIONS
    function startQuiz() {
        const viewedArray = flashcards.filter(card => viewedCards.has(card.id));

        if (viewedArray.length === 0) {
            alert("Please view some flashcards before starting the quiz!");
            return;
        }

        if (viewedArray.length > 25) {
            quizCards = [...viewedArray]
                .sort(() => Math.random() - 0.5)
                .slice(0, 25);
        } else {
            quizCards = [...viewedArray].sort(() => Math.random() - 0.5);
        }

        quizIndex = 0;
        score = 0;

        quizContainer.style.display = "block";
        document.getElementById("flashcards-section").style.display = "none";
        showQuizQuestion();
    }

    function showQuizQuestion() {
        if (quizIndex >= quizCards.length) {
            endQuiz();
            return;
        }

        const card = quizCards[quizIndex];
        quizQuestion.textContent = `What does "${card.kinyarwandaWord}" mean?`;

        let options = [card.meaning];
        while (options.length < 4) {
            const random = flashcards[Math.floor(Math.random() * flashcards.length)];
            if (!options.includes(random.meaning)) {
                options.push(random.meaning);
            }
        }
        options = options.sort(() => Math.random() - 0.5);

        quizOptions.innerHTML = options.map(opt => 
            `<button class="quiz-option">${opt}</button>`
        ).join("");

        quizFeedback.textContent = "";
        nextQuestionBtn.style.display = "none";

        document.querySelectorAll(".quiz-option").forEach(btn => {
            btn.addEventListener("click", () => {
                if (btn.textContent === card.meaning) {
                    quizFeedback.textContent = "✅ Correct!";
                    score++;
                } else {
                    quizFeedback.textContent = `❌ Wrong! The correct answer is "${card.meaning}"`;
                }
                quizScoreElement.textContent = `Score: ${score}`;
                nextQuestionBtn.style.display = "inline-block";
            });
        });
    }

    function endQuiz() {
        quizQuestion.textContent = "Quiz finished!";
        quizOptions.innerHTML = "";
        quizFeedback.textContent = `Final Score: ${score} / ${quizCards.length}`;
        nextQuestionBtn.style.display = "none";

        const backBtn = document.createElement("button");
        backBtn.textContent = "Back to Flashcards";
        backBtn.addEventListener("click", () => {
            quizContainer.style.display = "none";
            document.getElementById("flashcards-section").style.display = "block";
        });
        quizOptions.appendChild(backBtn);
    }

    nextQuestionBtn.addEventListener("click", () => {
        quizIndex++;
        showQuizQuestion();
    });

    startQuizButton.addEventListener("click", startQuiz);

    // ✅ Initialize
    loadFlashcards();
    document.getElementById("flashcards-section").style.display = "block";
});
