const express = require('express');
const deviceController = require('../controllers/device.controller');
const { deviceAuth } = require('../middleware/deviceAuth');
const { validate } = require('../middleware/validate');
const { eventSchema, telemetrySchema } = require('../validators/device.validator');

const router = express.Router();

router.post('/device/events', deviceAuth, validate(eventSchema), deviceController.events);
router.post('/device/telemetry', deviceAuth, validate(telemetrySchema), deviceController.telemetry);

module.exports = router;