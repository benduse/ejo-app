.
├── README.md
├── ejo-app.code-workspace
├── flashcards
│   ├── flashcards.css
│   ├── flashcards.js
│   └── flashcards.json
├── images
│   ├── Benjamin.jpg
│   ├── favicon.svg
│   ├── hero-image.png
│   └── logo.svg
├── index.html
├── landing.css
├── landing.js
├── package-lock.json
├── package.json
├── tree.md
└── wordSuggestionsForm
    ├── suggestions.css
    ├── suggestions.html
    ├── suggestions.js
    └── thank-you.html

4 directories, 19 files




########################################
Got it 👍  
Let’s **update your full migration document** to include the **Flashcards Migration Script** section, so you have everything in **one single reference file**.  

---

# 🚀 Migration Guide: Netlify → Firebase Hosting with Firestore Database

---

## 📂 Project Tree
Your current project:
```
├── README.md
├── ejo-app.code-workspace
├── flashcards
│   ├── flashcards.css
│   ├── flashcards.js
│   └── flashcards.json
├── images
│   ├── Benjamin.jpg
│   ├── favicon.svg
│   ├── hero-image.png
│   └── logo.svg
├── index.html
├── landing.css
├── landing.js
├── package-lock.json
├── package.json
├── tree.md
└── wordSuggestionsForm
    ├── suggestions.css
    ├── suggestions.html
    ├── suggestions.js
    └── thank-you.html
```

---

## 1️⃣ Create Firebase Project
1. In [Firebase Console](https://console.firebase.google.com/) → **Add Project** → give it a name.  
2. Enable/disable Analytics as preferred.  
3. Once ready, you’ll land in the Firebase dashboard.  

---

## 2️⃣ Install Firebase CLI
Install globally:

```bash
npm install -g firebase-tools
firebase login
firebase --version
```

---

## 3️⃣ Initialize Firebase in Your Project
From the root of your project:

```bash
firebase init
```

Choose:
- ✅ Hosting: Configure and deploy Firebase Hosting  
- ✅ Firestore Database  
- Public directory: `.` (root, since index.html is there)  
- Configure as SPA: **Yes**  
- Do not overwrite `index.html`  

Generated files:
- `firebase.json`  
- `.firebaserc`  

---

## 4️⃣ Deploy to Firebase
Deploy:

```bash
firebase deploy --only hosting
```

This gives you a hosting URL:  
`https://your-app.web.app`

---

## 5️⃣ Set Up Firestore
In Firebase Console:  
- Firestore Database → Create Database → start in **Test Mode** (later restrict).  

Rules in dev mode:
```json
{
  "rules": {
    ".read": true,
    ".write": true
  }
}
```

---

## 6️⃣ Add Firebase SDK to Your App  
Add to `index.html` (or import in your `flashcards.js` / `suggestions.js`):

```html
<script type="module">
  import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
  import { getFirestore, collection, addDoc, getDocs } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

  const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_PROJECT.firebaseapp.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT.appspot.com",
    messagingSenderId: "YOUR_SENDER_ID",
    appId: "YOUR_APP_ID"
  };

  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app);

  async function addSuggestion(text) {
    await addDoc(collection(db, "suggestions"), {
      text: text,
      createdAt: new Date()
    });
  }

  async function getSuggestions() {
    const querySnapshot = await getDocs(collection(db, "suggestions"));
    querySnapshot.forEach((doc) => {
      console.log(doc.id, " => ", doc.data());
    });
  }

  window.addSuggestion = addSuggestion;
  window.getSuggestions = getSuggestions;
</script>
```

---

## 7️⃣ Schema Design for `flashcards`
**Collection: `flashcards`**

Fields:
- `id`: number  
- `kinyarwandaWord`: string  
- `meaning`: string  
- `category`: string  
- `phonetics`: string  
- `example`: string  
- `createdAt`: timestamp  
- `updatedAt`: timestamp  

---

## 8️⃣ Flashcards Migration Script (Node.js)

This script uploads your existing **flashcards.json** into Firestore.

### Step 1: Install Firebase Admin SDK
```bash
npm install firebase-admin
```

### Step 2: Setup Service Account
- Go to **Firebase Console → Project Settings → Service Accounts**  
- Click **Generate new private key** → save as `serviceAccountKey.json` in your project root (don’t commit it to GitHub).  

### Step 3: Script (`migrateFlashcards.js`)
```js
// migrateFlashcards.js
const admin = require("firebase-admin");
const fs = require("fs");
const path = require("path");

// Load service account key
const serviceAccount = require("./serviceAccountKey.json");

// Initialize Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

// Load flashcards.json
const flashcardsPath = path.join(__dirname, "flashcards", "flashcards.json");
const flashcardsData = JSON.parse(fs.readFileSync(flashcardsPath, "utf8"));

async function migrateFlashcards() {
  const flashcardsCollection = db.collection("flashcards");

  for (const card of flashcardsData) {
    try {
      // Option A: Use Firestore auto-ID, keep numeric ID in doc field
      await flashcardsCollection.add({
        id: card.id,
        kinyarwandaWord: card.kinyarwandaWord,
        meaning: card.meaning,
        category: card.category,
        phonetics: card.phonetics,
        example: card.example,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });

      // Option B (if you want numeric IDs as Firestore doc IDs):
      // await flashcardsCollection.doc(String(card.id)).set({...})

      console.log(`✅ Uploaded flashcard ID: ${card.id}`);
    } catch (err) {
      console.error(`❌ Error uploading flashcard ID: ${card.id}`, err);
    }
  }

  console.log("🎉 Migration complete!");
}

migrateFlashcards();
```

### Step 4: Run Migration
```bash
node migrateFlashcards.js
```

Expected output:
```
✅ Uploaded flashcard ID: 185
✅ Uploaded flashcard ID: 186
✅ Uploaded flashcard ID: 187
✅ Uploaded flashcard ID: 188
🎉 Migration complete!
```

### Step 5: Verify in Console
Check **Firestore → Collections → flashcards**.  
All flashcards should appear as docs.  

---

## 9️⃣ Redeploy
Run again after any code/db changes:
```bash
firebase deploy
```

---

# ✅ Final Notes
- You’ve migrated from **Netlify → Firebase Hosting**.  
- Added **Firestore for flashcards + suggestions**.  
- Created a **migration script** to upload your existing `flashcards.json`.  
- Schema design ensures scalability (`flashcards` collection with rich fields).  
- Your app can now dynamically fetch & display flashcards from Firestore.  

---

#########################################