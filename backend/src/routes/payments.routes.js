const express = require('express');
const paymentsController = require('../controllers/payments.controller');
const { authMiddleware } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const { checkoutSchema, webhookSchema } = require('../validators/payment.validator');

const router = express.Router();

router.post('/payments/checkout', authMiddleware, validate(checkoutSchema), paymentsController.checkout);
router.post('/payments/webhook', validate(webhookSchema), paymentsController.webhook);
router.get('/payments/history', authMiddleware, paymentsController.history);

module.exports = router;