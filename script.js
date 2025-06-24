class QuizApp {
    constructor() {
        this.currentQuestion = 0;
        this.score = 0;
        this.questions = [];
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
        this.scoreElement = document.getElementById('score');
        this.downloadBtn = document.getElementById('download-btn');
        document.getElementById('restart-btn').addEventListener('click', () => this.restartQuiz());
        this.languageSelect.addEventListener('change', () => this.handleLanguageChange());
        this.downloadBtn.addEventListener('click', () => this.downloadResults());
        await this.loadQuestions();
        this.showQuestion();
    }

    async loadQuestions() {
        const language = this.languageSelect.value;
        let file = '';
        if (language === 'french') file = 'questions/french.json';
        else file = 'questions/spanish.json';
        try {
            const response = await fetch(file);
            const data = await response.json();
            this.questions = data.questions;
        } catch (error) {
            alert('Failed to load questions.');
            this.questions = [];
        }
    }

    async handleLanguageChange() {
        await this.loadQuestions();
        this.restartQuiz();
    }

    showQuestion() {
        if (this.currentQuestion < this.questions.length) {
            const question = this.questions[this.currentQuestion];
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
        } else {
            this.showResult();
        }
    }

    checkAnswer(choice) {
        const correct = choice === this.questions[this.currentQuestion].correctAnswer;
        const buttons = document.querySelectorAll('.choice-btn');
        buttons.forEach(button => {
            button.disabled = true;
            if (button.textContent === this.questions[this.currentQuestion].correctAnswer) {
                button.classList.add('correct');
            } else if (button.textContent === choice && !correct) {
                button.classList.add('incorrect');
            }
        });
        if (correct) {
            this.score += 5;
        } else {
            this.score -= 1;
        }
        this.scoreElement.textContent = this.score;
        setTimeout(() => {
            this.currentQuestion++;
            this.showQuestion();
        }, 1200);
    }

    showResult() {
        this.quizContainer.classList.add('hide');
        this.resultContainer.classList.remove('hide');
        this.finalScoreElement.textContent = `${this.score} out of ${this.questions.length * 5}`;
        if (this.questions.length >= 25) {
            this.downloadBtn.classList.remove('hide');
        } else {
            this.downloadBtn.classList.add('hide');
        }
    }

    downloadResults() {
        const language = this.languageSelect.options[this.languageSelect.selectedIndex].text;
        const total = this.questions.length;
        const correct = Math.max(0, Math.floor(this.score / 5));
        const wrong = total - correct;
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

    async restartQuiz() {
        this.currentQuestion = 0;
        this.score = 0;
        this.quizContainer.classList.remove('hide');
        this.resultContainer.classList.add('hide');
        this.scoreElement.textContent = this.score;
        await this.loadQuestions();
        this.showQuestion();
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new QuizApp();
});
