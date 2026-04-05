const express = require('express');
const accessController = require('../controllers/access.controller');
const { deviceAuth } = require('../middleware/deviceAuth');
const { accessLimiter } = require('../middleware/rateLimiter');
const { validate } = require('../middleware/validate');
const { accessDecisionSchema } = require('../validators/access.validator');

const router = express.Router();

router.post('/access/decision', deviceAuth, accessLimiter, validate(accessDecisionSchema), accessController.decision);

module.exports = router;