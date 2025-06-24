const express = require('express');
const path = require('path');
const fs = require('fs').promises;
const cors = require('cors');


const app = express();

// Middleware
app.use(express.json());
app.use(cors());
app.use(express.static(path.join(__dirname, '../')));

// Routes
app.get('/api/languages', async (req, res) => {
    try {
        const languages = [
            { id: 1, name: 'French', code: 'fr' },
            { id: 2, name: 'Spanish', code: 'es' }
        ];
        res.json(languages);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

app.get('/api/questions/:languageId', async (req, res) => {
    try {
        const { languageId } = req.params;
        let fileName;
        if (languageId === '1') {
            fileName = 'french.json';
        } else if (languageId === '2') {
            fileName = 'spanish.json';
        } else {
            return res.status(404).json({ error: 'Language not found' });
        }
        
        const filePath = path.join(__dirname, '..', 'questions', fileName);
        const fileContent = await fs.readFile(filePath, 'utf8');
        const data = JSON.parse(fileContent);
        res.json(data.questions);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});