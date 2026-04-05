const { Pool } = require('pg');
const env = require('./env');

const pool = new Pool({
  connectionString: env.DATABASE_URL,
  max: env.DB_POOL_MAX,
  ssl: env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function query(text, params) {
  return pool.query(text, params);
}

async function testDbConnection() {
  await query('SELECT 1');
}

module.exports = {
  pool,
  query,
  testDbConnection
};