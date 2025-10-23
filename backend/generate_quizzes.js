import fs from "fs";
import pkg from "pg";

const { Pool } = pkg;

// Configure PostgreSQL connection
const pool = new Pool({
  user: "ben",
  host: "localhost",
  database: "ejo_app",
  password: "KeepIt1425@!",
  port: 5432,
});

// Helper function to pick N random items
function getRandomChoices(array, exclude, n = 3) {
  const filtered = array.filter(item => item.meaning !== exclude);
  const shuffled = filtered.sort(() => 0.5 - Math.random());
  return shuffled.slice(0, n).map(item => item.meaning);
}

async function generateQuizzes() {
  try {
    const data = JSON.parse(fs.readFileSync("./flashcards.json", "utf8"));
    const flashcards = data.flashcards;

    // 1️⃣ Create or get quiz record
    let quizId;
    const quizCheck = await pool.query("SELECT id FROM quizzes WHERE name = $1", ["Kinyarwanda Vocabulary Quiz"]);

    if (quizCheck.rows.length === 0) {
      const insertQuiz = await pool.query(
        "INSERT INTO quizzes (name) VALUES ($1) RETURNING id",
        ["Kinyarwanda Vocabulary Quiz"]
      );
      quizId = insertQuiz.rows[0].id;
      console.log(`🧩 Created new quiz with id ${quizId}`);
    } else {
      quizId = quizCheck.rows[0].id;
      console.log(`🧠 Using existing quiz with id ${quizId}`);
    }

    // 2️⃣ Generate questions for each flashcard
    for (const card of flashcards) {
      const questionText = `What does "${card.kinyarwandaWord}" mean in English?`;
      const correctAnswer = card.meaning;
      const wrongChoices = getRandomChoices(flashcards, correctAnswer);

      const explanation = `${card.kinyarwandaWord} means "${correctAnswer}". Example: ${card.example}`;

      // Check if question already exists
      const checkQ = await pool.query(
        "SELECT id FROM quiz_questions WHERE question = $1 AND quiz_id = $2",
        [questionText, quizId]
      );
      if (checkQ.rows.length > 0) {
        console.log(`⚠️ Question for "${card.kinyarwandaWord}" already exists. Skipping.`);
        continue;
      }

      // Insert question
      const result = await pool.query(
        `INSERT INTO quiz_questions (quiz_id, question, correct_answer, explanation)
         VALUES ($1, $2, $3, $4)
         RETURNING id`,
        [quizId, questionText, correctAnswer, explanation]
      );

      const questionId = result.rows[0].id;

      // Insert correct + wrong choices
      const allChoices = [correctAnswer, ...wrongChoices].sort(() => 0.5 - Math.random());
      for (const choice of allChoices) {
        await pool.query(
          `INSERT INTO quiz_choices (question_id, choice_text) VALUES ($1, $2)`,
          [questionId, choice]
        );
      }

      console.log(`✅ Added question for "${card.kinyarwandaWord}"`);
    }

    console.log("🎉 Quiz generation complete!");
  } catch (error) {
    console.error("❌ Error generating quizzes:", error);
  } finally {
    await pool.end();
  }
}

generateQuizzes();
