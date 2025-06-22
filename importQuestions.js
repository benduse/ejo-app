const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

const pool = new Pool({
 user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT
});

async function insertLanguage(id, name) {
  await pool.query('INSERT INTO languages (id, name) VALUES ($1, $2) ON CONFLICT (id) DO NOTHING', [id, name]);
}

async function insertQuestion(languageId, q) {
  const res = await pool.query(
    'INSERT INTO questions (language_id, question_text, correct_answer, explanation) VALUES ($1, $2, $3, $4) RETURNING id',
    [languageId, q.question, q.correctAnswer, q.explanation]
  );
  return res.rows[0].id;
}

async function insertChoices(questionId, choices) {
  for (const choice of choices) {
    await pool.query(
      'INSERT INTO choices (question_id, choice_text) VALUES ($1, $2)',
      [questionId, choice]
    );
  }
}

async function main() {
  const data = JSON.parse(fs.readFileSync(path.join(__dirname, 'public/questions.json'), 'utf8'));
  for (const [langId, langObj] of Object.entries(data)) {
    await insertLanguage(langId, langObj.name);
    for (const q of langObj.questions) {
      const questionId = await insertQuestion(langId, q);
      await insertChoices(questionId, q.choices);
    }
  }
  await pool.end();
  console.log('Import complete!');
}

main().catch(err => {
  console.error(err);
  pool.end();
});