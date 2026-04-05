const { query } = require('../config/db');

async function createTransaction({ bookingId, lockerId, amount, provider, providerRef, status = 'PENDING' }) {
  const result = await query(
    `INSERT INTO payment_transactions (booking_id, locker_id, amount, provider, provider_ref, status)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING id, booking_id, locker_id, amount, currency, provider, provider_ref, status, created_at`,
    [bookingId, lockerId, amount, provider, providerRef, status]
  );

  return result.rows[0];
}

async function findByProviderRef(providerRef) {
  const result = await query(
    `SELECT id, booking_id, locker_id, amount, currency, provider, provider_ref, status, created_at
     FROM payment_transactions
     WHERE provider_ref = $1`,
    [providerRef]
  );

  return result.rows[0] || null;
}

async function updateStatusByProviderRef(providerRef, status) {
  const result = await query(
    `UPDATE payment_transactions
     SET status = $2
     WHERE provider_ref = $1
     RETURNING id, booking_id, locker_id, amount, currency, provider, provider_ref, status, created_at`,
    [providerRef, status]
  );

  return result.rows[0] || null;
}

async function getPaymentHistoryByUser(userId) {
  const result = await query(
    `SELECT pt.id, pt.booking_id, pt.locker_id, pt.amount, pt.currency, pt.provider, pt.provider_ref, pt.status, pt.created_at
     FROM payment_transactions pt
     JOIN bookings b ON b.id = pt.booking_id
     WHERE b.user_id = $1
     ORDER BY pt.created_at DESC`,
    [userId]
  );

  return result.rows;
}

module.exports = {
  createTransaction,
  findByProviderRef,
  updateStatusByProviderRef,
  getPaymentHistoryByUser
};