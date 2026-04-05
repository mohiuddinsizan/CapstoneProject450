const express = require('express');
const otpController = require('../controllers/otp.controller');
const { authMiddleware } = require('../middleware/auth');
const { otpLimiter } = require('../middleware/rateLimiter');
const { validate } = require('../middleware/validate');
const { requestOtpSchema, verifyOtpSchema } = require('../validators/otp.validator');

const router = express.Router();

router.post('/otp/request', authMiddleware, otpLimiter, validate(requestOtpSchema), otpController.request);
router.post('/otp/verify', authMiddleware, otpLimiter, validate(verifyOtpSchema), otpController.verify);
router.post('/otp/enrollment', authMiddleware, otpLimiter, validate(requestOtpSchema), otpController.enrollment);
router.post('/otp/verify-enrollment', authMiddleware, otpLimiter, validate(verifyOtpSchema), otpController.verifyEnrollment);

module.exports = router;