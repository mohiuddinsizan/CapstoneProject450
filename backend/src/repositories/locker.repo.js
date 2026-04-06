const { query } = require('../config/db');

async function searchLockers({ locationId, status }) {
  const clauses = [];
  const values = [];

  if (locationId) {
    values.push(locationId);
    clauses.push(`l.location_id = $${values.length}`);
  }

  if (status) {
    values.push(status);
    clauses.push(`l.status = $${values.length}`);
  }

  const whereClause = clauses.length ? `WHERE ${clauses.join(' AND ')}` : '';

  const result = await query(
    `SELECT l.id, l.location_id, l.locker_name, l.series, l.status, l.firmware_version,
            loc.name AS location_name, loc.building, loc.floor
     FROM lockers l
     LEFT JOIN locations loc ON loc.id = l.location_id
     ${whereClause}
     ORDER BY l.created_at DESC`,
    values
  );

  return result.rows;
}

async function findLockerById(lockerId) {
  const result = await query(
    `SELECT l.id, l.location_id, l.locker_name, l.series, l.status, l.firmware_version, l.created_at,
            loc.name AS location_name, loc.building, loc.floor
     FROM lockers l
     LEFT JOIN locations loc ON loc.id = l.location_id
     WHERE l.id = $1`,
    [lockerId]
  );

  return result.rows[0] || null;
}

async function updateLockerStatus(lockerId, status) {
  const result = await query(
    `UPDATE lockers
     SET status = $2
     WHERE id = $1
     RETURNING id, location_id, locker_name, status, created_at`,
    [lockerId, status]
  );

  return result.rows[0] || null;
}

async function listAllLockers() {
  const result = await query(
    `SELECT l.id, l.location_id, l.locker_name, l.series, l.status, l.firmware_version, l.created_at,
            loc.name AS location_name, loc.building, loc.floor
     FROM lockers l
     LEFT JOIN locations loc ON loc.id = l.location_id
     ORDER BY l.created_at DESC`
  );

  return result.rows;
}

async function updateLocker(lockerId, { lockerName, series, firmwareVersion }) {
  const result = await query(
    `UPDATE lockers
     SET locker_name = COALESCE($2, locker_name),
         series = COALESCE($3, series),
         firmware_version = COALESCE($4, firmware_version)
     WHERE id = $1
     RETURNING id, location_id, locker_name, series, status, firmware_version, created_at`,
    [lockerId, lockerName || null, series || null, firmwareVersion || null]
  );

  return result.rows[0] || null;
}

module.exports = {
  searchLockers,
  findLockerById,
  updateLockerStatus,
  listAllLockers,
  updateLocker
};