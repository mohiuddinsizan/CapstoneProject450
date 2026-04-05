CREATE TABLE IF NOT EXISTS biometric_enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  locker_id UUID REFERENCES lockers(id),
  device_id UUID,
  template_hash TEXT NOT NULL,
  enrolled_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);