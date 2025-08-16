// import_flashcards.js
const fs = require('fs');
const pool = require('../server/db');

const data = JSON.parse(fs.readFileSync('./flashcards/flashcards.json', 'utf8'));
const flashcards = data.flashcards;

async function importFlashcards() {
  for (const card of flashcards) {
    await pool.query(
      'INSERT INTO flashcards (kinyarwanda_word, meaning, category, phonetics, example) VALUES ($1, $2, $3, $4, $5)',
      [card.kinyarwandaWord, card.meaning, card.category, card.phonetics, card.example]
    );
  }
  console.log('Import complete!');
  pool.end();
}

importFlashcards();