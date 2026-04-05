const { query } = require('../config/db');

async function createEnrollment({ userId, lockerId, deviceId, templateHash }) {
  const result = await query(
    `INSERT INTO biometric_enrollments (user_id, locker_id, device_id, template_hash)
     VALUES ($1, $2, $3, $4)
     RETURNING id, user_id, locker_id, device_id, template_hash, enrolled_at, created_at`,
    [userId, lockerId, deviceId || null, templateHash]
  );

  return result.rows[0];
}

module.exports = {
  createEnrollment
};