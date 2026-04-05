const request = require('supertest');
const { signAccessToken } = require('../../src/utils/jwt');

jest.mock('../../src/services/otp.service', () => ({
  requestOtp: jest.fn(),
  verifyChallenge: jest.fn()
}));

jest.mock('../../src/services/access.service', () => ({
  decision: jest.fn()
}));

jest.mock('../../src/services/device.service', () => ({
  logEvent: jest.fn(),
  logTelemetry: jest.fn()
}));

jest.mock('../../src/services/admin.service', () => ({
  createLocation: jest.fn(),
  listLockers: jest.fn(),
  updateLocker: jest.fn(),
  toggleMaintenance: jest.fn(),
  emergencyUnlock: jest.fn(),
  getAudit: jest.fn(),
  getDevices: jest.fn(),
  getPlans: jest.fn(),
  createPlan: jest.fn()
}));

jest.mock('../../src/services/biometric.service', () => ({
  register: jest.fn()
}));

const otpService = require('../../src/services/otp.service');
const accessService = require('../../src/services/access.service');
const deviceService = require('../../src/services/device.service');
const adminService = require('../../src/services/admin.service');
const biometricService = require('../../src/services/biometric.service');
const createApp = require('../../src/app');

describe('OTP/access/device/admin/biometric integration routes', () => {
  const app = createApp();
  const userToken = signAccessToken({ userId: 'user-1', email: 'user@example.com', role: 'user' });
  const adminToken = signAccessToken({ userId: 'admin-1', email: 'admin@example.com', role: 'admin' });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('POST /otp/request issues challenge', async () => {
    otpService.requestOtp.mockResolvedValue({ challengeId: 'challenge-1', expiresAt: '2026-04-05T10:10:00.000Z' });

    const res = await request(app)
      .post('/otp/request')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ lockerId: '11111111-1111-1111-1111-111111111111' });

    expect(res.status).toBe(200);
    expect(res.body.challengeId).toBe('challenge-1');
  });

  test('POST /access/decision allows device-authenticated flow', async () => {
    accessService.decision.mockResolvedValue({ granted: true, unlockToken: 'unlock-1', expiresIn: '30s' });

    const res = await request(app)
      .post('/access/decision')
      .set('x-device-secret', process.env.DEVICE_SHARED_SECRET)
      .send({
        lockerId: '11111111-1111-1111-1111-111111111111',
        userId: '22222222-2222-2222-2222-222222222222',
        nonce: 0
      });

    expect(res.status).toBe(200);
    expect(res.body.granted).toBe(true);
  });

  test('POST /device/events stores device event', async () => {
    deviceService.logEvent.mockResolvedValue({ id: 'event-1' });

    const res = await request(app)
      .post('/device/events')
      .set('x-device-secret', process.env.DEVICE_SHARED_SECRET)
      .send({
        lockerId: '11111111-1111-1111-1111-111111111111',
        eventType: 'OPENED'
      });

    expect(res.status).toBe(201);
    expect(res.body.event.id).toBe('event-1');
  });

  test('GET /admin/lockers requires admin token and returns list', async () => {
    adminService.listLockers.mockResolvedValue([{ id: 'locker-1' }]);

    const res = await request(app)
      .get('/admin/lockers')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.lockers).toHaveLength(1);
  });

  test('POST /biometric/register stores enrollment', async () => {
    biometricService.register.mockResolvedValue({ id: 'bio-1' });

    const res = await request(app)
      .post('/biometric/register')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        lockerId: '11111111-1111-1111-1111-111111111111',
        templateHash: 'template_hash_value_123456'
      });

    expect(res.status).toBe(201);
    expect(res.body.enrollment.id).toBe('bio-1');
  });
});