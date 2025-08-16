const fs = require('fs');
const path = require('path');
const pool = require('../server/db');

const files = [
  path.join(__dirname, 'french.json'),
  path.join(__dirname, 'spanish.json'),
  path.join(__dirname, 'ikinyarwanda.json')
];

async function importQuizzes() {
  for (const file of files) {
    const data = JSON.parse(fs.readFileSync(file, 'utf8'));
    const { name, questions } = data;

    // Insert quiz
    const quizRes = await pool.query(
      'INSERT INTO quizzes (name) VALUES ($1) RETURNING id',
      [name]
    );
    const quizId = quizRes.rows[0].id;

    // Insert questions
    for (const q of questions) {
      await pool.query(
        'INSERT INTO quiz_questions (quiz_id, question, choices, correct_answer, explanation, category) VALUES ($1, $2, $3, $4, $5, $6)',
        [
          quizId,
          q.question,
          q.choices,
          q.correctAnswer,
          q.explanation,
          q.category || null
        ]
      );
    }
  }
  console.log('Quizzes imported!');
  pool.end();
}

importQuizzes();