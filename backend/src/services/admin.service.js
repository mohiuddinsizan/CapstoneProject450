const { signAccessToken } = require('../utils/jwt');
const { publishUnlockToken } = require('../utils/mqttPublish');
const { httpError } = require('../utils/httpError');
const locationRepo = require('../repositories/location.repo');
const lockerRepo = require('../repositories/locker.repo');
const planRepo = require('../repositories/plan.repo');
const eventRepo = require('../repositories/event.repo');
const deviceRepo = require('../repositories/device.repo');

async function createLocation(payload) {
  return locationRepo.createLocation(payload);
}

async function listLockers() {
  return lockerRepo.listAllLockers();
}

async function updateLocker(lockerId, payload) {
  const locker = await lockerRepo.updateLocker(lockerId, payload);
  if (!locker) {
    throw httpError(404, 'Locker not found');
  }

  return locker;
}

async function toggleMaintenance(lockerId, maintenance) {
  const status = maintenance ? 'MAINTENANCE' : 'AVAILABLE';
  const locker = await lockerRepo.updateLockerStatus(lockerId, status);
  if (!locker) {
    throw httpError(404, 'Locker not found');
  }

  return locker;
}

async function emergencyUnlock(lockerId, adminId) {
  const locker = await lockerRepo.findLockerById(lockerId);
  if (!locker) {
    throw httpError(404, 'Locker not found');
  }

  const token = signAccessToken({
    lockerId,
    adminId,
    type: 'admin_unlock'
  });

  publishUnlockToken(lockerId, {
    token,
    type: 'admin_unlock'
  });

  return { lockerId, token, expiresIn: '15m' };
}

async function getAudit(limit, offset) {
  return eventRepo.getAuditLogs(limit, offset);
}

async function getDevices() {
  return deviceRepo.listDevices();
}

async function getPlans() {
  return planRepo.listPlans();
}

async function createPlan(payload) {
  return planRepo.createPlan(payload);
}

module.exports = {
  createLocation,
  listLockers,
  updateLocker,
  toggleMaintenance,
  emergencyUnlock,
  getAudit,
  getDevices,
  getPlans,
  createPlan
};