# Ejo Backend Requirements Specification

## 1. Overview
The goal of the Ejo backend is to transition the application from a purely client-side "local-only" architecture to a robust, scalable system. This will enable centralized content management, reliable user data persistence (including streaks), and a global competitive environment through a unified leaderboard.

### Main Objectives:
- **Scalable Content Storage:** Move quiz questions and flashcards from static JSON files to a database.
- **Persistent User Data:** Sync progress, XP, coins, and achievements to a user account.
- **Reliable Streak Management:** Implement server-side validation for daily streaks to prevent local clock manipulation and ensure cross-device consistency.
- **Global Leaderboard:** Replace local top-10 lists with a real-time global ranking system.

---

## 2. Functional Requirements

### 2.1 User Authentication & Management
- **Account Creation:** Users must be able to register via email/password or OAuth (Google/GitHub).
- **Profile Management:** Users can update their username, avatar, and preferred learning language.
- **Session Management:** Secure login sessions using JWT (JSON Web Tokens) or session cookies.

### 2.2 User Progress Synchronization
The backend must store and sync all data currently managed in `progressManager.js` and `missionManager.js`:
- **Core Metrics:** XP, Level, Coins.
- **Achievements:** A collection of unlocked achievement IDs and timestamps.
- **Learning State:**
    - List of `viewedFlashcardIds`.
    - List of `masteredFlashcardIds`.
    - List of `languagesTried`.
- **Customization:** Unlocked themes and the currently active theme.
- **Missions:**
    - Current daily mission state.
    - Weekly challenge progress.
    - Narrative progression (Day/Chapter).
    - Mission history and total completed missions count.

### 2.3 Streak Logic (Server-Side)
To ensure the "User Streak" goal is met:
- **Validation:** The server calculates the streak based on the timestamp of the last activity compared to the server's UTC time.
- **Persistence:** Streak data is stored in the database, making it immune to local storage clearing or device switching.
- **Grace Period Logic:** Option to implement "streak freezes" (purchasable with coins).

### 2.4 Content Management System (CMS)
- **Questions API:** Serve quiz questions based on language and difficulty.
- **Flashcards API:** Serve flashcards by category.
- **Mission & Narrative API:** Manage Chapters, Regions, and Difficulty Tiers. This allows adding new story content without client-side updates.
- **Admin Interface:** A way for administrators to add, edit, or delete questions and flashcards without redeploying frontend code.
- **Versioning:** Support for content versioning to allow offline caching on the frontend.

### 2.5 Global Leaderboard
- **Unified Ranking:** A global table of high scores.
- **Time-based Filters:** Daily, Weekly, and All-time rankings.
- **Privacy:** Option for users to appear as "Anonymous" on the leaderboard.

---

## 3. API Endpoints (Proposed)

### Authentication
- `POST /api/auth/register` - Create a new account.
- `POST /api/auth/login` - Authenticate and receive a token.
- `POST /api/auth/logout` - Invalidate the session.

### User Data
- `GET /api/user/progress` - Fetch full user progress and mission state.
- `PATCH /api/user/progress` - Update specific progress metrics (XP, Coins).
- `POST /api/user/sync` - Bulk sync local changes to the server (for offline-to-online transition).
- `GET /api/user/streak` - Get current streak status and countdown to next reset.

### Content
- `GET /api/content/questions?lang={lang}&difficulty={diff}` - Retrieve quiz questions.
- `GET /api/content/flashcards?lang={lang}` - Retrieve flashcards.

### Leaderboard
- `GET /api/leaderboard?period={daily|weekly|all}` - Fetch top rankings.
- `POST /api/leaderboard` - Submit a new high score.

---

## 4. Technical Requirements

### 4.1 Recommended Stack
- **Backend Framework:** Node.js (Express/FastAPI) or Python (Django/Flask).
- **Database:**
    - **Relational (PostgreSQL):** Recommended for user profiles, progress, and structured content.
    - **NoSQL (Redis):** For real-time leaderboard caching and session management.
- **Hosting:** AWS, Heroku, or Vercel (Serverless functions).

### 4.2 Security
- **HTTPS:** All communication must be encrypted.
- **Rate Limiting:** Protect API endpoints from brute force and spam.
- **Data Validation:** Strict server-side validation for all incoming progress updates to prevent "XP hacking".

### 4.3 Data Migration
- A script should be provided to migrate existing `questions/*.json` and `flashcards/*.json` data into the new database.
- A "First Sync" strategy for existing users to upload their `localStorage` data to their new cloud account.

---

## 5. Success Metrics
1. **Zero Data Loss:** Users switching devices find their progress exactly as they left it.
2. **Content Growth:** Ability to support 1000+ questions without affecting frontend load times.
3. **Streak Accuracy:** Streak resets and increments are consistent across all time zones (handled by server UTC).
