const crypto = require('crypto');
const env = require('../config/env');

function verifyWebhookSignature(rawPayload, signature) {
  if (!env.PAYMENT_WEBHOOK_SECRET || !signature) {
    return false;
  }

  const expected = crypto
    .createHmac('sha256', env.PAYMENT_WEBHOOK_SECRET)
    .update(rawPayload)
    .digest('hex');

  if (expected.length !== signature.length) {
    return false;
  }

  return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
}

module.exports = {
  verifyWebhookSignature
};