const adminService = require('../services/admin.service');

async function createLocation(req, res, next) {
  try {
    const location = await adminService.createLocation(req.body);
    res.status(201).json({ location });
  } catch (error) {
    next(error);
  }
}

async function getLockers(_req, res, next) {
  try {
    const lockers = await adminService.listLockers();
    res.status(200).json({ lockers });
  } catch (error) {
    next(error);
  }
}

async function updateLocker(req, res, next) {
  try {
    const locker = await adminService.updateLocker(req.params.id, req.body);
    res.status(200).json({ locker });
  } catch (error) {
    next(error);
  }
}

async function maintenance(req, res, next) {
  try {
    const locker = await adminService.toggleMaintenance(req.params.id, req.body.maintenance);
    res.status(200).json({ locker });
  } catch (error) {
    next(error);
  }
}

async function unlock(req, res, next) {
  try {
    const result = await adminService.emergencyUnlock(req.body.lockerId, req.user.userId);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}

async function audit(req, res, next) {
  try {
    const limit = Number(req.query.limit || 100);
    const offset = Number(req.query.offset || 0);
    const logs = await adminService.getAudit(limit, offset);
    res.status(200).json({ logs });
  } catch (error) {
    next(error);
  }
}

async function devices(_req, res, next) {
  try {
    const devices = await adminService.getDevices();
    res.status(200).json({ devices });
  } catch (error) {
    next(error);
  }
}

async function listPlans(_req, res, next) {
  try {
    const plans = await adminService.getPlans();
    res.status(200).json({ plans });
  } catch (error) {
    next(error);
  }
}

async function createPlan(req, res, next) {
  try {
    const plan = await adminService.createPlan(req.body);
    res.status(201).json({ plan });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  createLocation,
  getLockers,
  updateLocker,
  maintenance,
  unlock,
  audit,
  devices,
  listPlans,
  createPlan
};