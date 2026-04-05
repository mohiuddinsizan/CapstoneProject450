const request = require('supertest');
const { signAccessToken } = require('../../src/utils/jwt');

jest.mock('../../src/services/booking.service', () => ({
  quote: jest.fn(),
  createBooking: jest.fn(),
  getUserBookings: jest.fn(),
  getBookingDetails: jest.fn(),
  extendSubscription: jest.fn()
}));

jest.mock('../../src/services/payment.service', () => ({
  checkout: jest.fn(),
  processWebhook: jest.fn(),
  getHistory: jest.fn()
}));

const bookingService = require('../../src/services/booking.service');
const paymentService = require('../../src/services/payment.service');
const createApp = require('../../src/app');

describe('Booking and payment integration routes', () => {
  const app = createApp();
  const token = signAccessToken({ userId: 'user-1', email: 'user@example.com', role: 'user' });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('POST /bookings/quote returns quote', async () => {
    bookingService.quote.mockResolvedValue({
      lockerId: '11111111-1111-1111-1111-111111111111',
      planId: '22222222-2222-2222-2222-222222222222',
      startAt: '2026-04-05T10:00:00.000Z',
      endAt: '2026-04-05T11:00:00.000Z',
      durationMinutes: 60,
      totalAmount: 120
    });

    const res = await request(app)
      .post('/bookings/quote')
      .set('Authorization', `Bearer ${token}`)
      .send({
        lockerId: '11111111-1111-1111-1111-111111111111',
        planId: '22222222-2222-2222-2222-222222222222',
        startAt: '2026-04-05T10:00:00.000Z'
      });

    expect(res.status).toBe(200);
    expect(res.body.totalAmount).toBe(120);
  });

  test('POST /bookings creates pending booking', async () => {
    bookingService.createBooking.mockResolvedValue({ id: 'booking-1', status: 'PENDING' });

    const res = await request(app)
      .post('/bookings')
      .set('Authorization', `Bearer ${token}`)
      .send({
        lockerId: '11111111-1111-1111-1111-111111111111',
        planId: '22222222-2222-2222-2222-222222222222',
        startAt: '2026-04-05T10:00:00.000Z'
      });

    expect(res.status).toBe(201);
    expect(res.body.booking.status).toBe('PENDING');
  });

  test('POST /payments/checkout returns redirect URL', async () => {
    paymentService.checkout.mockResolvedValue({
      payment: { id: 'payment-1', status: 'PENDING' },
      redirectUrl: 'https://payments.example/checkout/ref-1'
    });

    const res = await request(app)
      .post('/payments/checkout')
      .set('Authorization', `Bearer ${token}`)
      .send({ bookingId: '33333333-3333-3333-3333-333333333333' });

    expect(res.status).toBe(200);
    expect(res.body.redirectUrl).toContain('/checkout/');
  });

  test('POST /payments/webhook processes callback', async () => {
    paymentService.processWebhook.mockResolvedValue({ processed: true, idempotent: false });

    const res = await request(app)
      .post('/payments/webhook')
      .set('x-webhook-signature', 'test-signature')
      .send({ providerRef: 'ref-123', status: 'SUCCESS' });

    expect(res.status).toBe(200);
    expect(res.body.processed).toBe(true);
  });
});