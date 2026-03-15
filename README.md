# Ejo

A modern web-based app for learning Kinyarwanda, French, and Spanish through quizzes and flashcards. The app features instant feedback, scoring, and a beautiful, responsive UI. No backend required—all data is local.

## Features

- **Language Support:** Kinyarwanda, French, Spanish
- **Quiz Mode:** Multiple-choice questions, progressive difficulty, color badges
- **Flashcards:** Interactive flashcards with flip, navigation, and review tracking
- **Leaderboard:** Top 10 high scores, confetti celebration for achievements
- **Login & Account:** Simple local login/registration to track progress
- **Progress Tracking:** Score, progress bar, reviewed flashcard count
- **Modern UI:** Sidebar navigation, attractive cards, mobile-friendly
- **No Backend:** All data stored locally in JSON and browser storage

## How to Use

1. **Download or Clone the Repository**

   - Place all files and folders in the same directory.

2. **Open the App**

   - Open `index.html` in your web browser (double-click or right-click and choose "Open with browser").

3. **Login or Register**

   - Create an account or log in to track your learning progress.

4. **Select a Language & Mode**

   - Choose Kinyarwanda, French, or Spanish. Switch between Quiz and Flashcards using the sidebar.

5. **Learn & Track Progress**
   - Answer quiz questions, review flashcards, and see your score and review count update in real time.

## Folder Structure

```
ejo-app/
├── index.html
├── landing.css
├── landing.js
├── shared.css              # Shared brand colors & variables
├── components.css          # Unified UI components
├── utils.js                # Shared utility functions
├── README.md
├── data/
├── flashcards/
│   ├── flashcards.css
│   ├── flashcards.html
│   ├── flashcards.js
│   └── flashcards.json
├── images/
├── questions/
│   ├── french.json
│   ├── ikinyarwanda.json
│   └── spanish.json
├── quiz/
│   ├── leaderboardManager.js
│   ├── quiz.html
│   ├── script.js
│   ├── site.webmanifest
│   └── styles.css
├── survey/
│   ├── survey.css
│   └── survey.html         # JS inlined
```

## Customization

- **Brand Colors**: Edit `shared.css` to change colors across all pages
- **Questions**: Edit JSON files in `questions/` or `flashcards/` folders
- **Languages**: Create new JSON file and update language selector logic
- **Styles**: Edit individual CSS files for page-specific styling

## Credits

- Developed by Benjamin, 2025.
