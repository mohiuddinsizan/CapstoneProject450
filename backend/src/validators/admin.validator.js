const Joi = require('joi');

const createLocationSchema = Joi.object({
  name: Joi.string().max(100).required(),
  building: Joi.string().max(100).allow('', null),
  floor: Joi.string().max(20).allow('', null)
});

const updateLockerSchema = Joi.object({
  lockerName: Joi.string().max(50),
  series: Joi.string().max(50).allow('', null),
  firmwareVersion: Joi.string().max(20).allow('', null)
});

const maintenanceSchema = Joi.object({
  maintenance: Joi.boolean().required()
});

const unlockSchema = Joi.object({
  lockerId: Joi.string().uuid().required()
});

const createPlanSchema = Joi.object({
  name: Joi.string().max(100).required(),
  billingType: Joi.string().max(30).allow('', null),
  durationMinutes: Joi.number().integer().positive().required(),
  price: Joi.number().positive().required(),
  active: Joi.boolean().default(true)
});

module.exports = {
  createLocationSchema,
  updateLockerSchema,
  maintenanceSchema,
  unlockSchema,
  createPlanSchema
};