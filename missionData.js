// missionData.js - Static data for the mission system

export const REGIONS = [
    { id: 'gateway', name: 'The Gateway', description: 'Your first steps into a new world.' },
    { id: 'marketplace', name: 'The Marketplace', description: 'Busy streets and local trade.' },
    { id: 'highlands', name: 'The High Highlands', description: 'Rare beauty and advanced tongues.' }
];

export const CHAPTERS = [
    {
        day: 1,
        title: "The Arrival",
        story: "You've just stepped off the dusty bus. The air is warm, and the signs are in a language you don't yet speak. You need to learn some basic greetings to find your way.",
        regionId: 'gateway'
    },
    {
        day: 2,
        title: "First Greetings",
        story: "A local vendor smiles and nods. It's time to put your 'Muraho' to the test. Politeness goes a long way here.",
        regionId: 'gateway'
    },
    {
        day: 3,
        title: "Finding Home",
        story: "You're looking for a place to stay. Knowing how to ask for 'Inzu' (house) or 'Umujyi' (city) will help you settle in.",
        regionId: 'gateway'
    },
    {
        day: 4,
        title: "The Daily Bread",
        story: "Hunger strikes! The market is filled with 'Ibiryo'. Can you identify the 'Umuceri' and 'Ibishyimbo'?",
        regionId: 'marketplace'
    },
    {
        day: 5,
        title: "Market Barter",
        story: "Everything has a price. 'Amafaranga' is the word of the hour. Negotiate well, traveler.",
        regionId: 'marketplace'
    },
    {
        day: 6,
        title: "Making Friends",
        story: "You meet a fellow traveler. Sharing stories and 'Inshuti' (friends) makes the journey worthwhile.",
        regionId: 'marketplace'
    },
    {
        day: 7,
        title: "The Weekly Reflection",
        story: "A week has passed. Look back at how far you've come from that first bus ride.",
        regionId: 'marketplace'
    }
];

export const DIFFICULTY_TIERS = {
    EASY: {
        id: 'easy',
        name: 'Easy',
        tasks: [
            { type: 'flashcards', target: 5, label: 'Review Flashcards' },
            { type: 'quizzes', target: 1, label: 'Complete Quiz' }
        ],
        reward: { xp: 50, coins: 10 }
    },
    MEDIUM: {
        id: 'medium',
        name: 'Medium',
        tasks: [
            { type: 'flashcards', target: 10, label: 'Review Flashcards' },
            { type: 'quizzes', target: 2, label: 'Complete Quizzes' },
            { type: 'accuracy', target: 80, label: 'Quiz Accuracy %' }
        ],
        reward: { xp: 150, coins: 40 }
    },
    HARD: {
        id: 'hard',
        name: 'Hard',
        tasks: [
            { type: 'flashcards', target: 20, label: 'Review Flashcards' },
            { type: 'quizzes', target: 5, label: 'Complete Quizzes' },
            { type: 'accuracy', target: 95, label: 'Perfect or Near Perfect Quiz %' }
        ],
        reward: { xp: 400, coins: 120 }
    }
};

export const WEEKLY_CHALLENGE = {
    id: 'weekly_explorer',
    title: 'The Great Explorer',
    description: 'Master the basics of the region through consistent effort.',
    tasks: [
        { type: 'total_words', target: 50, label: 'Total Words Learned' },
        { type: 'total_quizzes', target: 10, label: 'Total Quizzes Completed' },
        { type: 'streak_days', target: 5, label: '5-Day Streak' }
    ],
    reward: { xp: 1000, coins: 500, unlock: 'highlands' }
};
