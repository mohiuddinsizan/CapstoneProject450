const express = require('express');
const planController = require('../controllers/plan.controller');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

router.get('/plans', authMiddleware, planController.listPlans);

module.exports = router;
