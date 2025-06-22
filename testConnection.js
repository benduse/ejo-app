const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT
});

async function testConnection() {
    try {
        const client = await pool.connect();
        console.log('Successfully connected to PostgreSQL');
        
        // Test query to get languages
        const result = await client.query('SELECT * FROM languages');
        console.log('Languages in database:', result.rows);
        
        client.release();
    } catch (err) {
        console.error('Error connecting to PostgreSQL:', err);
    } finally {
        await pool.end();
    }
}

testConnection();