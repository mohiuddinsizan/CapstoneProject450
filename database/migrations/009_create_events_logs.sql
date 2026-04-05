CREATE TABLE IF NOT EXISTS door_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  locker_id UUID REFERENCES lockers(id),
  event_type VARCHAR(30),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS access_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  locker_id UUID REFERENCES lockers(id),
  device_id UUID REFERENCES devices(id),
  method VARCHAR(30),
  result VARCHAR(20),
  reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);