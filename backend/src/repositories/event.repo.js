const { query } = require('../config/db');

async function createAccessAttempt({ userId, lockerId, deviceId, method, result, reason }) {
  const response = await query(
    `INSERT INTO access_attempts (user_id, locker_id, device_id, method, result, reason)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING id, user_id, locker_id, device_id, method, result, reason, created_at`,
    [userId || null, lockerId, deviceId || null, method, result, reason || null]
  );

  return response.rows[0];
}

async function createDoorEvent({ lockerId, eventType }) {
  const response = await query(
    `INSERT INTO door_events (locker_id, event_type)
     VALUES ($1, $2)
     RETURNING id, locker_id, event_type, created_at`,
    [lockerId, eventType]
  );

  return response.rows[0];
}

async function getAuditLogs(limit = 100, offset = 0) {
  const response = await query(
    `(
      SELECT
        aa.id,
        aa.created_at,
        'ACCESS_ATTEMPT'::text AS log_type,
        aa.locker_id,
        aa.result AS outcome,
        aa.method,
        aa.reason
      FROM access_attempts aa
    )
    UNION ALL
    (
      SELECT
        de.id,
        de.created_at,
        'DOOR_EVENT'::text AS log_type,
        de.locker_id,
        de.event_type AS outcome,
        NULL::text AS method,
        NULL::text AS reason
      FROM door_events de
    )
    ORDER BY created_at DESC
    LIMIT $1 OFFSET $2`,
    [limit, offset]
  );

  return response.rows;
}

module.exports = {
  createAccessAttempt,
  createDoorEvent,
  getAuditLogs
};