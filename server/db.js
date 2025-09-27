// db.js
const { Pool } = require('pg');
const pool = new Pool({
  user: 'ben',
  host: 'localhost',
  database: 'ejo',
  password: 'smiLem1425@!',
  port: 5432,
});
module.exports = pool;