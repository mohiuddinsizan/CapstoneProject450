const Joi = require('joi');

const eventSchema = Joi.object({
  lockerId: Joi.string().uuid().required(),
  eventType: Joi.string().valid('UNLOCKED', 'OPENED', 'CLOSED', 'LOCKED').required()
});

const telemetrySchema = Joi.object({
  lockerId: Joi.string().uuid().required(),
  payload: Joi.object().required()
});

module.exports = {
  eventSchema,
  telemetrySchema
};