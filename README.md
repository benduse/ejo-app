# Polyglot Boost App

A modern web-based app for learning Kinyarwanda, French, and Spanish through quizzes and flashcards. The app features instant feedback, scoring, and a beautiful, responsive UI. All data is stored locally in JSON and browser storage, **requiring no backend server**.

## Features

- **Language Support:** Kinyarwanda
- **Quiz Mode:** Multiple-choice questions, progressive difficulty, color badges
- **Flashcards:** Interactive flashcards with flip, navigation, and review tracking
- **Leaderboard:** Top 10 high scores, confetti celebration for achievements
- **Login & Account:** Simple local login/registration to track progress
- **Progress Tracking:** Score, progress bar, reviewed flashcard count
- **Modern UI:** Sidebar navigation, attractive cards, mobile-friendly

## How to Use

To set up and run the project locally, follow these steps:

1.  **Clone the Repository:**
    ```bash
    git clone https://github.com/benduse/ejo-app.git
    cd ejo-app
    ```
2.  **Install Dependencies (if any, for development tools):**
    ```bash
    npm install
    ```
3.  **Install a Local Web Server (if you don't have one):**
    This project is a static site and requires a local web server to function correctly (e.g., to fetch JSON data). If you don't have `http-server` installed globally, you can install it:
    ```bash
    npm install -g http-server
    ```
4.  **Start the Application:**
    ```bash
    npm start
    ```
    This will start a local server (usually on `http://localhost:8080`).
5.  **Open in Browser:**
    Open your web browser and navigate to the address provided by the `npm start` command (e.g., `http://localhost:8080`).

## Folder Structure

```
ejo-app/
├── index.html
├── landing.css
├── landing.js
├── README.md
├── package.json
├── flashcards.json  <-- Moved to root
├── flashcards/
│   ├── flashcards.css
│   └── flashcards.js

├── images/
├── questions/
│   ├── french.json
│   ├── ikinyarwanda.json
│   └── spanish.json
├── quiz/
│   ├── confetti.js
│   ├── leaderboardManager.js
│   ├── quiz.html
│   ├── script.js
│   ├── site.webmanifest
│   └── styles.css
```

## Customization

- To add more questions, edit the relevant JSON files in the `questions` or `flashcards` folders.
- To add more languages, create a new JSON file and update the language selector and logic in the app.
- To change the look, edit the CSS files for each module.

## Credits

- Developed by Benjamin, 2025.