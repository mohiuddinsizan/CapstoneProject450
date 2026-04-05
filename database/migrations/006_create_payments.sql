CREATE TABLE IF NOT EXISTS payment_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID REFERENCES bookings(id),
  locker_id UUID REFERENCES lockers(id),
  amount DECIMAL(10,2),
  currency VARCHAR(10) DEFAULT 'BDT',
  provider VARCHAR(50),
  provider_ref VARCHAR(200),
  status VARCHAR(20),
  created_at TIMESTAMPTZ DEFAULT NOW()
);