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
        this.init();
    }

    async init() {
        this.questionElement = document.getElementById('question');
        this.choicesElement = document.getElementById('choices');
        this.progressBar = document.getElementById('progress-bar');
        this.resultContainer = document.getElementById('result-container');
        this.quizContainer = document.getElementById('quiz-container');
        this.finalScoreElement = document.getElementById('final-score');
        this.languageSelect = document.getElementById('languageSelect');
        this.difficultySelect = document.getElementById('difficultySelect');
        this.scoreElement = document.getElementById('score');
        this.downloadBtn = document.getElementById('download-btn');
        this.endQuizBtn = document.getElementById('end-quiz-btn');
        this.printPdfBtn = document.getElementById('print-pdf-btn');
        this.difficultyBadge = document.getElementById('difficulty-badge');
        this.leaderboardContainer = document.getElementById('leaderboard-container');
        this.leaderboardList = document.getElementById('leaderboard-list');
        this.timerElement = document.getElementById('timer');
        this.timerContainer = document.getElementById('timer-container');

        this.difficultySelect.addEventListener('change', () => {
            this.timerEnabled = this.difficultySelect.value !== 'all';
            this.restartQuiz();
        });

        document.getElementById('restart-btn').addEventListener('click', () => this.restartQuiz());
        this.languageSelect.addEventListener('change', () => this.handleLanguageChange());
        this.downloadBtn.addEventListener('click', () => this.downloadResults());
        this.endQuizBtn.addEventListener('click', () => this.endQuiz());
        this.printPdfBtn.addEventListener('click', () => this.printResultsPDF());

        await this.loadQuestions();
        this.loadLeaderboard();
        this.showQuestion();
    }

    async loadQuestions() {
        const language = this.languageSelect.value;
        let file = language === 'french' ? 'questions/french.json' : language === 'spanish'? 'questions/spanish.json' : 'questions/ikinyarwanda.json';
        try {
            const response = await fetch(file);
            const data = await response.json();
            this.questions = data.questions.map((q, idx) => {
                let difficulty = 'easy';
                if (idx >= 10 && idx < 35) difficulty = 'medium';
                else if (idx >= 35) difficulty = 'hard';
                return { ...q, difficulty };
            });

            const selected = this.difficultySelect ? this.difficultySelect.value : 'all';
            if (selected !== 'all') {
                this.questions = this.questions.filter(q => q.difficulty === selected);
            }

            this.questions = this.shuffleArray(this.questions).slice(0, 10);
            this.currentQuestion = 0;
        this.score = 0;
        this.correctCount = 0;
        this.wrongCount = 0;
        } catch (error) {
            alert('Failed to load questions.');
            this.questions = [];
        }
    }

    shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    async handleLanguageChange() {
        await this.loadQuestions();
        this.restartQuiz();

        const container = document.body
        container.classList.remove('lang-french', 'lang-spanish', 'lang-kinyarwanda');
        container.classList.add(`lang-${this.languageSelect.value}`);
        this.difficultyBadge.className = 'difficulty-badge difficulty-easy'; // Reset badge
    }

    showQuestion() {
        if (this.timer) clearInterval(this.timer);

        if (this.questions.length === 0) {
            this.questionElement.textContent = 'No questions available for the selected options.';
            this.choicesElement.innerHTML = '';
            this.progressBar.style.width = '0%';
            this.timerContainer.style.display = 'none';
            return;
        }

        if (this.currentQuestion < this.questions.length) {
            const question = this.questions[this.currentQuestion];
            const difficulty = question.difficulty || 'easy';

            this.difficultyBadge.textContent = difficulty.charAt(0).toUpperCase() + difficulty.slice(1);
            this.difficultyBadge.className = 'difficulty-badge difficulty-' + difficulty;

            const progress = (this.currentQuestion / this.questions.length) * 100;
            this.progressBar.style.width = `${progress}%`;

            this.questionElement.textContent = question.question;

            this.choicesElement.innerHTML = '';
            question.choices.forEach(choice => {
                const button = document.createElement('button');
                button.textContent = choice;
                button.className = 'choice-btn';
                button.addEventListener('click', () => this.checkAnswer(choice));
                this.choicesElement.appendChild(button);
            });

            if (this.timerEnabled) {
                if (difficulty === 'easy') this.timeLeft = 10;
                else if (difficulty === 'medium') this.timeLeft = 9;
                else this.timeLeft = 8;

                this.timerElement.textContent = this.timeLeft;
                this.startTimer();
                this.timerContainer.style.display = '';
                this.timerContainer.style.color = '';
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
            this.timeLeft--;
            this.timerElement.textContent = this.timeLeft;
            if (this.timeLeft <= 0) {
                clearInterval(this.timer);
                this.timerContainer.style.color = '#d84315';
                this.checkAnswer(null, true);
            }
        }, 1000);
    }

    checkAnswer(choice, timedOut = false) {
        if (this.timer) clearInterval(this.timer);

        const currentQ = this.questions[this.currentQuestion];
        if (!currentQ) return;

        const correct = choice === currentQ.correctAnswer;

        const buttons = document.querySelectorAll('.choice-btn');
        buttons.forEach(button => {
            button.disabled = true;
            if (button.textContent === currentQ.correctAnswer) {
                button.classList.add('correct');
            } else if (button.textContent === choice && !correct && choice !== null) {
                button.classList.add('incorrect');
            }
        });

        if (timedOut) {
            this.wrongCount++;
        } else if (correct) {
            this.score += 5;
            this.correctCount++;
        } else {
            this.score -= 1;
            this.wrongCount++;
        }

        this.scoreElement.textContent = this.score;

        setTimeout(() => {
            if (this.wrongCount >= 5) {
                this.showResult(true);
            } else {
                this.currentQuestion++;
                this.showQuestion();
            }
        }, 1200);
    }

    showResult(earlyEnd = false) {
        this.quizContainer.classList.add('hide');
        this.resultContainer.classList.remove('hide');

        let endMsg = '';
        if (earlyEnd) {
            endMsg = ' (Quiz ended: 5 wrong answers)';
        } else if (this.endedEarly) {
            endMsg = ' (Quiz ended by user)';
        }

        this.finalScoreElement.textContent = `${this.score} out of ${this.questions.length * 5}` + endMsg;

        if (this.questions.length >= 25 || this.endedEarly) {
            this.downloadBtn.classList.remove('hide');
            this.printPdfBtn.classList.remove('hide');
        } else {
            this.downloadBtn.classList.add('hide');
            this.printPdfBtn.classList.add('hide');
        }

        this.saveScoreToLeaderboard();
        this.displayLeaderboard();

        if (this.questions.length >= 25 || this.isHighScore()) {
            if (window.launchConfetti) window.launchConfetti();
        }
    }

    downloadResults() {
        const language = this.languageSelect.options[this.languageSelect.selectedIndex].text;
        const total = this.questions.length;
        const correct = this.correctCount;
        const wrong = this.wrongCount;

        const content = `Polyglot Quiz Results\n\nLanguage: ${language}\nTotal Questions: ${total}\nCorrect Answers: ${correct}\nWrong Answers: ${wrong}\nFinal Score: ${this.score} out of ${total * 5}`;

        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `quiz_results_${language.toLowerCase()}_${new Date().getFullYear()}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    endQuiz() {
        this.endedEarly = true;
        this.showResult(false);
    }

    printResultsPDF() {
        const language = this.languageSelect.options[this.languageSelect.selectedIndex].text;
        const total = this.questions.length;
        const correct = this.correctCount;
        const wrong = this.wrongCount;

        const content = `Polyglot Quiz Results\n\nLanguage: ${language}\nTotal Questions: ${total}\nCorrect Answers: ${correct}\nWrong Answers: ${wrong}\nFinal Score: ${this.score} out of ${total * 5}`;

        const win = window.open('', '', 'width=600,height=700');
        win.document.write('<html><head><title>Quiz Results PDF</title></head><body>');
        win.document.write(`<pre style="font-size:1.2rem;">${content}</pre>`);
        win.document.write('</body></html>');
        win.document.close();
        win.print();
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
        this.scoreElement.textContent = this.score;
        await this.loadQuestions();
        this.showQuestion();
    }

    loadLeaderboard() {
        this.leaderboard = JSON.parse(localStorage.getItem('polyglot_leaderboard') || '[]');
    }

    saveScoreToLeaderboard() {
        let storedName = localStorage.getItem('polyglot_player_name');
        if (!storedName) {
            storedName = prompt('Enter your name for the leaderboard:', 'Player') || 'Player';
            localStorage.setItem('polyglot_player_name', storedName);
        }
        const name = storedName;

        this.leaderboard.push({ name, score: this.score, date: new Date().toLocaleDateString() });
        this.leaderboard.sort((a, b) => b.score - a.score);
        this.leaderboard = this.leaderboard.slice(0, 10);
        localStorage.setItem('polyglot_leaderboard', JSON.stringify(this.leaderboard));
    }

    displayLeaderboard() {
        this.leaderboardContainer.classList.remove('hide');
        this.leaderboardList.innerHTML = '';
        this.leaderboard.forEach(entry => {
            const li = document.createElement('li');
            li.textContent = `${entry.name} - ${entry.score} (${entry.date})`;
            this.leaderboardList.appendChild(li);
        });
    }

    isHighScore() {
        if (!this.leaderboard || this.leaderboard.length === 0) return true;
        return this.score > this.leaderboard[this.leaderboard.length - 1].score;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new QuizApp();
});