const request = require('supertest');
const { signAccessToken } = require('../../src/utils/jwt');

jest.mock('../../src/services/auth.service', () => ({
  register: jest.fn(),
  login: jest.fn(),
  refresh: jest.fn(),
  getMe: jest.fn()
}));

const authService = require('../../src/services/auth.service');
const createApp = require('../../src/app');

describe('Auth integration routes', () => {
  const app = createApp();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('GET /health returns ok', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: 'ok' });
  });

  test('POST /auth/register returns 201', async () => {
    authService.register.mockResolvedValue({
      user: { id: 'user-1', name: 'Test User', email: 'test@example.com', role: 'user' },
      accessToken: 'token-a',
      refreshToken: 'token-r'
    });

    const res = await request(app).post('/auth/register').send({
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123',
      phone: '01700000000'
    });

    expect(res.status).toBe(201);
    expect(res.body.user.email).toBe('test@example.com');
    expect(authService.register).toHaveBeenCalledTimes(1);
  });

  test('POST /auth/login validates request body', async () => {
    const res = await request(app).post('/auth/login').send({
      email: 'bad@example.com'
    });

    expect(res.status).toBe(400);
  });

  test('GET /auth/me returns profile with token', async () => {
    authService.getMe.mockResolvedValue({
      id: 'user-2',
      name: 'Token User',
      email: 'token@example.com',
      role: 'user'
    });

    const token = signAccessToken({ userId: 'user-2', email: 'token@example.com', role: 'user' });
    const res = await request(app).get('/auth/me').set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.user.id).toBe('user-2');
    expect(authService.getMe).toHaveBeenCalledWith('user-2');
  });
});