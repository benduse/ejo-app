// // js/script.js
// const questions = [
//     {
//         question: "How do you say 'Hello' in French?",
//         choices: ["Bonjour", "Gracias", "Ciao", "Hola"],
//         correctAnswer: "Bonjour",
//         explanation: "Bonjour is the French word for Hello"
//     },
//     {
//         question: "What does 'Merci' mean?",
//         choices: ["Please", "Thank you", "Goodbye", "Welcome"],
//         correctAnswer: "Thank you",
//         explanation: "Merci means Thank you in French"
//     },
//     {
//         question: "How do you say 'Good night' in French?",
//         choices: ["Bonne nuit", "Au revoir", "S'il vous plaît", "Merci"],
//         correctAnswer: "Bonne nuit",
//         explanation: "Bonne nuit means Good night in French"
//     },
//     {
//         question: "What does 'Au revoir' mean?",
//         choices: ["Hello", "Good morning", "Goodbye", "Good night"],
//         correctAnswer: "Goodbye",
//         explanation: "Au revoir means Goodbye in French"
//     },
//     {
//         question: "How do you say 'Please' in French?",
//         choices: ["Merci", "S'il vous plaît", "De rien", "Bonjour"],
//         correctAnswer: "S'il vous plaît",
//         explanation: "S'il vous plaît means Please in French"
//     }
// ];

// class QuizApp {
//     constructor() {
//         this.currentQuestion = 0;
//         this.score = 0;
//         this.init();
//     }

//     init() {
//         this.questionElement = document.getElementById('question');
//         this.choicesElement = document.getElementById('choices');
//         this.progressBar = document.getElementById('progress-bar');
//         this.scoreElement = document.getElementById('score');
//         this.resultContainer = document.getElementById('result-container');
//         this.quizContainer = document.getElementById('quiz-container');
//         this.finalScoreElement = document.getElementById('final-score');
        
//         document.getElementById('restart-btn').addEventListener('click', () => this.restartQuiz());
        
//         this.showQuestion();
//     }

//     showQuestion() {
//         if (this.currentQuestion < questions.length) {
//             const question = questions[this.currentQuestion];
//             const progress = (this.currentQuestion / questions.length) * 100;
            
//             this.progressBar.style.width = `${progress}%`;
//             this.questionElement.textContent = question.question;
//             this.choicesElement.innerHTML = '';

//             question.choices.forEach(choice => {
//                 const button = document.createElement('button');
//                 button.textContent = choice;
//                 button.className = 'choice-btn';
//                 button.addEventListener('click', () => this.checkAnswer(choice));
//                 this.choicesElement.appendChild(button);
//             });
//         } else {
//             this.showResult();
//         }
//     }

//     checkAnswer(choice) {
//         const correct = choice === questions[this.currentQuestion].correctAnswer;
//         const buttons = document.querySelectorAll('.choice-btn');
        
//         buttons.forEach(button => {
//             button.disabled = true;
//             if (button.textContent === questions[this.currentQuestion].correctAnswer) {
//                 button.classList.add('correct');
//             } else if (button.textContent === choice && !correct) {
//                 button.classList.add('incorrect');
//             }
//         });

//         if (correct) {
//             this.score++;
//             this.scoreElement.textContent = this.score;
//         }

//         setTimeout(() => {
//             this.currentQuestion++;
//             this.showQuestion();
//         }, 1500);
//     }

//     showResult() {
//         this.quizContainer.classList.add('hide');
//         this.resultContainer.classList.remove('hide');
//         this.finalScoreElement.textContent = `${this.score} out of ${questions.length}`;
//     }

//     restartQuiz() {
//         this.currentQuestion = 0;
//         this.score = 0;
//         this.scoreElement.textContent = this.score;
//         this.quizContainer.classList.remove('hide');
//         this.resultContainer.classList.add('hide');
//         this.showQuestion();
//     }
// }

// // Initialize the app when the page loads
// document.addEventListener('DOMContentLoaded', () => {
//     new QuizApp();
// });

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