import { shuffleArray, fetchJSON, renderLeaderboard, launchConfetti } from '../utils.js';
import LeaderboardManager from './leaderboardManager.js';
import progressManager from '../progressManager.js';

class QuizApp {
    constructor() {
        this.currentQuestion = 0;
        this.score = 0;
        this.correctCount = 0;
        this.wrongCount = 0;
        this.questions = [];
        this.endedEarly = false;
        this.timerEnabled = false;
        this.timer = null;
        this.leaderboardManager = new LeaderboardManager('ejo_leaderboard', 'ejo_player_name');
        this.init();
    }

    async init() {
        this.questionEl       = document.getElementById('question');
        this.choicesEl        = document.getElementById('choices');
        this.progressBar      = document.getElementById('progress-bar');
        this.resultContainer  = document.getElementById('result-container');
        this.quizContainer    = document.getElementById('quiz-container');
        this.finalScoreEl     = document.getElementById('final-score');
        this.languageSelect   = document.getElementById('languageSelect');
        this.difficultySelect = document.getElementById('difficultySelect');
        this.scoreEl          = document.getElementById('score');
        this.difficultyBadge  = document.getElementById('difficulty-badge');
        this.leaderboardList  = document.getElementById('leaderboard-list');
        this.leaderboardContainer = document.getElementById('leaderboard-container');
        this.timerEl          = document.getElementById('timer');
        this.timerContainer   = document.getElementById('timer-container');

        this.difficultySelect.addEventListener('change', () => {
            this.timerEnabled = this.difficultySelect.value !== 'all';
            this.restartQuiz();
        });
        this.languageSelect.addEventListener('change', () => this.handleLanguageChange());
        document.getElementById('restart-btn').addEventListener('click', () => this.restartQuiz());
        document.getElementById('end-quiz-btn').addEventListener('click', () => this.endQuiz());

        await this.loadQuestions();
        progressManager.recordLanguageTry(this.languageSelect.value);
        this.showQuestion();
    }

    async loadQuestions() {
        const language = this.languageSelect.value;
        const fileMap = {
            french: '../questions/french.json',
            spanish: '../questions/spanish.json',
            ikinyarwanda: '../questions/ikinyarwanda.json'
        };
        try {
            const questionsData = await fetchJSON(fileMap[language] ?? fileMap.ikinyarwanda);
            this.questions = questionsData.questions.map((q, idx) => ({
                ...q,
                difficulty: idx < 10 ? 'easy' : idx < 35 ? 'medium' : 'hard'
            }));

            const selectedDifficulty = this.difficultySelect.value;
            if (selectedDifficulty !== 'all') {
                this.questions = this.questions.filter(q => q.difficulty === selectedDifficulty);
            }

            this.questions = shuffleArray(this.questions).slice(0, 10);
            this.currentQuestion = 0;
            this.score = 0;
            this.correctCount = 0;
            this.wrongCount = 0;
        } catch {
            alert('Failed to load questions.');
            this.questions = [];
        }
    }

    async handleLanguageChange() {
        await this.loadQuestions();
        progressManager.recordLanguageTry(this.languageSelect.value);
        this.restartQuiz();
        this.difficultyBadge.className = 'difficulty-badge difficulty-easy';
    }

