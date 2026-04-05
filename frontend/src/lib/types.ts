export type UserRole = 'user' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  role: UserRole;
  created_at: string;
}

export interface Location {
  id: string;
  name: string;
  building: string | null;
  floor: string | null;
  latitude?: number | null;
  longitude?: number | null;
}

export interface Locker {
  id: string;
  location_id: string | null;
  locker_name: string;
  series: string | null;
  status: string;
  firmware_version?: string | null;
  location_name?: string | null;
  building?: string | null;
  floor?: string | null;
  latitude?: number | null;
  longitude?: number | null;
}

export interface Plan {
  id: string;
  name: string;
  billing_type: string | null;
  duration_minutes: number;
  price: number;
  active: boolean;
}

export interface Booking {
  id: string;
  user_id: string;
  locker_id: string;
  plan_id: string;
  total_amount: number;
  status: string;
  start_at: string;
  end_at: string;
  created_at: string;
  locker_name?: string;
  locker_status?: string;
  plan_name?: string;
  duration_minutes?: number;
  price?: number;
}

export interface Payment {
  id: string;
  booking_id: string;
  locker_id: string;
  amount: number;
  currency: string;
  provider: string;
  provider_ref: string;
  status: string;
  created_at: string;
}

export interface ApiError {
  message: string;
}
