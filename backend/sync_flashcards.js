import fs from "fs";
import chokidar from "chokidar";
import pkg from "pg";

const { Pool } = pkg;

// ✅ Configure PostgreSQL connection
const pool = new Pool({
  user: "ben",       // your DB username
  host: "localhost",
  database: "ejo_app",
  password: "KeepIt1425@!", // your DB password
  port: 5432,
});

// ✅ Function to insert/update data
async function syncFlashcards() {
  try {
    const data = JSON.parse(fs.readFileSync("./flashcards.json", "utf8"));
    const flashcards = data.flashcards;

    for (const card of flashcards) {
      await pool.query(
        `
        INSERT INTO flashcards (id, kinyarwanda_word, meaning, category, phonetics, example)
        VALUES ($1, $2, $3, $4, $5, $6)
        ON CONFLICT (id) DO UPDATE SET
          kinyarwanda_word = EXCLUDED.kinyarwanda_word,
          meaning = EXCLUDED.meaning,
          category = EXCLUDED.category,
          phonetics = EXCLUDED.phonetics,
          example = EXCLUDED.example;
        `,
        [
          card.id,
          card.kinyarwandaWord,
          card.meaning,
          card.category || null,
          card.phonetics || null,
          card.example || null,
        ]
      );
    }

    console.log(`✅ Synced ${flashcards.length} flashcards to database`);
  } catch (err) {
    console.error("❌ Error syncing flashcards:", err);
  }
}

// ✅ Run once on startup
syncFlashcards();

// ✅ Watch for changes in the JSON file
chokidar.watch("./flashcards.json").on("change", () => {
  console.log("📄 Detected flashcards.json update — syncing...");
  syncFlashcards();
});
