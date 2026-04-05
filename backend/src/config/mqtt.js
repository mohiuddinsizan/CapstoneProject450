const mqtt = require('mqtt');
const env = require('./env');

let client;

function getMqttClient() {
  if (!env.MQTT_BROKER_URL) {
    return null;
  }

  if (client) {
    return client;
  }

  client = mqtt.connect(env.MQTT_BROKER_URL, {
    username: env.MQTT_USERNAME,
    password: env.MQTT_PASSWORD,
    reconnectPeriod: 3000
  });

  client.on('connect', () => console.log('MQTT connected'));
  client.on('reconnect', () => console.log('MQTT reconnecting...'));
  client.on('error', (error) => console.error('MQTT error:', error.message));

  return client;
}

module.exports = {
  getMqttClient
};