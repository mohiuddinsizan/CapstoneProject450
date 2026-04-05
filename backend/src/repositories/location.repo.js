const { query } = require('../config/db');

async function getAllLocations() {
  const result = await query(
    `SELECT id, name, building, floor, latitude, longitude
     FROM locations
     ORDER BY name ASC`
  );

  return result.rows;
}

async function createLocation({ name, building, floor, latitude, longitude }) {
  const result = await query(
    `INSERT INTO locations (name, building, floor, latitude, longitude)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id, name, building, floor, latitude, longitude`,
    [name, building || null, floor || null, latitude ?? null, longitude ?? null]
  );

  return result.rows[0];
}

module.exports = {
  getAllLocations,
  createLocation
};