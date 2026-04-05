const { query } = require('../config/db');

async function findDeviceByLockerId(lockerId) {
  const result = await query(
    `SELECT id, locker_id, nonce, created_at
     FROM devices
     WHERE locker_id = $1
     LIMIT 1`,
    [lockerId]
  );

  return result.rows[0] || null;
}

async function ensureDeviceForLocker(lockerId) {
  const existing = await findDeviceByLockerId(lockerId);
  if (existing) {
    return existing;
  }

  const result = await query(
    `INSERT INTO devices (locker_id, nonce)
     VALUES ($1, 0)
     RETURNING id, locker_id, nonce, created_at`,
    [lockerId]
  );

  return result.rows[0];
}

async function incrementNonce(deviceId) {
  const result = await query(
    `UPDATE devices
     SET nonce = nonce + 1
     WHERE id = $1
     RETURNING id, locker_id, nonce, created_at`,
    [deviceId]
  );

  return result.rows[0] || null;
}

async function createTelemetry({ deviceId, lockerId, payload }) {
  const result = await query(
    `INSERT INTO device_telemetry (device_id, locker_id, payload)
     VALUES ($1, $2, $3)
     RETURNING id, device_id, locker_id, payload, created_at`,
    [deviceId, lockerId, payload]
  );

  return result.rows[0];
}

async function listDevices() {
  const result = await query(
    `SELECT d.id, d.locker_id, d.nonce, d.created_at,
            l.locker_name
     FROM devices d
     LEFT JOIN lockers l ON l.id = d.locker_id
     ORDER BY d.created_at DESC`
  );

  return result.rows;
}

module.exports = {
  findDeviceByLockerId,
  ensureDeviceForLocker,
  incrementNonce,
  createTelemetry,
  listDevices
};