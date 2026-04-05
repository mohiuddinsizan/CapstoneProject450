const express = require('express');
const adminController = require('../controllers/admin.controller');
const { authMiddleware } = require('../middleware/auth');
const { adminOnly } = require('../middleware/adminOnly');
const { validate } = require('../middleware/validate');
const {
  createLocationSchema,
  updateLockerSchema,
  maintenanceSchema,
  unlockSchema,
  createPlanSchema
} = require('../validators/admin.validator');

const router = express.Router();

router.use(authMiddleware, adminOnly);

router.post('/locations', validate(createLocationSchema), adminController.createLocation);
router.get('/lockers', adminController.getLockers);
router.patch('/lockers/:id', validate(updateLockerSchema), adminController.updateLocker);
router.patch('/lockers/:id/maintenance', validate(maintenanceSchema), adminController.maintenance);
router.post('/unlock', validate(unlockSchema), adminController.unlock);
router.get('/audit', adminController.audit);
router.get('/devices', adminController.devices);
router.get('/subscription-plans', adminController.listPlans);
router.post('/subscription-plans', validate(createPlanSchema), adminController.createPlan);

module.exports = router;