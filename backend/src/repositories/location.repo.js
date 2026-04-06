const { query } = require('../config/db');

async function getAllLocations() {
  const result = await query(
    `SELECT id, name, building, floor
     FROM locations
     ORDER BY name ASC`
  );

  return result.rows;
}

async function createLocation({ name, building, floor }) {
  const result = await query(
    `INSERT INTO locations (name, building, floor)
     VALUES ($1, $2, $3)
     RETURNING id, name, building, floor`,
    [name, building || null, floor || null]
  );

  return result.rows[0];
}

module.exports = {
  getAllLocations,
  createLocation
};