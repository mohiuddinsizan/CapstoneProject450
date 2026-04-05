CREATE TABLE IF NOT EXISTS locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  building VARCHAR(100),
  floor VARCHAR(20)
);

CREATE TABLE IF NOT EXISTS lockers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  location_id UUID REFERENCES locations(id),
  locker_name VARCHAR(50) NOT NULL,
  series VARCHAR(50),
  status VARCHAR(30) NOT NULL DEFAULT 'AVAILABLE',
  public_key TEXT,
  firmware_version VARCHAR(20),
  created_at TIMESTAMPTZ DEFAULT NOW()
);