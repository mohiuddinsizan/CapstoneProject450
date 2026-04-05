const express = require('express');
const biometricController = require('../controllers/biometric.controller');
const { authMiddleware } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const { registerBiometricSchema } = require('../validators/biometric.validator');

const router = express.Router();

router.post('/biometric/register', authMiddleware, validate(registerBiometricSchema), biometricController.register);

module.exports = router;