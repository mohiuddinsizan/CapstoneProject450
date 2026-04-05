const dotenv = require('dotenv');

dotenv.config();

const requiredEnvVars = [
  'PORT',
  'DATABASE_URL',
  'JWT_SECRET',
  'JWT_EXPIRES_IN',
  'JWT_REFRESH_SECRET',
  'JWT_REFRESH_EXPIRES_IN',
  'BCRYPT_ROUNDS',
  'PAYMENT_WEBHOOK_SECRET',
  'DEVICE_SHARED_SECRET'
];

const missingVars = requiredEnvVars.filter((name) => !process.env[name]);

if (missingVars.length > 0) {
  throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
}

module.exports = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: Number(process.env.PORT),
  DATABASE_URL: process.env.DATABASE_URL,
  DB_POOL_MAX: Number(process.env.DB_POOL_MAX || 10),
  JWT_SECRET: process.env.JWT_SECRET,
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN,
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET,
  JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN,
  BCRYPT_ROUNDS: Number(process.env.BCRYPT_ROUNDS),
  MQTT_BROKER_URL: process.env.MQTT_BROKER_URL,
  MQTT_USERNAME: process.env.MQTT_USERNAME,
  MQTT_PASSWORD: process.env.MQTT_PASSWORD,
  PAYMENT_PROVIDER: process.env.PAYMENT_PROVIDER,
  PAYMENT_WEBHOOK_SECRET: process.env.PAYMENT_WEBHOOK_SECRET,
  DEVICE_SHARED_SECRET: process.env.DEVICE_SHARED_SECRET
};