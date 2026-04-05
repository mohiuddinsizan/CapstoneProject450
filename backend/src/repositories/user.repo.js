const { query } = require('../config/db');

async function findByEmail(email) {
  const result = await query(
    `SELECT id, name, email, password_hash, phone, role, created_at
     FROM users
     WHERE email = $1`,
    [email]
  );

  return result.rows[0] || null;
}

async function findById(id) {
  const result = await query(
    `SELECT id, name, email, phone, role, created_at
     FROM users
     WHERE id = $1`,
    [id]
  );

  return result.rows[0] || null;
}

async function createUser({ name, email, passwordHash, phone }) {
  const result = await query(
    `INSERT INTO users (name, email, password_hash, phone)
     VALUES ($1, $2, $3, $4)
     RETURNING id, name, email, phone, role, created_at`,
    [name, email, passwordHash, phone || null]
  );

  return result.rows[0];
}

module.exports = {
  findByEmail,
  findById,
  createUser
};