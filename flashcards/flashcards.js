import LeaderboardManager from '../quiz/leaderboardManager.js';
import { shuffleArray, fetchJSON, renderLeaderboard } from '../utils.js';
import progressManager from '../progressManager.js';
import missionManager from '../missionManager.js';

document.addEventListener("DOMContentLoaded", () => {
    let allFlashcards = [];
    let filteredFlashcards = [];
    let currentCardIndex = 0;
    // ✅ Initialize from persistent state
    let viewedCards = new Set(progressManager.getProgressData().viewedFlashcardIds || []);

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
    const leaderboard = new LeaderboardManager('flashcard_leaderboard', 'flashcard_player_name');

    // ✅ Fetch flashcards from JSON file
    function loadFlashcards() {
        fetchJSON('./flashcards.json')
            .then(data => {
                allFlashcards = data.flashcards;
                populateCategories();
                applyFilters();
            })
            .catch(() => {
                frontContent.innerHTML = `<p class="error">Failed to load flashcards. Please try again later.</p>`;
            });
    }

    function populateCategories() {
        const categories = [...new Set(allFlashcards.map(c => c.category))].filter(Boolean);
        const filterEl = document.getElementById('category-filter');
        categories.sort().forEach(cat => {
            const opt = document.createElement('option');
            opt.value = cat;
            opt.textContent = cat.charAt(0).toUpperCase() + cat.slice(1);
            filterEl.appendChild(opt);
        });
    }

    function applyFilters() {
        const category = document.getElementById('category-filter').value;
        const hideMastered = document.getElementById('hide-mastered').checked;
        const masteredIds = progressManager.getProgressData().masteredFlashcardIds || [];

        filteredFlashcards = allFlashcards.filter(card => {
            const catMatch = category === 'all' || card.category === category;
            const masteryMatch = !hideMastered || !masteredIds.includes(card.id);
            return catMatch && masteryMatch;
        });

        currentCardIndex = 0;
        updateCard();
    }

    // ✅ Update card content
    function updateCard() {
        if (filteredFlashcards.length === 0) {
            frontContent.innerHTML = `<p>No flashcards found matching the criteria.</p>`;
            backContent.innerHTML = ``;
            totalCardsElement.textContent = '0';
            currentCardElement.textContent = '0';
            return;
        }

        const currentCard = filteredFlashcards[currentCardIndex];

        // Track as viewed
        if (!viewedCards.has(currentCard.id)) {
            viewedCards.add(currentCard.id);
            progressManager.recordFlashcardView(currentCard.id);
            missionManager.updateTaskProgress('flashcards', 1);
        }

        const wordEl = document.createElement('p');
        wordEl.className = 'word';
        wordEl.textContent = currentCard.kinyarwandaWord;

        const phoneticsEl = document.createElement('p');
        phoneticsEl.className = 'phonetics';
        phoneticsEl.textContent = currentCard.phonetics || '';

        const meaningEl = document.createElement('p');
        meaningEl.className = 'meaning';
        meaningEl.textContent = currentCard.meaning;

        frontContent.replaceChildren(wordEl, phoneticsEl, meaningEl);

        const exampleEl = document.createElement('p');
        exampleEl.className = 'example';
        exampleEl.textContent = currentCard.example || 'No example available';

        backContent.replaceChildren(exampleEl);

        currentCardElement.textContent = currentCardIndex + 1;
        totalCardsElement.textContent = filteredFlashcards.length;
        flashcardElement.classList.remove("flipped");

        const masteredIds = progressManager.getProgressData().masteredFlashcardIds || [];
        const isMastered = masteredIds.includes(currentCard.id);
        const masteryBtn = document.getElementById('mastered-toggle');
        if (masteryBtn) {
            masteryBtn.innerHTML = isMastered ? '<i class="fas fa-check-circle"></i>' : '<i class="far fa-check-circle"></i>';
            masteryBtn.classList.toggle('is-mastered', isMastered);
        }

        updateNavButtons();
    }

    // ✅ Update navigation button states
    function updateNavButtons() {
        prevButton.disabled = currentCardIndex <= 0;
        nextButton.disabled = currentCardIndex >= filteredFlashcards.length - 1;
    }

    // ✅ Navigation helpers
    function showPrevCard() {
        if (currentCardIndex > 0) {
            currentCardIndex--;
            updateCard();
        }
    }

    function showNextCard() {
        if (currentCardIndex < filteredFlashcards.length - 1) {
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
        if (filteredFlashcards.length <= 1) return;
        const currentIndex = currentCardIndex;
        do {
            currentCardIndex = Math.floor(Math.random() * filteredFlashcards.length);
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

        const matchingCards = allFlashcards.filter((card) => {
            const searchString = `${card.kinyarwandaWord} ${card.meaning} ${card.phonetics || ''} ${card.example || ''}`.toLowerCase();
            return searchString.includes(query.toLowerCase());
        });

        displaySearchResults(matchingCards);
    }

    function displaySearchResults(matchingCards) {
        searchResults.replaceChildren();
        if (matchingCards.length === 0) {
            const noMatch = document.createElement('p');
            noMatch.textContent = 'No matches found';
            searchResults.appendChild(noMatch);
        } else {
            matchingCards.forEach((card) => {
                const cardIndex = allFlashcards.findIndex(flashcard => flashcard === card);
                const resultDiv = document.createElement('div');
                resultDiv.className = 'search-result';
                resultDiv.dataset.index = cardIndex;
                const wordStrong = document.createElement('strong');
                wordStrong.textContent = card.kinyarwandaWord;
                resultDiv.appendChild(wordStrong);
                resultDiv.appendChild(document.createTextNode(` - ${card.meaning}`));
                searchResults.appendChild(resultDiv);
            });
        }
        searchResults.style.display = 'block';
    }

    function goToCard(cardNumber) {
        const cardIndex = cardNumber - 1;
        if (cardIndex >= 0 && cardIndex < filteredFlashcards.length) {
            currentCardIndex = cardIndex;
            updateCard();
            return true;
        }
        return false;
    }

    // Additional event listeners
    skipButton.addEventListener("click", skipCard);

    document.getElementById('category-filter').addEventListener('change', applyFilters);
    document.getElementById('hide-mastered').addEventListener('change', applyFilters);

    document.getElementById('mastered-toggle').addEventListener('click', () => {
        if (filteredFlashcards.length === 0) return;
        const currentCard = filteredFlashcards[currentCardIndex];
        progressManager.toggleFlashcardMastery(currentCard.id);
        updateCard();
    });

    searchInput.addEventListener("input", (e) => {
        searchFlashcards(e.target.value);
    });

    searchResults.addEventListener("click", (e) => {
        const resultElement = e.target.closest('.search-result');
        if (resultElement) {
            const cardIndex = parseInt(resultElement.dataset.index);
            currentCardIndex = cardIndex;
            updateCard();
            searchInput.value = '';
            searchResults.style.display = 'none';
        }
    });

    gotoCardInput.addEventListener("change", (e) => {
        const cardNumber = parseInt(e.target.value);
        if (goToCard(cardNumber)) {
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
        const viewedFlashcards = allFlashcards.filter(card => viewedCards.has(card.id));

        if (viewedFlashcards.length === 0) {
            alert("Please view some flashcards before starting the quiz!");
            return;
        }

        if (viewedFlashcards.length > 25) {
            quizCards = shuffleArray([...viewedFlashcards]).slice(0, 25);
        } else {
            quizCards = shuffleArray([...viewedFlashcards]);
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

        const currentCard = quizCards[quizIndex];
        quizQuestion.textContent = `What does "${currentCard.kinyarwandaWord}" mean?`;

        let answerOptions = [currentCard.meaning];
        while (answerOptions.length < 4) {
            const randomCard = allFlashcards[Math.floor(Math.random() * allFlashcards.length)];
            if (!answerOptions.includes(randomCard.meaning)) {
                answerOptions.push(randomCard.meaning);
            }
        }
        answerOptions = answerOptions.sort(() => Math.random() - 0.5);

        quizOptions.innerHTML = answerOptions.map(answerOption => 
            `<button class="quiz-option">${answerOption}</button>`
        ).join("");

        quizFeedback.textContent = "";
        nextQuestionBtn.style.display = "none";

        document.querySelectorAll(".quiz-option").forEach(btn => {
            btn.addEventListener("click", () => {
                if (btn.textContent === currentCard.meaning) {
                    quizFeedback.textContent = "✅ Correct!";
                    score++;
                } else {
                    quizFeedback.textContent = `❌ Wrong! The correct answer is "${currentCard.meaning}"`;
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

        progressManager.recordQuizResult(score, quizCards.length, 0);
        missionManager.updateTaskProgress('quizzes', 1);
        missionManager.updateTaskProgress('accuracy', Math.round((score / quizCards.length) * 100));

        leaderboard.addScore(score);
        displayLeaderboard();

        const backBtn = document.createElement("button");
        backBtn.textContent = "Back to Flashcards";
        backBtn.addEventListener("click", () => {
            quizContainer.style.display = "none";
            document.getElementById("flashcards-section").style.display = "block";
            document.getElementById("flashcard-leaderboard").style.display = "none";
        });
        quizOptions.appendChild(backBtn);
    }

    nextQuestionBtn.addEventListener("click", () => {
        quizIndex++;
        showQuizQuestion();
    });

    function displayLeaderboard() {
        const leaderboardEl = document.getElementById('flashcard-leaderboard');
        const listEl = document.getElementById('flashcard-leaderboard-list');
        leaderboardEl.style.display = 'block';
        renderLeaderboard(listEl, leaderboard.getLeaderboard());
    }

    startQuizButton.addEventListener("click", startQuiz);

    // ✅ Initialize
    loadFlashcards();
    document.getElementById("flashcards-section").style.display = "block";
});
