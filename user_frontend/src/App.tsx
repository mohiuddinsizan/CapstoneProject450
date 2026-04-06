import React, { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Lock,
  MapPin,
  CreditCard,
  CalendarClock,
  LogOut,
  RefreshCw,
  ShieldCheck,
  Search,
  Wallet,
  ChevronRight,
  Building2,
  TimerReset,
  CheckCircle2,
  AlertTriangle,
  ScanLine,
  Fingerprint,
  Clock3,
  Sparkles,
  BadgeCheck,
  QrCode,
  Loader2,
} from 'lucide-react';

type Role = 'user' | 'ADMIN' | string;

type User = {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: Role;
  created_at?: string;
};

type Location = {
  id: string;
  name: string;
  building?: string | null;
  floor?: string | null;
};

type Locker = {
  id: string;
  location_id: string;
  locker_name: string;
  series?: string | null;
  status: string;
  firmware_version?: string | null;
  location_name?: string | null;
  building?: string | null;
  floor?: string | null;
};

type Plan = {
  id: string;
  name: string;
  billing_type?: string | null;
  duration_minutes: number;
  price: number | string;
  active: boolean;
};

type Booking = {
  id: string;
  user_id: string;
  locker_id: string;
  plan_id: string;
  total_amount: number | string;
  status: string;
  start_at?: string | null;
  end_at?: string | null;
  created_at?: string;
  locker_name?: string;
  locker_status?: string;
  plan_name?: string;
  duration_minutes?: number;
  price?: number | string;
};

type Payment = {
  id: string;
  booking_id: string;
  locker_id: string;
  amount: number | string;
  currency?: string;
  provider?: string;
  provider_ref?: string;
  status: string;
  created_at?: string;
};

type QuoteResult = {
  lockerId: string;
  planId: string;
  startAt: string;
  endAt: string;
  durationMinutes: number;
  totalAmount: number;
};

type AuthResponse = {
  accessToken: string;
  refreshToken?: string;
};

const API_BASE = 'http://localhost:3000';
const TOKEN_KEY = 'omnilock-access-token';
const REFRESH_KEY = 'omnilock-refresh-token';

async function request<T>(path: string, options: RequestInit = {}, token?: string): Promise<T> {
  const headers = new Headers(options.headers || {});
  headers.set('Content-Type', 'application/json');
  if (token) headers.set('Authorization', `Bearer ${token}`);

  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

  let data: any = null;
  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    throw new Error(data?.message || `Request failed with ${response.status}`);
  }

  return data as T;
}

