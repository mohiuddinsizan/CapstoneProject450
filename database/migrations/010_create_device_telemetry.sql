CREATE TABLE IF NOT EXISTS device_telemetry (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  device_id UUID REFERENCES devices(id),
  locker_id UUID REFERENCES lockers(id),
  payload JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);