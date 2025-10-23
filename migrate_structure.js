// migrate_structure.js
import fs from "fs";
import path from "path";

// Utility to move files safely
function moveFile(oldPath, newPath) {
  const dir = path.dirname(newPath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  if (fs.existsSync(oldPath)) {
    fs.renameSync(oldPath, newPath);
    console.log(`✅ Moved: ${oldPath} → ${newPath}`);
  }
}

// Utility to replace fetch routes in JS files
function updateFetchRoutes(filePath) {
  if (!fs.existsSync(filePath)) return;
  const data = fs.readFileSync(filePath, "utf8");
  const updated = data.replace(/fetch\(\s*["']\.\/flashcards\.json["']\s*\)/g, "fetch('/api/flashcards')");
  if (updated !== data) {
    fs.writeFileSync(filePath, updated);
    console.log(`🔄 Updated fetch route in: ${filePath}`);
  }
}

// Paths
const root = process.cwd();

// Ensure folders exist
["backend/db", "public", "public/flashcards", "public/quiz", "public/images"].forEach(folder => {
  if (!fs.existsSync(path.join(root, folder))) {
    fs.mkdirSync(path.join(root, folder), { recursive: true });
    console.log(`📁 Created folder: ${folder}`);
  }
});

// Move backend files
moveFile(path.join(root, "server.js"), path.join(root, "backend/server.js"));
moveFile(path.join(root, "sync_flashcards.js"), path.join(root, "backend/sync_flashcards.js"));
moveFile(path.join(root, "generate_quizzes.js"), path.join(root, "backend/generate_quizzes.js"));

// Move frontend files
["index.html", "landing.js", "landing.css"].forEach(f =>
  moveFile(path.join(root, f), path.join(root, "public", f))
);

// Move flashcards files
["flashcards.html", "flashcards.css", "flashcards.js"].forEach(f =>
  moveFile(path.join(root, "flashcards", f), path.join(root, "public/flashcards", f))
);

// Move quiz files
["quiz.html", "script.js", "styles.css"].forEach(f =>
  moveFile(path.join(root, "quiz", f), path.join(root, "public/quiz", f))
);

// Move images
if (fs.existsSync(path.join(root, "images"))) {
  fs.readdirSync(path.join(root, "images")).forEach(img => {
    moveFile(path.join(root, "images", img), path.join(root, "public/images", img));
  });
}

// Update routes inside frontend JS files
updateFetchRoutes(path.join(root, "public/flashcards/flashcards.js"));
updateFetchRoutes(path.join(root, "public/landing.js"));

// Delete empty folders
["flashcards", "quiz", "images"].forEach(dir => {
  const full = path.join(root, dir);
  if (fs.existsSync(full) && fs.readdirSync(full).length === 0) {
    fs.rmdirSync(full);
    console.log(`🗑️ Removed empty folder: ${dir}`);
  }
});

console.log("\n🚀 Migration completed successfully!");
console.log("Next steps:");
console.log("1. Run: cd backend && node server.js");
console.log("2. Open http://localhost:5000/api/flashcards to verify backend.");
console.log("3. Open http://localhost:5000/ in your browser to view frontend.");
