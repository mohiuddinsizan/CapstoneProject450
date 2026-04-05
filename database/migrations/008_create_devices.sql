CREATE TABLE IF NOT EXISTS devices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  locker_id UUID REFERENCES lockers(id),
  nonce BIGINT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE biometric_enrollments
  ADD CONSTRAINT fk_biometric_device
  FOREIGN KEY (device_id) REFERENCES devices(id);