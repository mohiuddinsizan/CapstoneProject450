const planRepo = require('../repositories/plan.repo');

async function listPlans() {
  return planRepo.listPlans();
}

module.exports = {
  listPlans
};
