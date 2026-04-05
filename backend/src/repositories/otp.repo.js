const { query } = require('../config/db');

async function createChallenge({ userId, lockerId, otpHash, challengeType, expiresAt }) {
  const result = await query(
    `INSERT INTO otp_challenges (user_id, locker_id, otp_hash, challenge_type, expires_at)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id, user_id, locker_id, challenge_type, attempts, max_attempts, expires_at, used, created_at`,
    [userId, lockerId, otpHash, challengeType, expiresAt]
  );

  return result.rows[0];
}

async function findLatestActiveChallenge({ userId, lockerId, challengeType }) {
  const result = await query(
    `SELECT id, user_id, locker_id, otp_hash, challenge_type, attempts, max_attempts, expires_at, used, created_at
     FROM otp_challenges
     WHERE user_id = $1
       AND locker_id = $2
       AND challenge_type = $3
       AND used = FALSE
     ORDER BY created_at DESC
     LIMIT 1`,
    [userId, lockerId, challengeType]
  );

  return result.rows[0] || null;
}

async function incrementAttempts(challengeId) {
  const result = await query(
    `UPDATE otp_challenges
     SET attempts = attempts + 1
     WHERE id = $1
     RETURNING id, attempts, max_attempts`,
    [challengeId]
  );

  return result.rows[0] || null;
}

async function markUsed(challengeId) {
  await query(
    `UPDATE otp_challenges
     SET used = TRUE
     WHERE id = $1`,
    [challengeId]
  );
}

module.exports = {
  createChallenge,
  findLatestActiveChallenge,
  incrementAttempts,
  markUsed
};