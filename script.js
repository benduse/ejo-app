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
        document.getElementById('restart-btn').addEventListener('click', () => this.restartQuiz());
        this.languageSelect.addEventListener('change', () => this.handleLanguageChange());
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
        if (correct) this.score++;
        setTimeout(() => {
            this.currentQuestion++;
            this.showQuestion();
        }, 1200);
    }

    showResult() {
        this.quizContainer.classList.add('hide');
        this.resultContainer.classList.remove('hide');
        this.finalScoreElement.textContent = `${this.score} out of ${this.questions.length}`;
    }

    async restartQuiz() {
        this.currentQuestion = 0;
        this.score = 0;
        this.quizContainer.classList.remove('hide');
        this.resultContainer.classList.add('hide');
        await this.loadQuestions();
        this.showQuestion();
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new QuizApp();
});
