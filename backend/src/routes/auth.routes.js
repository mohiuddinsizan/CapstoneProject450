const express = require('express');
const authController = require('../controllers/auth.controller');
const { authMiddleware } = require('../middleware/auth');
const { authLimiter } = require('../middleware/rateLimiter');
const { validate } = require('../middleware/validate');
const { registerSchema, loginSchema, refreshSchema } = require('../validators/auth.validator');

const router = express.Router();

router.post('/register', authLimiter, validate(registerSchema), authController.register);
router.post('/login', authLimiter, validate(loginSchema), authController.login);
router.post('/refresh', authLimiter, validate(refreshSchema), authController.refresh);
router.get('/me', authMiddleware, authController.me);

module.exports = router;