const { query } = require('../config/db');

async function createAccessGrant({ bookingId, userId, lockerId, startAt, endAt }) {
  const result = await query(
    `INSERT INTO access_grants (booking_id, user_id, locker_id, status, start_at, end_at)
     VALUES ($1, $2, $3, 'ACTIVE', $4, $5)
     RETURNING id, booking_id, user_id, locker_id, status, start_at, end_at`,
    [bookingId, userId, lockerId, startAt, endAt]
  );

  return result.rows[0];
}

async function findActiveGrant(userId, lockerId) {
  const result = await query(
    `SELECT id, booking_id, user_id, locker_id, status, start_at, end_at
     FROM access_grants
     WHERE user_id = $1
       AND locker_id = $2
       AND status = 'ACTIVE'
       AND end_at > NOW()
     ORDER BY end_at DESC
     LIMIT 1`,
    [userId, lockerId]
  );

  return result.rows[0] || null;
}

async function expireByBookingId(bookingId) {
  await query(
    `UPDATE access_grants
     SET status = 'EXPIRED'
     WHERE booking_id = $1`,
    [bookingId]
  );
}

module.exports = {
  createAccessGrant,
  findActiveGrant,
  expireByBookingId
};