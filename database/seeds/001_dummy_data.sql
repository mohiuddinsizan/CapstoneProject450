BEGIN;

INSERT INTO users (id, name, email, password_hash, phone, role, created_at)
VALUES
  ('11111111-1111-1111-1111-111111111111', 'Demo User', 'demo.user@omnilock.local', '$2b$10$kW5T4fY2D2wQVRMCP5aF2eb4n7m5m8Qq0F4aDqX8OQ6o2Q9KQn3nK', '01710000001', 'user', NOW()),
  ('11111111-1111-1111-1111-111111111112', 'Demo Admin', 'demo.admin@omnilock.local', '$2b$10$kW5T4fY2D2wQVRMCP5aF2eb4n7m5m8Qq0F4aDqX8OQ6o2Q9KQn3nK', '01710000002', 'admin', NOW())
ON CONFLICT (id) DO UPDATE
SET
  name = EXCLUDED.name,
  email = EXCLUDED.email,
  phone = EXCLUDED.phone,
  role = EXCLUDED.role;

INSERT INTO locations (id, name, building, floor)
VALUES
  ('22222222-2222-2222-2222-222222222221', 'OmniLock HQ', 'Tower A', '5'),
  ('22222222-2222-2222-2222-222222222222', 'OmniLock Branch', 'Tower B', '2')
ON CONFLICT (id) DO UPDATE
SET
  name = EXCLUDED.name,
  building = EXCLUDED.building,
  floor = EXCLUDED.floor;

INSERT INTO lockers (id, location_id, locker_name, series, status, public_key, firmware_version, created_at)
VALUES
  ('33333333-3333-3333-3333-333333333331', '22222222-2222-2222-2222-222222222221', 'L-101', 'S1', 'AVAILABLE', 'pubkey-demo-101', '1.0.0', NOW()),
  ('33333333-3333-3333-3333-333333333332', '22222222-2222-2222-2222-222222222222', 'L-201', 'S1', 'OCCUPIED', 'pubkey-demo-201', '1.0.1', NOW())
ON CONFLICT (id) DO UPDATE
SET
  location_id = EXCLUDED.location_id,
  locker_name = EXCLUDED.locker_name,
  series = EXCLUDED.series,
  status = EXCLUDED.status,
  public_key = EXCLUDED.public_key,
  firmware_version = EXCLUDED.firmware_version;

INSERT INTO subscription_plans (id, name, billing_type, duration_minutes, price, active)
VALUES
  ('44444444-4444-4444-4444-444444444441', 'Hourly Plan', 'ONE_TIME', 60, 50.00, TRUE),
  ('44444444-4444-4444-4444-444444444442', 'Daily Plan', 'ONE_TIME', 1440, 400.00, TRUE)
ON CONFLICT (id) DO UPDATE
SET
  name = EXCLUDED.name,
  billing_type = EXCLUDED.billing_type,
  duration_minutes = EXCLUDED.duration_minutes,
  price = EXCLUDED.price,
  active = EXCLUDED.active;

INSERT INTO bookings (id, user_id, locker_id, plan_id, total_amount, status, start_at, end_at, created_at)
VALUES
  (
    '55555555-5555-5555-5555-555555555551',
    '11111111-1111-1111-1111-111111111111',
    '33333333-3333-3333-3333-333333333331',
    '44444444-4444-4444-4444-444444444441',
    50.00,
    'PENDING',
    NOW() + INTERVAL '30 minutes',
    NOW() + INTERVAL '90 minutes',
    NOW()
  ),
  (
    '55555555-5555-5555-5555-555555555552',
    '11111111-1111-1111-1111-111111111111',
    '33333333-3333-3333-3333-333333333332',
    '44444444-4444-4444-4444-444444444442',
    400.00,
    'ACTIVE',
    NOW() - INTERVAL '20 minutes',
    NOW() + INTERVAL '23 hours 40 minutes',
    NOW()
  )
ON CONFLICT (id) DO UPDATE
SET
  user_id = EXCLUDED.user_id,
  locker_id = EXCLUDED.locker_id,
  plan_id = EXCLUDED.plan_id,
  total_amount = EXCLUDED.total_amount,
  status = EXCLUDED.status,
  start_at = EXCLUDED.start_at,
  end_at = EXCLUDED.end_at;

INSERT INTO devices (id, locker_id, nonce, created_at)
VALUES
  ('66666666-6666-6666-6666-666666666661', '33333333-3333-3333-3333-333333333331', 5, NOW()),
  ('66666666-6666-6666-6666-666666666662', '33333333-3333-3333-3333-333333333332', 9, NOW())
ON CONFLICT (id) DO UPDATE
SET
  locker_id = EXCLUDED.locker_id,
  nonce = EXCLUDED.nonce;

