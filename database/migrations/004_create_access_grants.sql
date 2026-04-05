CREATE TABLE IF NOT EXISTS access_grants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID REFERENCES bookings(id),
  user_id UUID REFERENCES users(id),
  locker_id UUID REFERENCES lockers(id),
  status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
  start_at TIMESTAMPTZ,
  end_at TIMESTAMPTZ
);