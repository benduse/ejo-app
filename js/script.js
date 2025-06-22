
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
        this.scoreElement = document.getElementById('score');
        this.resultContainer = document.getElementById('result-container');
        this.quizContainer = document.getElementById('quiz-container');
        this.finalScoreElement = document.getElementById('final-score');
        this.languageSelect = document.getElementById('languageSelect');
        
        // Load questions from JSON
        await this.loadQuestions();
        
        // Add event listeners
        document.getElementById('restart-btn').addEventListener('click', () => this.restartQuiz());
        this.languageSelect.addEventListener('change', () => this.handleLanguageChange());
        
        this.showQuestion();
    }

    async loadQuestions() {
         try {
        const languageId = this.languageSelect.value;
        const response = await fetch(`/api/questions/${languageId}`);
        const data = await response.json();
        this.questions = data.map(q => ({
            question: q.question_text,
            choices: q.choices,
            correctAnswer: q.correct_answer,
            explanation: q.explanation
        }));
    } catch (error) {
        console.error('Error loading questions:', error);
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

    async loadLanguages() {
    try {
        const response = await fetch('/api/languages');
        const languages = await response.json();
        
        this.languageSelect.innerHTML = languages.map(lang => 
            `<option value="${lang.id}">${lang.name}</option>`
        ).join('');
    } catch (error) {
        console.error('Error loading languages:', error);
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
            this.score++;
            this.scoreElement.textContent = this.score;
        }

        setTimeout(() => {
            this.currentQuestion++;
            this.showQuestion();
        }, 1500);
    }

    showResult() {
        this.quizContainer.classList.add('hide');
        this.resultContainer.classList.remove('hide');
        this.finalScoreElement.textContent = `${this.score} out of ${this.questions.length}`;
    }

    async restartQuiz() {
        this.currentQuestion = 0;
        this.score = 0;
        this.scoreElement.textContent = this.score;
        this.quizContainer.classList.remove('hide');
        this.resultContainer.classList.add('hide');
        await this.loadQuestions();
        this.showQuestion();
    }
}

// Initialize the app when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new QuizApp();
});