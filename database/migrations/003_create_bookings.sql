CREATE TABLE IF NOT EXISTS subscription_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  billing_type VARCHAR(30),
  duration_minutes INTEGER NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  active BOOLEAN DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  locker_id UUID REFERENCES lockers(id),
  plan_id UUID REFERENCES subscription_plans(id),
  total_amount DECIMAL(10,2),
  status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
  start_at TIMESTAMPTZ,
  end_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);CREATE TABLE IF NOT EXISTS subscription_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  billing_type VARCHAR(30),
  duration_minutes INTEGER NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  active BOOLEAN DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  locker_id UUID REFERENCES lockers(id),
  plan_id UUID REFERENCES subscription_plans(id),
  total_amount DECIMAL(10,2),
  status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
  start_at TIMESTAMPTZ,
  end_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);