const api = {
  register: (payload: { name: string; email: string; password: string; phone: string }) =>
    request<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  login: (payload: { email: string; password: string }) =>
    request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  me: (token: string) => request<{ user: User }>('/auth/me', {}, token),
  locations: (token: string) => request<{ locations: Location[] }>('/locations', {}, token),
  lockers: (token: string, locationId?: string, status?: string) => {
    const params = new URLSearchParams();
    if (locationId && locationId !== 'all') params.set('locationId', locationId);
    if (status && status !== 'all') params.set('status', status);
    const query = params.toString() ? `?${params.toString()}` : '';
    return request<{ lockers: Locker[] }>(`/lockers${query}`, {}, token);
  },
  plans: (token: string) => request<{ plans: Plan[] }>('/plans', {}, token),
  quote: (token: string, payload: { lockerId: string; planId: string; startAt: string }) =>
    request<QuoteResult>('/bookings/quote', {
      method: 'POST',
      body: JSON.stringify(payload),
    }, token),
  createBooking: (token: string, payload: { lockerId: string; planId: string; startAt: string }) =>
    request<{ booking: Booking }>('/bookings', {
      method: 'POST',
      body: JSON.stringify(payload),
    }, token),
  bookings: (token: string) => request<{ bookings: Booking[] }>('/bookings', {}, token),
  payments: (token: string) => request<{ payments: Payment[] }>('/payments/history', {}, token),
  checkout: (token: string, bookingId: string) =>
    request<{ payment: Payment; redirectUrl: string }>('/payments/checkout', {
      method: 'POST',
      body: JSON.stringify({ bookingId }),
    }, token),
  requestOtp: (token: string, lockerId: string) =>
    request<{ challengeId: string; expiresAt: string }>('/otp/request', {
      method: 'POST',
      body: JSON.stringify({ lockerId }),
    }, token),
  verifyOtp: (token: string, lockerId: string, otp: string) =>
    request<{ unlockToken: string; expiresIn: string }>('/otp/verify', {
      method: 'POST',
      body: JSON.stringify({ lockerId, otp }),
    }, token),
  requestEnrollmentOtp: (token: string, lockerId: string) =>
    request<{ challengeId: string; expiresAt: string }>('/otp/enrollment', {
      method: 'POST',
      body: JSON.stringify({ lockerId }),
    }, token),
  verifyEnrollmentOtp: (token: string, lockerId: string, otp: string) =>
    request<{ unlockToken: string; expiresIn: string }>('/otp/verify-enrollment', {
      method: 'POST',
      body: JSON.stringify({ lockerId, otp }),
    }, token),
  registerBiometric: (token: string, payload: { lockerId: string; deviceId?: string; templateHash: string }) =>
    request<{ enrollment: any }>('/biometric/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    }, token),
};

function money(value: number | string | undefined, currency = 'BDT') {
  const amount = Number(value || 0);
  return new Intl.NumberFormat('en-BD', {
    style: 'currency',
    currency,
    maximumFractionDigits: 2,
  }).format(amount);
}

function dateTimeLocalValue(date: Date) {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function minutesLabel(n: number) {
  if (n % 1440 === 0) return `${n / 1440} day`;
  if (n % 60 === 0) return `${n / 60} hr`;
  return `${n} min`;
}

function bookingPhase(status: string) {
  switch (status) {
    case 'ACTIVE':
      return { label: 'Ready for access', tone: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10' };
    case 'PENDING':
      return { label: 'Awaiting payment or activation', tone: 'text-amber-300 border-amber-500/30 bg-amber-500/10' };
    case 'COMPLETED':
      return { label: 'Completed', tone: 'text-slate-300 border-slate-500/30 bg-slate-500/10' };
    default:
      return { label: status, tone: 'text-slate-300 border-slate-500/30 bg-slate-500/10' };
  }
}

function lockerTone(status: string) {
  switch (status) {
    case 'AVAILABLE':
      return 'text-emerald-300 border-emerald-500/30 bg-emerald-500/10';
    case 'OCCUPIED':
      return 'text-rose-300 border-rose-500/30 bg-rose-500/10';
    case 'MAINTENANCE':
      return 'text-amber-300 border-amber-500/30 bg-amber-500/10';
    default:
      return 'text-slate-300 border-slate-500/30 bg-slate-500/10';
  }
}

function paymentTone(status: string) {
  switch (status) {
    case 'SUCCESS':
      return 'text-emerald-300 border-emerald-500/30 bg-emerald-500/10';
    case 'FAILED':
      return 'text-rose-300 border-rose-500/30 bg-rose-500/10';
    case 'PENDING':
      return 'text-amber-300 border-amber-500/30 bg-amber-500/10';
    default:
      return 'text-slate-300 border-slate-500/30 bg-slate-500/10';
  }
}

function ShellCard({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-[28px] border border-white/10 bg-white/[0.04] shadow-[0_20px_80px_rgba(0,0,0,0.35)] backdrop-blur-xl ${className}`}>
      {children}
    </div>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return <label className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">{children}</label>;
}

function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={`w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white placeholder:text-slate-500 outline-none transition focus:border-cyan-400/60 focus:bg-black/30 ${props.className || ''}`}
    />
  );
}

function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className={`w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-400/60 focus:bg-black/30 ${props.className || ''}`}
    />
  );
}

function PrimaryButton({ children, className = '', ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className={`inline-flex items-center justify-center rounded-2xl border border-cyan-400/40 bg-cyan-400/15 px-4 py-3 text-sm font-semibold text-cyan-100 transition hover:bg-cyan-400/20 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
    >
      {children}
    </button>
  );
}

function GhostButton({ children, className = '', ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className={`inline-flex items-center justify-center rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm font-semibold text-slate-200 transition hover:bg-white/[0.06] disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
    >
      {children}
    </button>
  );
}

function SectionTitle({ eyebrow, title, description }: { eyebrow: string; title: string; description?: string }) {
  return (
    <div className="space-y-2">
      <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-cyan-300">{eyebrow}</p>
      <h2 className="text-2xl font-bold tracking-tight text-white">{title}</h2>
      {description ? <p className="max-w-2xl text-sm text-slate-400">{description}</p> : null}
    </div>
  );
}

function Modal({
  open,
  onClose,
  title,
  description,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-md"
        >
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.98 }}
            className="w-full max-w-4xl rounded-[32px] border border-white/10 bg-[#0A1020] p-6 shadow-[0_30px_120px_rgba(0,0,0,0.55)]"
          >
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <h3 className="text-2xl font-bold text-white">{title}</h3>
                {description ? <p className="mt-1 text-sm text-slate-400">{description}</p> : null}
              </div>
              <GhostButton onClick={onClose}>Close</GhostButton>
            </div>
            {children}
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

export default function OmniLockUserFrontend() {
  const [token, setToken] = useState<string>(() => localStorage.getItem(TOKEN_KEY) || '');
  const [user, setUser] = useState<User | null>(null);
  const [locations, setLocations] = useState<Location[]>([]);
  const [lockers, setLockers] = useState<Locker[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [selectedLocationId, setSelectedLocationId] = useState<string>('all');
  const [selectedLockerId, setSelectedLockerId] = useState<string>('');
  const [selectedPlanId, setSelectedPlanId] = useState<string>('');
  const [search, setSearch] = useState('');
  const [startAt, setStartAt] = useState<string>(dateTimeLocalValue(new Date()));
  const [quote, setQuote] = useState<QuoteResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'discover' | 'bookings' | 'payments'>('discover');
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [authForm, setAuthForm] = useState({ name: '', email: '', phone: '', password: '' });
  const [paymentDialog, setPaymentDialog] = useState(false);
  const [checkoutResult, setCheckoutResult] = useState<{ payment: Payment; redirectUrl: string } | null>(null);
  const [accessDialog, setAccessDialog] = useState(false);
  const [accessBooking, setAccessBooking] = useState<Booking | null>(null);
  const [otpValue, setOtpValue] = useState('');
  const [unlockToken, setUnlockToken] = useState('');
  const [biometricHash, setBiometricHash] = useState('demo-biometric-template-hash');

  const selectedLocker = useMemo(
    () => lockers.find((item) => item.id === selectedLockerId) || null,
    [lockers, selectedLockerId]
  );

  const availableLockers = useMemo(() => {
    return lockers.filter((locker) => {
      const matchesLocation = selectedLocationId === 'all' || locker.location_id === selectedLocationId;
      const matchesSearch =
        locker.locker_name.toLowerCase().includes(search.toLowerCase()) ||
        (locker.location_name || '').toLowerCase().includes(search.toLowerCase()) ||
        (locker.building || '').toLowerCase().includes(search.toLowerCase());
      return matchesLocation && matchesSearch;
    });
  }, [lockers, selectedLocationId, search]);

  const activeBookings = useMemo(
    () => bookings.filter((b) => ['ACTIVE', 'PENDING'].includes(b.status)),
    [bookings]
  );

  function resetFeedback() {
    setError('');
    setSuccess('');
  }

  async function bootstrap(accessToken: string) {
    setLoading(true);
    resetFeedback();

    try {
      const me = await api.me(accessToken);
      setUser(me.user);

      const [locationsRes, lockersRes, plansRes, bookingsRes, paymentsRes] = await Promise.allSettled([
        api.locations(accessToken),
        api.lockers(accessToken),
        api.plans(accessToken),
        api.bookings(accessToken),
        api.payments(accessToken),
      ]);

      setLocations(locationsRes.status === 'fulfilled' ? locationsRes.value.locations : []);
      setLockers(lockersRes.status === 'fulfilled' ? lockersRes.value.lockers : []);
      setPlans(plansRes.status === 'fulfilled' ? plansRes.value.plans.filter((p) => p.active) : []);
      setBookings(bookingsRes.status === 'fulfilled' ? bookingsRes.value.bookings : []);
      setPayments(paymentsRes.status === 'fulfilled' ? paymentsRes.value.payments : []);
    } catch (err: any) {
      setUser(null);
      setError(err?.message || 'Failed to load account');
      localStorage.removeItem(TOKEN_KEY);
      setToken('');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (token) {
      localStorage.setItem(TOKEN_KEY, token);
      void bootstrap(token);
    }
  }, [token]);

  async function handleAuthSubmit() {
    setLoading(true);
    resetFeedback();

    try {
      const result =
        authMode === 'register'
          ? await api.register({
              name: authForm.name,
              email: authForm.email,
              phone: authForm.phone,
              password: authForm.password,
            })
          : await api.login({
              email: authForm.email,
              password: authForm.password,
            });

      setToken(result.accessToken);
      if (result.refreshToken) localStorage.setItem(REFRESH_KEY, result.refreshToken);
      setSuccess(authMode === 'register' ? 'Account created successfully.' : 'Signed in successfully.');
    } catch (err: any) {
      setError(err?.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  }

  function logout() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_KEY);
    setToken('');
    setUser(null);
    setLocations([]);
    setLockers([]);
    setPlans([]);
    setBookings([]);
    setPayments([]);
    setQuote(null);
    resetFeedback();
  }

  async function reloadData() {
    if (!token) return;
    await bootstrap(token);
  }

  async function handleQuote() {
    if (!token || !selectedLockerId || !selectedPlanId) return;
    setLoading(true);
    resetFeedback();

    try {
      const result = await api.quote(token, {
        lockerId: selectedLockerId,
        planId: selectedPlanId,
        startAt: new Date(startAt).toISOString(),
      });
      setQuote(result);
      setSuccess('Booking quote generated.');
    } catch (err: any) {
      setError(err?.message || 'Failed to generate quote');
    } finally {
      setLoading(false);
    }
  }

  async function handleBookingAndPayment() {
    if (!token || !selectedLockerId || !selectedPlanId) return;
    setLoading(true);
    resetFeedback();

    try {
      const created = await api.createBooking(token, {
        lockerId: selectedLockerId,
        planId: selectedPlanId,
        startAt: new Date(startAt).toISOString(),
      });
      const checkout = await api.checkout(token, created.booking.id);
      setCheckoutResult(checkout);
      setPaymentDialog(true);
      setSuccess('Locker booked. Complete payment to activate binding.');
      await reloadData();
      setActiveTab('bookings');
    } catch (err: any) {
      setError(err?.message || 'Failed to create booking');
    } finally {
      setLoading(false);
    }
  }

  function openAccessDialog(booking: Booking) {
    setAccessBooking(booking);
    setOtpValue('');
    setUnlockToken('');
    setBiometricHash('demo-biometric-template-hash');
    setAccessDialog(true);
  }

  async function handleOtpAccess() {
    if (!token || !accessBooking) return;
    setLoading(true);
    resetFeedback();

    try {
      await api.requestOtp(token, accessBooking.locker_id);
      const verified = await api.verifyOtp(token, accessBooking.locker_id, otpValue);
      setUnlockToken(verified.unlockToken);
      setSuccess('OTP validated. Locker device may now consume this access token.');
    } catch (err: any) {
      setError(err?.message || 'OTP verification failed');
    } finally {
      setLoading(false);
    }
  }

  async function handleBiometricEnrollment() {
    if (!token || !accessBooking) return;
    setLoading(true);
    resetFeedback();

    try {
      await api.requestEnrollmentOtp(token, accessBooking.locker_id);
      await api.verifyEnrollmentOtp(token, accessBooking.locker_id, otpValue);
      await api.registerBiometric(token, {
        lockerId: accessBooking.locker_id,
        templateHash: biometricHash,
      });
      setSuccess('Biometric profile bound to this locker access policy.');
    } catch (err: any) {
      setError(err?.message || 'Biometric enrollment failed');
    } finally {
      setLoading(false);
    }
  }

  const stats = [
    { label: 'Active locations', value: locations.length, icon: Building2 },
    { label: 'Available lockers', value: lockers.filter((l) => l.status === 'AVAILABLE').length, icon: Lock },
    { label: 'Current bindings', value: activeBookings.length, icon: BadgeCheck },
    { label: 'Payment records', value: payments.length, icon: Wallet },
  ];

  if (!token || !user) {
    return (
      <div className="min-h-screen overflow-hidden bg-[#050816] text-white">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.18),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(99,102,241,0.14),transparent_28%)]" />
        <div className="relative mx-auto grid min-h-screen max-w-7xl gap-10 px-6 py-8 lg:grid-cols-[1.15fr_0.85fr] lg:px-10">
          <div className="flex flex-col justify-between py-6">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-cyan-200">
                <Sparkles className="h-4 w-4" /> OmniLock Industrial Access
              </div>
              <h1 className="mt-6 max-w-3xl text-5xl font-black leading-[0.95] tracking-tight sm:text-6xl">
                Book on mobile.
                <span className="block text-slate-400">Operate on the locker device.</span>
              </h1>
              <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-400">
                The user app is only for discovery, booking, payment, locker binding, and OTP authorization. Physical open or close happens at the locker device after access validation.
              </p>
            </div>

            <div className="mt-10 grid gap-4 md:grid-cols-3">
              {[
                {
                  title: 'Book & bind',
                  text: 'Reserve locker, attach plan, and activate after payment.',
                  icon: CalendarClock,
                },
                {
                  title: 'Device OTP flow',
                  text: 'OTP is issued from mobile and consumed by the locker terminal.',
                  icon: QrCode,
                },
                {
                  title: 'Industrial UX',
                  text: 'Dark control-room aesthetic with clear state separation.',
                  icon: ShieldCheck,
                },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <ShellCard key={item.title} className="p-5">
                    <div className="mb-4 inline-flex rounded-2xl border border-white/10 bg-white/[0.04] p-3">
                      <Icon className="h-5 w-5 text-cyan-300" />
                    </div>
                    <p className="font-semibold text-white">{item.title}</p>
                    <p className="mt-2 text-sm leading-6 text-slate-400">{item.text}</p>
                  </ShellCard>
                );
              })}
            </div>
          </div>

          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="flex items-center">
            <ShellCard className="w-full p-6 sm:p-8">
              <div className="mb-8 flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">Access portal</p>
                  <h2 className="mt-1 text-3xl font-bold text-white">
                    {authMode === 'login' ? 'Operator sign in' : 'Create account'}
                  </h2>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3">
                  <Lock className="h-6 w-6 text-cyan-300" />
                </div>
              </div>

              {error ? (
                <div className="mb-4 rounded-2xl border border-rose-500/20 bg-rose-500/10 p-4 text-sm text-rose-200">{error}</div>
              ) : null}
              {success ? (
                <div className="mb-4 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-sm text-emerald-200">{success}</div>
              ) : null}

              <div className="space-y-4">
                {authMode === 'register' ? (
                  <div className="space-y-2">
                    <Label>Full name</Label>
                    <Input value={authForm.name} onChange={(e) => setAuthForm({ ...authForm, name: e.target.value })} placeholder="MD Mohi Uddin" />
                  </div>
                ) : null}

                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input type="email" value={authForm.email} onChange={(e) => setAuthForm({ ...authForm, email: e.target.value })} placeholder="you@example.com" />
                </div>

                {authMode === 'register' ? (
                  <div className="space-y-2">
                    <Label>Phone</Label>
                    <Input value={authForm.phone} onChange={(e) => setAuthForm({ ...authForm, phone: e.target.value })} placeholder="01XXXXXXXXX" />
                  </div>
                ) : null}

                <div className="space-y-2">
                  <Label>Password</Label>
                  <Input type="password" value={authForm.password} onChange={(e) => setAuthForm({ ...authForm, password: e.target.value })} placeholder="Enter password" />
                </div>
              </div>

              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <PrimaryButton className="w-full" disabled={loading} onClick={handleAuthSubmit}>
                  {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ChevronRight className="mr-2 h-4 w-4" />}
                  {authMode === 'login' ? 'Sign in' : 'Create account'}
                </PrimaryButton>
                <GhostButton className="w-full" onClick={() => setAuthMode(authMode === 'login' ? 'register' : 'login')}>
                  {authMode === 'login' ? 'Switch to register' : 'Switch to login'}
                </GhostButton>
              </div>
            </ShellCard>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050816] text-white">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.10),transparent_22%),radial-gradient(circle_at_80%_20%,rgba(99,102,241,0.10),transparent_18%),linear-gradient(to_bottom,rgba(255,255,255,0.02),transparent_25%)]" />

      <div className="relative mx-auto max-w-7xl px-4 py-4 md:px-8 md:py-8">
        <ShellCard className="mb-6 overflow-hidden">
          <div className="grid gap-6 p-6 lg:grid-cols-[1.4fr_0.8fr] lg:p-8">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-cyan-200">
                <ScanLine className="h-4 w-4" /> Industrial control surface
              </div>
              <h1 className="mt-5 text-4xl font-black tracking-tight text-white md:text-5xl">OmniLock Booking & Access Control</h1>
              <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-400 md:text-base">
                User mobile handles booking, plan binding, payment, and OTP issuance. Locker operations happen on the locker device after authentication. This UI reflects that exact product flow.
              </p>

              <div className="mt-8 grid gap-4 md:grid-cols-4">
                {stats.map((item) => {
                  const Icon = item.icon;
                  return (
                    <div key={item.label} className="rounded-[24px] border border-white/10 bg-black/20 p-4">
                      <div className="flex items-center justify-between">
                        <p className="text-xs uppercase tracking-[0.18em] text-slate-500">{item.label}</p>
                        <Icon className="h-4 w-4 text-cyan-300" />
                      </div>
                      <p className="mt-4 text-3xl font-black text-white">{item.value}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="rounded-[28px] border border-white/10 bg-black/20 p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Session</p>
                  <h2 className="mt-2 text-2xl font-bold text-white">{user.name}</h2>
                  <p className="mt-1 text-sm text-slate-400">{user.email}</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-3 py-2 text-sm font-semibold text-cyan-200">
                  {user.role}
                </div>
              </div>

              <div className="mt-6 space-y-3">
                <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-sm text-emerald-200">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="mt-0.5 h-4 w-4" />
                    <div>
                      <p className="font-semibold">Access logic corrected</p>
                      <p className="mt-1 text-emerald-100/80">Mobile app does not directly operate the lock. It authorizes access and the locker terminal performs open or close.</p>
                    </div>
                  </div>
                </div>
                <div className="rounded-2xl border border-cyan-500/20 bg-cyan-500/10 p-4 text-sm text-cyan-100">
                  <div className="flex items-start gap-3">
                    <TimerReset className="mt-0.5 h-4 w-4" />
                    <div>
                      <p className="font-semibold">User flow</p>
                      <p className="mt-1 text-cyan-100/80">Discover locker → choose plan → book → pay → bind → receive OTP → use at locker device.</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <GhostButton onClick={reloadData}><RefreshCw className="mr-2 h-4 w-4" /> Refresh</GhostButton>
                <GhostButton onClick={logout}><LogOut className="mr-2 h-4 w-4" /> Logout</GhostButton>
              </div>
            </div>
          </div>
        </ShellCard>

        {error ? (
          <div className="mb-6 rounded-2xl border border-rose-500/20 bg-rose-500/10 p-4 text-sm text-rose-200">{error}</div>
        ) : null}
        {success ? (
          <div className="mb-6 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-sm text-emerald-200">{success}</div>
        ) : null}

        <div className="mb-6 flex flex-wrap gap-3">
          {([
            ['discover', 'Discover & Book'],
            ['bookings', 'Bindings & Access'],
            ['payments', 'Payments'],
          ] as const).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`rounded-2xl px-5 py-3 text-sm font-semibold transition ${
                activeTab === key
                  ? 'border border-cyan-400/30 bg-cyan-400/15 text-cyan-100'
                  : 'border border-white/10 bg-white/[0.03] text-slate-300 hover:bg-white/[0.06]'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {activeTab === 'discover' ? (
          <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
            <ShellCard className="p-6">
              <SectionTitle
                eyebrow="Locker inventory"
                title="Find and bind a locker"
                description="Browse by location, filter inventory, and select the locker you want to bind to your booking plan."
              />

              <div className="mt-6 grid gap-4 md:grid-cols-[220px_1fr]">
                <div className="space-y-2">
                  <Label>Location</Label>
                  <Select value={selectedLocationId} onChange={(e) => setSelectedLocationId(e.target.value)}>
                    <option value="all">All locations</option>
                    {locations.map((location) => (
                      <option key={location.id} value={location.id}>{location.name}</option>
                    ))}
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Search inventory</Label>
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                    <Input className="pl-11" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Locker, location, building" />
                  </div>
                </div>
              </div>

              <div className="mt-6 grid gap-4 sm:grid-cols-2 2xl:grid-cols-3">
                {availableLockers.map((locker) => (
                  <button
                    key={locker.id}
                    onClick={() => setSelectedLockerId(locker.id)}
                    className={`group rounded-[28px] border p-5 text-left transition ${
                      selectedLockerId === locker.id
                        ? 'border-cyan-400/40 bg-cyan-400/10 shadow-[0_0_0_1px_rgba(34,211,238,0.18)]'
                        : 'border-white/10 bg-white/[0.03] hover:border-white/20 hover:bg-white/[0.05]'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-lg font-bold text-white">{locker.locker_name}</p>
                        <p className="mt-1 text-sm text-slate-400">{locker.location_name || 'Unknown location'}</p>
                      </div>
                      <span className={`rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] ${lockerTone(locker.status)}`}>
                        {locker.status}
                      </span>
                    </div>

                    <div className="my-5 h-px bg-white/10" />

                    <div className="grid gap-3 text-sm text-slate-400">
                      <div className="flex items-center gap-2"><Building2 className="h-4 w-4 text-slate-500" /> {locker.building || 'No building data'}</div>
                      <div className="flex items-center gap-2"><MapPin className="h-4 w-4 text-slate-500" /> Floor {locker.floor || '—'}</div>
                      <div className="flex items-center gap-2"><Lock className="h-4 w-4 text-slate-500" /> Series {locker.series || '—'}</div>
                    </div>
                  </button>
                ))}
                {availableLockers.length === 0 ? (
                  <div className="rounded-[28px] border border-dashed border-white/10 bg-white/[0.02] p-8 text-sm text-slate-500">
                    No lockers match the current filter.
                  </div>
                ) : null}
              </div>
            </ShellCard>

            <ShellCard className="p-6">
              <SectionTitle
                eyebrow="Booking engine"
                title="Reserve and activate"
                description="Mobile app creates the binding. Locker device executes the actual access after OTP verification."
              />

              <div className="mt-6 space-y-5">
                <div className="rounded-[24px] border border-white/10 bg-black/20 p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Selected locker</p>
                  {selectedLocker ? (
                    <div className="mt-3">
                      <p className="text-lg font-semibold text-white">{selectedLocker.locker_name}</p>
                      <p className="mt-1 text-sm text-slate-400">{selectedLocker.location_name || 'Unknown location'}</p>
                    </div>
                  ) : (
                    <p className="mt-3 text-sm text-slate-500">Pick a locker from the inventory grid.</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Plan</Label>
                  <Select value={selectedPlanId} onChange={(e) => setSelectedPlanId(e.target.value)}>
                    <option value="">Select plan</option>
                    {plans.map((plan) => (
                      <option key={plan.id} value={plan.id}>
                        {plan.name} · {minutesLabel(plan.duration_minutes)} · {money(plan.price)}
                      </option>
                    ))}
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Start time</Label>
                  <Input type="datetime-local" value={startAt} onChange={(e) => setStartAt(e.target.value)} />
                </div>

                {quote ? (
                  <div className="rounded-[24px] border border-cyan-500/20 bg-cyan-500/10 p-5">
                    <div className="flex items-center justify-between text-sm text-cyan-100">
                      <span>Total amount</span>
                      <span className="text-lg font-bold">{money(quote.totalAmount)}</span>
                    </div>
                    <div className="mt-3 flex items-center justify-between text-sm text-cyan-100/80">
                      <span>Duration</span>
                      <span>{minutesLabel(quote.durationMinutes)}</span>
                    </div>
                    <div className="mt-3 flex items-center justify-between text-sm text-cyan-100/80">
                      <span>Binding end</span>
                      <span>{new Date(quote.endAt).toLocaleString()}</span>
                    </div>
                  </div>
                ) : null}

                <div className="grid gap-3 sm:grid-cols-2">
                  <GhostButton onClick={handleQuote} disabled={!selectedLockerId || !selectedPlanId || loading}>
                    <Clock3 className="mr-2 h-4 w-4" /> Get quote
                  </GhostButton>
                  <PrimaryButton onClick={handleBookingAndPayment} disabled={!selectedLockerId || !selectedPlanId || loading}>
                    <CreditCard className="mr-2 h-4 w-4" /> Book & pay
                  </PrimaryButton>
                </div>

                <div className="rounded-[24px] border border-amber-500/20 bg-amber-500/10 p-4 text-sm text-amber-100">
                  <div className="flex gap-3">
                    <AlertTriangle className="mt-0.5 h-4 w-4" />
                    <p>
                      This screen does not open a locker directly. After booking and payment, the user receives access authorization. OTP is used on the locker terminal or paired locker device flow.
                    </p>
                  </div>
                </div>
              </div>
            </ShellCard>
          </div>
        ) : null}

        {activeTab === 'bookings' ? (
          <ShellCard className="p-6">
            <SectionTitle
              eyebrow="Access control"
              title="Bindings and locker access"
              description="Each booking represents a binding between user, plan, and locker. Access is authorized here but executed from the locker terminal."
            />

            <div className="mt-6 grid gap-4 xl:grid-cols-2">
              {bookings.map((booking) => {
                const phase = bookingPhase(booking.status);
                return (
                  <div key={booking.id} className="rounded-[28px] border border-white/10 bg-white/[0.03] p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-xl font-bold text-white">{booking.locker_name || 'Locker booking'}</p>
                        <p className="mt-1 text-sm text-slate-400">{booking.plan_name || booking.plan_id}</p>
                      </div>
                      <span className={`rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] ${phase.tone}`}>
                        {phase.label}
                      </span>
                    </div>

                    <div className="mt-5 grid gap-3 sm:grid-cols-2">
                      <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                        <p className="text-xs uppercase tracking-[0.16em] text-slate-500">Amount</p>
                        <p className="mt-2 font-semibold text-white">{money(booking.total_amount)}</p>
                      </div>
                      <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                        <p className="text-xs uppercase tracking-[0.16em] text-slate-500">Status</p>
                        <p className="mt-2 font-semibold text-white">{booking.status}</p>
                      </div>
                      <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                        <p className="text-xs uppercase tracking-[0.16em] text-slate-500">Start</p>
                        <p className="mt-2 text-sm text-slate-300">{booking.start_at ? new Date(booking.start_at).toLocaleString() : '—'}</p>
                      </div>
                      <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                        <p className="text-xs uppercase tracking-[0.16em] text-slate-500">End</p>
                        <p className="mt-2 text-sm text-slate-300">{booking.end_at ? new Date(booking.end_at).toLocaleString() : '—'}</p>
                      </div>
                    </div>

                    <div className="mt-5 rounded-[24px] border border-cyan-500/20 bg-cyan-500/10 p-4 text-sm text-cyan-100">
                      Access model: request OTP from mobile, then enter it on the locker device to receive physical access.
                    </div>

                    <div className="mt-5 flex flex-wrap gap-3">
                      <PrimaryButton onClick={() => openAccessDialog(booking)} disabled={!['ACTIVE', 'PENDING'].includes(booking.status)}>
                        <ShieldCheck className="mr-2 h-4 w-4" /> Authorize access
                      </PrimaryButton>
                    </div>
                  </div>
                );
              })}

              {bookings.length === 0 ? (
                <div className="rounded-[28px] border border-dashed border-white/10 bg-white/[0.02] p-8 text-sm text-slate-500">
                  No locker bindings yet.
                </div>
              ) : null}
            </div>
          </ShellCard>
        ) : null}

        {activeTab === 'payments' ? (
          <ShellCard className="p-6">
            <SectionTitle
              eyebrow="Finance"
              title="Payment history"
              description="Every checkout and provider response is shown here for audit and troubleshooting."
            />

            <div className="mt-6 space-y-4">
              {payments.map((payment) => (
                <div key={payment.id} className="flex flex-col gap-4 rounded-[28px] border border-white/10 bg-white/[0.03] p-5 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <p className="text-xl font-bold text-white">{money(payment.amount, payment.currency || 'BDT')}</p>
                    <p className="mt-1 text-sm text-slate-400">{payment.provider || 'Provider'} · {payment.provider_ref || '—'}</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-3">
                    <span className={`rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] ${paymentTone(payment.status)}`}>
                      {payment.status}
                    </span>
                    <span className="text-sm text-slate-400">{payment.created_at ? new Date(payment.created_at).toLocaleString() : '—'}</span>
                  </div>
                </div>
              ))}

              {payments.length === 0 ? (
                <div className="rounded-[28px] border border-dashed border-white/10 bg-white/[0.02] p-8 text-sm text-slate-500">
                  No payment records found.
                </div>
              ) : null}
            </div>
          </ShellCard>
        ) : null}
      </div>

      <Modal
        open={paymentDialog}
        onClose={() => setPaymentDialog(false)}
        title="Payment initialization"
        description="Payment is created here. Locker remains controlled by booking and access validation flow."
      >
        {checkoutResult ? (
          <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
            <div className="space-y-4 rounded-[28px] border border-white/10 bg-white/[0.03] p-5">
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Provider reference</p>
                <p className="mt-2 font-semibold text-white">{checkoutResult.payment.provider_ref || '—'}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Amount</p>
                <p className="mt-2 text-2xl font-bold text-white">{money(checkoutResult.payment.amount, checkoutResult.payment.currency || 'BDT')}</p>
              </div>
            </div>

            <div className="space-y-4">
              <textarea
                value={checkoutResult.redirectUrl}
                readOnly
                className="min-h-[160px] w-full rounded-[24px] border border-white/10 bg-black/20 p-4 text-sm text-slate-200 outline-none"
              />
              <div className="flex flex-wrap gap-3">
                <GhostButton onClick={() => setPaymentDialog(false)}>Close</GhostButton>
                <PrimaryButton onClick={() => window.open(checkoutResult.redirectUrl, '_blank', 'noopener,noreferrer')}>
                  <Wallet className="mr-2 h-4 w-4" /> Open checkout
                </PrimaryButton>
              </div>
            </div>
          </div>
        ) : null}
      </Modal>

      {/* <Modal
        open={accessDialog}
        onClose={() => setAccessDialog(false)}
        title="Locker device authorization"
        description="User app only issues the authorization. Locker terminal performs the actual open or close action."
      >
        <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="space-y-5 rounded-[28px] border border-white/10 bg-white/[0.03] p-5">
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Step 01</p>
              <h4 className="mt-2 text-xl font-bold text-white">Generate OTP for locker terminal</h4>
              <p className="mt-2 text-sm leading-6 text-slate-400">
                The app requests OTP authorization and produces a short-lived access token. The locker device validates it and handles the physical lock action.
              </p>
            </div>

            <div className="space-y-2">
              <Label>OTP code</Label>
              <Input value={otpValue} onChange={(e) => setOtpValue(e.target.value)} placeholder="Enter OTP issued to user" />
            </div>

            <PrimaryButton className="w-full" onClick={handleOtpAccess} disabled={loading || !accessBooking || !otpValue.trim()}>
              <QrCode className="mr-2 h-4 w-4" /> Validate OTP and issue access token
            </PrimaryButton>

            {unlockToken ? (
              <div className="rounded-[24px] border border-emerald-500/20 bg-emerald-500/10 p-4 text-sm text-emerald-100">
                <p className="font-semibold">Access token issued</p>
                <p className="mt-2 break-all text-emerald-50/90">{unlockToken}</p>
              </div>
            ) : null}
          </div>

          <div className="space-y-5 rounded-[28px] border border-white/10 bg-white/[0.03] p-5">
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Step 02</p>
              <h4 className="mt-2 text-xl font-bold text-white">Optional biometric enrollment</h4>
              <p className="mt-2 text-sm leading-6 text-slate-400">
                Enrollment is optional for repeat visits. It still requires OTP verification first, then stores the biometric template binding through the backend.
              </p>
            </div>

            <div className="space-y-2">
              <Label>Biometric template hash</Label>
              <Input value={biometricHash} onChange={(e) => setBiometricHash(e.target.value)} />
            </div>

            <GhostButton className="w-full" onClick={handleBiometricEnrollment} disabled={loading || !accessBooking || !otpValue.trim()}>
              <Fingerprint className="mr-2 h-4 w-4" /> Enroll biometric after OTP
            </GhostButton>

            <div className="rounded-[24px] border border-cyan-500/20 bg-cyan-500/10 p-4 text-sm text-cyan-100">
              Device-side logic remains separate. This app is for authorization and account-level binding only.
            </div>
          </div>
        </div>
      </Modal> */}
    </div>
  );
}
