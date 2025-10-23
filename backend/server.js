import express from "express";
import cors from "cors";
import pkg from "pg";

const { Pool } = pkg;

const app = express();
app.use(cors());
app.use(express.json());

// ✅ PostgreSQL connection pool
const pool = new Pool({
  user: "ben",
  host: "localhost",
  database: "ejo_app",
  password: "KeepIt1425@!",
  port: 5432,
});

// ✅ GET all flashcards
app.get("/api/flashcards", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM flashcards ORDER BY id ASC");
    res.json({ flashcards: result.rows });
  } catch (err) {
    console.error("❌ Error fetching flashcards:", err);
    res.status(500).json({ error: "Failed to fetch flashcards" });
  }
});

// ✅ GET quizzes + questions + choices (optional)
app.get("/api/quizzes", async (req, res) => {
  try {
    const quizzes = await pool.query("SELECT * FROM quizzes ORDER BY id ASC");
    const questions = await pool.query("SELECT * FROM quiz_questions");
    const choices = await pool.query("SELECT * FROM quiz_choices");

    res.json({
      quizzes: quizzes.rows,
      questions: questions.rows,
      choices: choices.rows,
    });
  } catch (err) {
    console.error("❌ Error fetching quizzes:", err);
    res.status(500).json({ error: "Failed to fetch quizzes" });
  }
});

// ✅ Server start
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
