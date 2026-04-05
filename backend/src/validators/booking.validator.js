const Joi = require('joi');

const quoteSchema = Joi.object({
  lockerId: Joi.string().uuid().required(),
  planId: Joi.string().uuid().required(),
  startAt: Joi.date().iso().required()
});

const createBookingSchema = Joi.object({
  lockerId: Joi.string().uuid().required(),
  planId: Joi.string().uuid().required(),
  startAt: Joi.date().iso().required()
});

const extendSubscriptionSchema = Joi.object({
  bookingId: Joi.string().uuid().required(),
  planId: Joi.string().uuid().required()
});

module.exports = {
  quoteSchema,
  createBookingSchema,
  extendSubscriptionSchema
};