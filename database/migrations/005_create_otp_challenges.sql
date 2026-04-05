CREATE TABLE IF NOT EXISTS otp_challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  locker_id UUID REFERENCES lockers(id),
  otp_hash TEXT NOT NULL,
  challenge_type VARCHAR(30),
  attempts INTEGER DEFAULT 0,
  max_attempts INTEGER DEFAULT 3,
  expires_at TIMESTAMPTZ NOT NULL,
  used BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);