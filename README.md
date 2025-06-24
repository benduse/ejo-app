# Polyglot Quiz App

A simple web-based quiz app for learning French and Spanish. The app fetches questions from local JSON files and provides instant feedback and scoring.

## Features
- Choose between French and Spanish quizzes
- Multiple-choice questions
- Progress bar and score tracking
- Responsive and modern UI
- No backend required (all data is local)

## How to Use

1. **Download or Clone the Repository**
   - Place the `index.html`, `styles.css`, `script.js`, and the `questions` folder (with `french.json` and `spanish.json`) in the same directory.

2. **Open the App**
   - Open `index.html` in your web browser (double-click or right-click and choose "Open with browser").

3. **Select a Language**
   - Use the language dropdown at the top to choose either French or Spanish.

4. **Take the Quiz**
   - Answer the questions. Your progress and score will be displayed.
   - At the end, see your final score and restart if you wish.

## Folder Structure
```
polyglot-boost-app/
├── index.html
├── styles.css
├── script.js
├── questions/
│   ├── french.json
│   └── spanish.json
```

## Customization
- To add more questions, edit the `french.json` or `spanish.json` files in the `questions` folder.
- To add more languages, create a new JSON file in the same format and update the language selector in `index.html` and `script.js`.

## Credits
- Developed by Benjamin, 2025.
