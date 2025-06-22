-- If database doesn't exist
CREATE DATABASE polyglot_boost;

\c polyglot_boost;

-- Create languages table
CREATE TABLE languages (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    code VARCHAR(10) NOT NULL
);

-- Create questions table
CREATE TABLE questions (
    id SERIAL PRIMARY KEY,
    language_id INTEGER REFERENCES languages(id),
    question_text TEXT NOT NULL,
    correct_answer VARCHAR(255) NOT NULL,
    explanation TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create choices table
CREATE TABLE choices (
    id SERIAL PRIMARY KEY,
    question_id INTEGER REFERENCES questions(id),
    choice_text VARCHAR(255) NOT NULL,
    is_correct BOOLEAN DEFAULT false
);

-- Insert your existing questions from data/questions.json
-- Example insert statements:
INSERT INTO languages (name, code) VALUES 
    ('French', 'fr'),
    ('Spanish', 'es');

INSERT INTO questions (language_id, question_text, correct_answer, explanation) 
VALUES 
    (1, 'How do you say ''Hello'' in French?', 'Bonjour', 'Bonjour is the French word for Hello');

INSERT INTO choices (question_id, choice_text, is_correct) VALUES 
    (1, 'Bonjour', true),
    (1, 'Gracias', false),
    (1, 'Ciao', false),
    (1, 'Hola', false);