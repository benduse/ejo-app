// server/index.js
const express = require('express');
const pool = require('./db');
const app = express();
const PORT = process.env.PORT || 3001;
const path = require('path');

app.use(express.static(path.join(__dirname, '..'))); // Serve static files from the root directory
app.use(express.json());

// Flashcards endpoint
app.get('/api/flashcards', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM flashcards');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Quiz results endpoint
app.post('/api/quiz', async (req, res) => {
  const { user_id, score, date } = req.body;
  try {
    await pool.query(
      'INSERT INTO quiz_results (user_id, score, date) VALUES ($1, $2, $3)',
      [user_id, score, date]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Survey responses endpoint
app.post('/api/survey', async (req, res) => {
  const { user_id, response, date } = req.body;
  try {
    await pool.query(
      'INSERT INTO survey_responses (user_id, response, date) VALUES ($1, $2, $3)',
      [user_id, response, date]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
