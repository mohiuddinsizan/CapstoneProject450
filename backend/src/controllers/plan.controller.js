const planService = require('../services/plan.service');

async function listPlans(_req, res, next) {
  try {
    const plans = await planService.listPlans();
    res.status(200).json({ plans });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  listPlans
};