INSERT INTO access_grants (id, booking_id, user_id, locker_id, status, start_at, end_at)
VALUES
  (
    '77777777-7777-7777-7777-777777777771',
    '55555555-5555-5555-5555-555555555552',
    '11111111-1111-1111-1111-111111111111',
    '33333333-3333-3333-3333-333333333332',
    'ACTIVE',
    NOW() - INTERVAL '20 minutes',
    NOW() + INTERVAL '23 hours 40 minutes'
  )
ON CONFLICT (id) DO UPDATE
SET
  booking_id = EXCLUDED.booking_id,
  user_id = EXCLUDED.user_id,
  locker_id = EXCLUDED.locker_id,
  status = EXCLUDED.status,
  start_at = EXCLUDED.start_at,
  end_at = EXCLUDED.end_at;

INSERT INTO otp_challenges (id, user_id, locker_id, otp_hash, challenge_type, attempts, max_attempts, expires_at, used, created_at)
VALUES
  (
    '88888888-8888-8888-8888-888888888881',
    '11111111-1111-1111-1111-111111111111',
    '33333333-3333-3333-3333-333333333332',
    'dummy-hash-123456',
    'UNLOCK',
    1,
    3,
    NOW() + INTERVAL '5 minutes',
    FALSE,
    NOW()
  )
ON CONFLICT (id) DO UPDATE
SET
  user_id = EXCLUDED.user_id,
  locker_id = EXCLUDED.locker_id,
  otp_hash = EXCLUDED.otp_hash,
  challenge_type = EXCLUDED.challenge_type,
  attempts = EXCLUDED.attempts,
  max_attempts = EXCLUDED.max_attempts,
  expires_at = EXCLUDED.expires_at,
  used = EXCLUDED.used;

INSERT INTO payment_transactions (id, booking_id, locker_id, amount, currency, provider, provider_ref, status, created_at)
VALUES
  (
    '99999999-9999-9999-9999-999999999991',
    '55555555-5555-5555-5555-555555555552',
    '33333333-3333-3333-3333-333333333332',
    400.00,
    'BDT',
    'sslcommerz',
    'TXN-DEMO-0001',
    'SUCCESS',
    NOW()
  )
ON CONFLICT (id) DO UPDATE
SET
  booking_id = EXCLUDED.booking_id,
  locker_id = EXCLUDED.locker_id,
  amount = EXCLUDED.amount,
  currency = EXCLUDED.currency,
  provider = EXCLUDED.provider,
  provider_ref = EXCLUDED.provider_ref,
  status = EXCLUDED.status;

INSERT INTO biometric_enrollments (id, user_id, locker_id, device_id, template_hash, enrolled_at, created_at)
VALUES
  (
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1',
    '11111111-1111-1111-1111-111111111111',
    '33333333-3333-3333-3333-333333333332',
    '66666666-6666-6666-6666-666666666662',
    'template-hash-demo-user-001',
    NOW(),
    NOW()
  )
ON CONFLICT (id) DO UPDATE
SET
  user_id = EXCLUDED.user_id,
  locker_id = EXCLUDED.locker_id,
  device_id = EXCLUDED.device_id,
  template_hash = EXCLUDED.template_hash,
  enrolled_at = EXCLUDED.enrolled_at;

INSERT INTO door_events (id, locker_id, event_type, created_at)
VALUES
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb1', '33333333-3333-3333-3333-333333333332', 'DOOR_OPEN', NOW()),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb2', '33333333-3333-3333-3333-333333333332', 'DOOR_CLOSED', NOW())
ON CONFLICT (id) DO UPDATE
SET
  locker_id = EXCLUDED.locker_id,
  event_type = EXCLUDED.event_type;

INSERT INTO access_attempts (id, user_id, locker_id, device_id, method, result, reason, created_at)
VALUES
  (
    'cccccccc-cccc-cccc-cccc-ccccccccccc1',
    '11111111-1111-1111-1111-111111111111',
    '33333333-3333-3333-3333-333333333332',
    '66666666-6666-6666-6666-666666666662',
    'OTP',
    'ALLOW',
    'Valid grant and OTP verified',
    NOW()
  )
ON CONFLICT (id) DO UPDATE
SET
  user_id = EXCLUDED.user_id,
  locker_id = EXCLUDED.locker_id,
  device_id = EXCLUDED.device_id,
  method = EXCLUDED.method,
  result = EXCLUDED.result,
  reason = EXCLUDED.reason;

INSERT INTO device_telemetry (id, device_id, locker_id, payload, created_at)
VALUES
  (
    'dddddddd-dddd-dddd-dddd-ddddddddddd1',
    '66666666-6666-6666-6666-666666666662',
    '33333333-3333-3333-3333-333333333332',
    '{"battery":92,"temperature":30.5,"signal":"good","doorState":"closed"}'::jsonb,
    NOW()
  )
ON CONFLICT (id) DO UPDATE
SET
  device_id = EXCLUDED.device_id,
  locker_id = EXCLUDED.locker_id,
  payload = EXCLUDED.payload;

COMMIT;
