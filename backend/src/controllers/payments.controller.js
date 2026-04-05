const paymentService = require('../services/payment.service');

async function checkout(req, res, next) {
  try {
    const result = await paymentService.checkout({
      userId: req.user.userId,
      bookingId: req.body.bookingId
    });
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}

async function webhook(req, res, next) {
  try {
    const signature = req.headers['x-webhook-signature'];
    const rawPayload = JSON.stringify(req.body);
    const result = await paymentService.processWebhook({
      rawPayload,
      signature,
      providerRef: req.body.providerRef,
      status: req.body.status
    });
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}

async function history(req, res, next) {
  try {
    const payments = await paymentService.getHistory(req.user.userId);
    res.status(200).json({ payments });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  checkout,
  webhook,
  history
};