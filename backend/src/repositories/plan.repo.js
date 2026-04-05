const { query } = require('../config/db');

async function findActivePlanById(planId) {
  const result = await query(
    `SELECT id, name, billing_type, duration_minutes, price, active
     FROM subscription_plans
     WHERE id = $1 AND active = TRUE`,
    [planId]
  );

  return result.rows[0] || null;
}

async function listPlans() {
  const result = await query(
    `SELECT id, name, billing_type, duration_minutes, price, active
     FROM subscription_plans
     ORDER BY name ASC`
  );

  return result.rows;
}

async function createPlan({ name, billingType, durationMinutes, price, active = true }) {
  const result = await query(
    `INSERT INTO subscription_plans (name, billing_type, duration_minutes, price, active)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id, name, billing_type, duration_minutes, price, active`,
    [name, billingType || null, durationMinutes, price, active]
  );

  return result.rows[0];
}

module.exports = {
  findActivePlanById,
  listPlans,
  createPlan
};