const express = require('express');
const path = require('path');
const pool = require('./config/db.config');
const cors = require('cors');


const app = express();

// Middleware
app.use(express.json());
app.use(cors());
app.use(express.static(path.join(__dirname, '../')));

// Routes
app.get('/api/languages', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM languages');
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

app.get('/api/questions/:languageId', async (req, res) => {
    try {
        const { languageId } = req.params;
        const query = `
            SELECT 
                q.id,
                q.question_text,
                q.correct_answer,
                q.explanation,
                json_agg(c.choice_text) as choices
            FROM questions q
            JOIN choices c ON c.question_id = q.id
            WHERE q.language_id = $1
            GROUP BY q.id
        `;
        const result = await pool.query(query, [languageId]);
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});