    showQuestion() {
        if (this.timer) clearInterval(this.timer);

        if (this.questions.length === 0) {
            this.questionEl.textContent = 'No questions available for the selected options.';
            this.choicesEl.innerHTML = '';
            this.progressBar.style.width = '0%';
            this.timerContainer.style.display = 'none';
            return;
        }

        if (this.currentQuestion < this.questions.length) {
            const currentQuestion = this.questions[this.currentQuestion];
            const questionDifficulty = currentQuestion.difficulty || 'easy';

            this.difficultyBadge.textContent = questionDifficulty.charAt(0).toUpperCase() + questionDifficulty.slice(1);
            this.difficultyBadge.className = `difficulty-badge difficulty-${questionDifficulty}`;
            this.progressBar.style.width = `${(this.currentQuestion / this.questions.length) * 100}%`;
            this.questionEl.textContent = currentQuestion.question;

            this.choicesEl.innerHTML = '';
            currentQuestion.choices.forEach(choice => {
                const choiceButton = document.createElement('button');
                choiceButton.textContent = choice;
                choiceButton.className = 'choice-btn';
                choiceButton.addEventListener('click', () => this.checkAnswer(choice));
                this.choicesEl.appendChild(choiceButton);
            });

            if (this.timerEnabled) {
                this.timeLeft = questionDifficulty === 'easy' ? 10 : questionDifficulty === 'medium' ? 9 : 8;
                this.timerEl.textContent = this.timeLeft;
                this.timerContainer.style.display = '';
                this.timerContainer.style.color = '';
                this.startTimer();
            } else {
                this.timerContainer.style.display = 'none';
            }
        } else {
            this.showResult();
        }
    }

    startTimer() {
        if (this.timer) clearInterval(this.timer);
        this.timer = setInterval(() => {
            this.timerEl.textContent = --this.timeLeft;
            if (this.timeLeft <= 0) {
                clearInterval(this.timer);
                this.timerContainer.style.color = '#d84315';
                this.checkAnswer(null, true);
            }
        }, 1000);
    }

    checkAnswer(choice, timedOut = false) {
        if (this.timer) clearInterval(this.timer);

        const activeQuestion = this.questions[this.currentQuestion];
        if (!activeQuestion) return;

        const isCorrect = choice === activeQuestion.correctAnswer;

        document.querySelectorAll('.choice-btn').forEach(choiceButton => {
            choiceButton.disabled = true;
            if (choiceButton.textContent === activeQuestion.correctAnswer) choiceButton.classList.add('correct');
            else if (choiceButton.textContent === choice && !isCorrect && choice !== null) choiceButton.classList.add('incorrect');
        });

        if (timedOut) {
            this.wrongCount++;
            this.streak = 0;
        } else if (isCorrect) {
            this.score += 5;
            this.correctCount++;
            this.streak = (this.streak || 0) + 1;
            if (this.streak >= 10) {
                const { ACHIEVEMENTS } = await import('../progressManager.js');
                progressManager.unlockAchievement(ACHIEVEMENTS.BRAINIAC);
            }
            progressManager.addXP(10);
        } else {
            this.streak = 0;
            this.score -= 1;
            this.wrongCount++;
        }

        this.scoreEl.textContent = this.score;

        setTimeout(() => {
            if (this.wrongCount >= 5) this.showResult(true);
            else { this.currentQuestion++; this.showQuestion(); }
        }, 1200);
    }

    showResult(earlyEnd = false) {
        this.quizContainer.classList.add('hide');
        this.resultContainer.classList.remove('hide');

        const earlyEndMessage = earlyEnd
            ? ' (Quiz ended: 5 wrong answers)'
            : this.endedEarly ? ' (Quiz ended by user)' : '';

        this.finalScoreEl.textContent = `${this.score} out of ${this.questions.length * 5}${earlyEndMessage}`;

        if (!earlyEnd && !this.endedEarly) {
            progressManager.recordQuizResult(this.correctCount, this.questions.length, 0); // Streak handled real-time now
        }

        this.leaderboardManager.addScore(this.score);
        this.leaderboardContainer.classList.remove('hide');
        renderLeaderboard(this.leaderboardList, this.leaderboardManager.getLeaderboard());

        if (this.leaderboardManager.isHighScore(this.score)) launchConfetti();
    }

    endQuiz() {
        this.endedEarly = true;
        this.showResult(false);
    }

    async restartQuiz() {
        this.currentQuestion = 0;
        this.score = 0;
        this.correctCount = 0;
        this.wrongCount = 0;
        this.endedEarly = false;
        if (this.timer) clearInterval(this.timer);
        this.quizContainer.classList.remove('hide');
        this.resultContainer.classList.add('hide');
        this.scoreEl.textContent = 0;
        await this.loadQuestions();
        this.showQuestion();
    }
}

document.addEventListener('DOMContentLoaded', () => new QuizApp());
