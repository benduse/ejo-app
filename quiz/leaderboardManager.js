// leaderboardManager.js

export default class LeaderboardManager {
  constructor(storageKey = 'ejo_leaderboard', userKey = 'ejo_player_name') {
    this.storageKey = storageKey;
    this.userKey = userKey;
    this.leaderboard = this.loadLeaderboard();
    this.playerName = this.loadPlayerName();
  }

  // Load leaderboard from localStorage
  loadLeaderboard() {
    try {
      const data = localStorage.getItem(this.storageKey);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error loading leaderboard:', error);
      return [];
    }
  }

  // Save leaderboard to localStorage
  saveLeaderboard() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.leaderboard));
    } catch (error) {
      console.error('Error saving leaderboard:', error);
    }
  }

  // Load player name from localStorage or prompt for it
  loadPlayerName() {
    let name = localStorage.getItem(this.userKey);
    if (!name) {
      name = this.promptForPlayerName();
    }
    return name;
  }

  // Prompt user for their name
  promptForPlayerName() {
    let name = prompt('Welcome! Please enter your username:');
    name = name ? name.trim() : 'Player';
    if (!name) name = 'Player';
    localStorage.setItem(this.userKey, name);
    return name;
  }

  // Change player name
  changePlayerName(newName) {
    if (newName && newName.trim()) {
      // If player has scores under old name, optionally update them
      const oldName = this.playerName;
      this.playerName = newName.trim();
      localStorage.setItem(this.userKey, this.playerName);
      
      // Optional: Update existing scores to new name
      const existingEntry = this.leaderboard.find(entry => entry.name === oldName);
      if (existingEntry) {
        existingEntry.name = this.playerName;
        this.saveLeaderboard();
      }
      
      return true;
    }
    return false;
  }

  // Add or update score for current player
  addScore(score) {
    const now = new Date().toISOString();
    
    // Find existing entry for this player
    const existingIndex = this.leaderboard.findIndex(entry => entry.name === this.playerName);
    
    if (existingIndex !== -1) {
      // Player already has a score
      if (score > this.leaderboard[existingIndex].score) {
        // Update only if new score is higher
        this.leaderboard[existingIndex].score = score;
        this.leaderboard[existingIndex].date = now;
        this.leaderboard[existingIndex].attempts = (this.leaderboard[existingIndex].attempts || 1) + 1;
      } else {
        // Track attempts even if score isn't higher
        this.leaderboard[existingIndex].attempts = (this.leaderboard[existingIndex].attempts || 1) + 1;
        this.leaderboard[existingIndex].lastAttempt = now;
      }
    } else {
      // New player entry
      this.leaderboard.push({
        name: this.playerName,
        score: score,
        date: now,
        attempts: 1,
        lastAttempt: now
      });
    }

    // Sort by score descending and keep top 10
    this.sortAndTrimLeaderboard();
    this.saveLeaderboard();
  }

  // Remove current player's score from leaderboard
  removePlayerScore() {
    const index = this.leaderboard.findIndex(entry => entry.name === this.playerName);
    if (index !== -1) {
      this.leaderboard.splice(index, 1);
      this.saveLeaderboard();
      return true;
    }
    return false;
  }

  // Remove a specific player's score (admin feature)
  removeScoreByName(playerName) {
    const index = this.leaderboard.findIndex(entry => entry.name === playerName);
    if (index !== -1) {
      this.leaderboard.splice(index, 1);
      this.saveLeaderboard();
      return true;
    }
    return false;
  }

  // Clear entire leaderboard (admin feature)
  clearLeaderboard() {
    if (confirm('Are you sure you want to clear the entire leaderboard? This cannot be undone.')) {
      this.leaderboard = [];
      this.saveLeaderboard();
      return true;
    }
    return false;
  }

  // Sort leaderboard by score and keep top 10
  sortAndTrimLeaderboard() {
    this.leaderboard.sort((a, b) => b.score - a.score);
    this.leaderboard = this.leaderboard.slice(0, 10);
  }

  // Check if a score would make it to the leaderboard
  isHighScore(score) {
    if (this.leaderboard.length < 10) return true;
    return score > this.leaderboard[this.leaderboard.length - 1].score;
  }

  // Get player's current score and rank
  getPlayerStats() {
    const entry = this.leaderboard.find(entry => entry.name === this.playerName);
    if (entry) {
      const rank = this.leaderboard.findIndex(e => e.name === this.playerName) + 1;
      return {
        score: entry.score,
        rank: rank,
        attempts: entry.attempts || 1
      };
    }
    return null;
  }

  // Get leaderboard for display (without dates)
  getLeaderboard() {
    return this.leaderboard.map(({ name, score }) => ({ name, score }));
  }

  // Get full leaderboard data (with dates - for admin view)
  getFullLeaderboard() {
    return [...this.leaderboard];
  }

  // Get current player name
  getPlayerName() {
    return this.playerName;
  }

  // Check if current player has a score
  playerHasScore() {
    return this.leaderboard.some(entry => entry.name === this.playerName);
  }

  // Export leaderboard data as JSON string
  exportLeaderboard() {
    return JSON.stringify(this.leaderboard, null, 2);
  }

  // Import leaderboard data from JSON string
  importLeaderboard(jsonString) {
    try {
      const data = JSON.parse(jsonString);
      if (Array.isArray(data)) {
        this.leaderboard = data;
        this.sortAndTrimLeaderboard();
        this.saveLeaderboard();
        return true;
      }
    } catch (error) {
      console.error('Error importing leaderboard:', error);
    }
    return false;
  }
}