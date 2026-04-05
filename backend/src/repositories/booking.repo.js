const { query } = require('../config/db');

async function createBooking({ userId, lockerId, planId, totalAmount, startAt, endAt }) {
  const result = await query(
    `INSERT INTO bookings (user_id, locker_id, plan_id, total_amount, status, start_at, end_at)
     VALUES ($1, $2, $3, $4, 'PENDING', $5, $6)
     RETURNING id, user_id, locker_id, plan_id, total_amount, status, start_at, end_at, created_at`,
    [userId, lockerId, planId, totalAmount, startAt, endAt]
  );

  return result.rows[0];
}

async function findBookingsByUser(userId) {
  const result = await query(
    `SELECT b.id, b.user_id, b.locker_id, b.plan_id, b.total_amount, b.status, b.start_at, b.end_at, b.created_at,
            l.locker_name, l.status AS locker_status,
            sp.name AS plan_name, sp.duration_minutes, sp.price
     FROM bookings b
     LEFT JOIN lockers l ON l.id = b.locker_id
     LEFT JOIN subscription_plans sp ON sp.id = b.plan_id
     WHERE b.user_id = $1
     ORDER BY b.created_at DESC`,
    [userId]
  );

  return result.rows;
}

async function findBookingByIdForUser(bookingId, userId) {
  const result = await query(
    `SELECT b.id, b.user_id, b.locker_id, b.plan_id, b.total_amount, b.status, b.start_at, b.end_at, b.created_at,
            l.locker_name, l.status AS locker_status,
            sp.name AS plan_name, sp.duration_minutes, sp.price
     FROM bookings b
     LEFT JOIN lockers l ON l.id = b.locker_id
     LEFT JOIN subscription_plans sp ON sp.id = b.plan_id
     WHERE b.id = $1 AND b.user_id = $2`,
    [bookingId, userId]
  );

  return result.rows[0] || null;
}

async function findBookingById(bookingId) {
  const result = await query(
    `SELECT b.id, b.user_id, b.locker_id, b.plan_id, b.total_amount, b.status, b.start_at, b.end_at, b.created_at,
            sp.duration_minutes
     FROM bookings b
     LEFT JOIN subscription_plans sp ON sp.id = b.plan_id
     WHERE b.id = $1`,
    [bookingId]
  );

  return result.rows[0] || null;
}

async function activateBooking(bookingId, startAt, endAt) {
  const result = await query(
    `UPDATE bookings
     SET status = 'ACTIVE', start_at = $2, end_at = $3
     WHERE id = $1
     RETURNING id, user_id, locker_id, plan_id, total_amount, status, start_at, end_at, created_at`,
    [bookingId, startAt, endAt]
  );

  return result.rows[0] || null;
}

async function findExpiredActiveBookings() {
  const result = await query(
    `SELECT id, user_id, locker_id
     FROM bookings
     WHERE status = 'ACTIVE' AND end_at < NOW()`
  );

  return result.rows;
}

async function markBookingExpired(bookingId) {
  const result = await query(
    `UPDATE bookings
     SET status = 'EXPIRED'
     WHERE id = $1
     RETURNING id, user_id, locker_id, status`,
    [bookingId]
  );

  return result.rows[0] || null;
}

async function findActiveBookingByIdForUser(bookingId, userId) {
  const result = await query(
    `SELECT id, user_id, locker_id, plan_id, total_amount, status, start_at, end_at, created_at
     FROM bookings
     WHERE id = $1
       AND user_id = $2
       AND status = 'ACTIVE'`,
    [bookingId, userId]
  );

  return result.rows[0] || null;
}

module.exports = {
  createBooking,
  findBookingsByUser,
  findBookingByIdForUser,
  findBookingById,
  activateBooking,
  findExpiredActiveBookings,
  markBookingExpired,
  findActiveBookingByIdForUser
};