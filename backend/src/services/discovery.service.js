const { httpError } = require('../utils/httpError');
const locationRepo = require('../repositories/location.repo');
const lockerRepo = require('../repositories/locker.repo');

async function getLocations() {
  return locationRepo.getAllLocations();
}

async function getLockers(filters) {
  return lockerRepo.searchLockers(filters);
}

async function getLockerDetails(lockerId) {
  const locker = await lockerRepo.findLockerById(lockerId);
  if (!locker) {
    throw httpError(404, 'Locker not found');
  }

  return locker;
}

module.exports = {
  getLocations,
  getLockers,
  getLockerDetails
};