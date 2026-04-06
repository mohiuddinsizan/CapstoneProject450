import type { Booking, Location, Locker, Payment, Plan, User } from './types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

type HttpMethod = 'GET' | 'POST' | 'PATCH';

interface RequestOptions {
  method?: HttpMethod;
  token?: string;
  deviceSecret?: string;
  body?: unknown;
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: options.method ?? 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...(options.token ? { Authorization: `Bearer ${options.token}` } : {}),
      ...(options.deviceSecret ? { 'x-device-secret': options.deviceSecret } : {})
    },
    body: options.body ? JSON.stringify(options.body) : undefined
  });

  if (!response.ok) {
    const payload = (await response.json().catch(() => ({ message: 'Request failed' }))) as { message?: string };
    throw new Error(payload.message || 'Request failed');
  }

  return (await response.json()) as T;
}

export async function register(body: { name: string; email: string; password: string; phone?: string }) {
  return request<{ user: User; accessToken: string; refreshToken: string }>('/auth/register', { method: 'POST', body });
}

export async function login(body: { email: string; password: string }) {
  return request<{ user: User; accessToken: string; refreshToken: string }>('/auth/login', { method: 'POST', body });
}

export async function getMe(token: string) {
  return request<{ user: User }>('/auth/me', { token });
}

export async function refreshToken(refreshToken: string) {
  return request<{ user: User; accessToken: string; refreshToken: string }>('/auth/refresh', {
    method: 'POST',
    body: { refreshToken }
  });
}

export async function getLocations(token: string) {
  return request<{ locations: Location[] }>('/locations', { token });
}

export async function getLockers(token: string, status?: string, locationId?: string) {
  const params = new URLSearchParams();
  if (status) params.set('status', status);
  if (locationId) params.set('locationId', locationId);
  const search = params.toString() ? `?${params.toString()}` : '';
  return request<{ lockers: Locker[] }>(`/lockers${search}`, { token });
}

export async function getLockerDetails(token: string, lockerId: string) {
  return request<{ locker: Locker }>(`/lockers/${lockerId}`, { token });
}

export async function getBookings(token: string) {
  return request<{ bookings: Booking[] }>('/bookings', { token });
}

export async function getBookingDetails(token: string, bookingId: string) {
  return request<{ booking: Booking }>(`/bookings/${bookingId}`, { token });
}

export async function getPayments(token: string) {
  return request<{ payments: Payment[] }>('/payments/history', { token });
}

export async function getPlans(token: string) {
  return request<{ plans: Plan[] }>('/plans', { token });
}

export async function extendSubscription(token: string, bookingId: string, planId: string) {
  return request<{ booking: Booking }>('/subscriptions/extend', {
    method: 'POST',
    token,
    body: { bookingId, planId }
  });
}

export async function quoteBooking(token: string, body: { lockerId: string; planId: string; startAt: string }) {
  return request<{ totalAmount: number; endAt: string; durationMinutes: number }>('/bookings/quote', {
    method: 'POST',
    token,
    body
  });
}

export async function createBooking(token: string, body: { lockerId: string; planId: string; startAt: string }) {
  return request<{ booking: Booking }>('/bookings', { method: 'POST', token, body });
}

export async function checkout(token: string, bookingId: string) {
  return request<{ payment: Payment; redirectUrl: string }>('/payments/checkout', {
    method: 'POST',
    token,
    body: { bookingId }
  });
}

export async function requestOtp(token: string, lockerId: string) {
  return request<{ challengeId: string; expiresAt: string }>('/otp/request', {
    method: 'POST',
    token,
    body: { lockerId }
  });
}

export async function verifyOtp(token: string, lockerId: string, otp: string) {
  return request<{ unlockToken: string; expiresIn: string }>('/otp/verify', {
    method: 'POST',
    token,
    body: { lockerId, otp }
  });
}

export async function requestEnrollmentOtp(token: string, lockerId: string) {
  return request<{ challengeId: string; expiresAt: string }>('/otp/enrollment', {
    method: 'POST',
    token,
    body: { lockerId }
  });
}

export async function verifyEnrollmentOtp(token: string, lockerId: string, otp: string) {
  return request<{ unlockToken: string; expiresIn: string }>('/otp/verify-enrollment', {
    method: 'POST',
    token,
    body: { lockerId, otp }
  });
}

export async function registerBiometric(
  token: string,
  body: { lockerId: string; templateHash: string; deviceId?: string }
) {
  return request<{ enrollment: Record<string, unknown> }>('/biometric/register', {
    method: 'POST',
    token,
    body
  });
}

export async function deviceAccessDecision(body: { lockerId: string; userId: string; nonce: number }, deviceSecret: string) {
  return request<{ allow: boolean; reason?: string; unlockToken?: string }>('/access/decision', {
    method: 'POST',
    deviceSecret,
    body
  });
}

export async function deviceEvent(
  body: { lockerId: string; eventType: 'UNLOCKED' | 'OPENED' | 'CLOSED' | 'LOCKED' },
  deviceSecret: string
) {
  return request<{ event: Record<string, unknown> }>('/device/events', {
    method: 'POST',
    deviceSecret,
    body
  });
}

export async function deviceTelemetry(body: { lockerId: string; payload: Record<string, unknown> }, deviceSecret: string) {
  return request<{ telemetry: Record<string, unknown> }>('/device/telemetry', {
    method: 'POST',
    deviceSecret,
    body
  });
}

export async function adminLockers(token: string) {
  return request<{ lockers: Locker[] }>('/admin/lockers', { token });
}

export async function adminAudit(token: string) {
  return request<{ logs: Array<Record<string, unknown>> }>('/admin/audit?limit=25&offset=0', { token });
}

export async function adminDevices(token: string) {
  return request<{ devices: Array<Record<string, unknown>> }>('/admin/devices', { token });
}

export async function adminSubscriptionPlans(token: string) {
  return request<{ plans: Plan[] }>('/admin/subscription-plans', { token });
}

export async function adminMaintenance(token: string, lockerId: string, maintenance: boolean) {
  return request<{ locker: Locker }>(`/admin/lockers/${lockerId}/maintenance`, {
    method: 'PATCH',
    token,
    body: { maintenance }
  });
}

export async function adminCreateLocation(
  token: string,
  body: { name: string; building?: string; floor?: string; latitude?: number; longitude?: number }
) {
  return request<{ location: Location }>('/admin/locations', {
    method: 'POST',
    token,
    body
  });
}

export async function adminUpdateLocker(
  token: string,
  lockerId: string,
  body: { lockerName?: string; series?: string; firmwareVersion?: string }
) {
  return request<{ locker: Locker }>(`/admin/lockers/${lockerId}`, {
    method: 'PATCH',
    token,
    body
  });
}

export async function adminUnlock(token: string, lockerId: string) {
  return request<{ lockerId: string; token: string; expiresIn: string }>('/admin/unlock', {
    method: 'POST',
    token,
    body: { lockerId }
  });
}

export async function adminCreatePlan(
  token: string,
  body: { name: string; billingType?: string; durationMinutes: number; price: number; active?: boolean }
) {
  return request<{ plan: Plan }>('/admin/subscription-plans', {
    method: 'POST',
    token,
    body
  });
}
