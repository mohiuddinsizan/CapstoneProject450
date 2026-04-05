const discoveryService = require('../services/discovery.service');

async function getLocations(_req, res, next) {
  try {
    const locations = await discoveryService.getLocations();
    res.status(200).json({ locations });
  } catch (error) {
    next(error);
  }
}

async function getLockers(req, res, next) {
  try {
    const lockers = await discoveryService.getLockers({
      locationId: req.query.locationId,
      status: req.query.status
    });
    res.status(200).json({ lockers });
  } catch (error) {
    next(error);
  }
}

async function getLockerDetails(req, res, next) {
  try {
    const locker = await discoveryService.getLockerDetails(req.params.id);
    res.status(200).json({ locker });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getLocations,
  getLockers,
  getLockerDetails
};