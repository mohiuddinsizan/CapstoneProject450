const { getMqttClient } = require('../config/mqtt');

function publishUnlockToken(lockerId, payload) {
  const client = getMqttClient();
  if (!client) {
    return false;
  }

  client.publish(`lockers/${lockerId}/access/response`, JSON.stringify(payload));
  return true;
}

function publishLockCommand(lockerId) {
  const client = getMqttClient();
  if (!client) {
    return false;
  }

  client.publish(`lockers/${lockerId}/command`, JSON.stringify({ action: 'LOCK' }));
  return true;
}

module.exports = {
  publishUnlockToken,
  publishLockCommand
};