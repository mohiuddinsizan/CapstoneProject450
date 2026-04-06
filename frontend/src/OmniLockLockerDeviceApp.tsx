import { useEffect, useMemo, useState } from 'react';
import { CheckCircle2, Fingerprint, KeyRound, Lock, MapPin, RefreshCw, ShieldCheck, UserCog } from 'lucide-react';

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

type Booking = {
  id: string;
  locker_id: string;
  status: string;
  end_at?: string | null;
  locker_name?: string;
};

type AuthResponse = {
  accessToken: string;
  refreshToken?: string;
};

type MeResponse = {
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
};

const API_BASE = import.meta.env.VITE_API_BASE || 'https://capstoneproject450.onrender.com';
const DEMO_OTP = '0000';
const KIOSK_TOKEN_KEY = 'omnilock-kiosk-token';
const KIOSK_USER_KEY = 'omnilock-kiosk-user';
const KIOSK_LOCATION_KEY = 'omnilock-kiosk-location-id';

async function request<T>(path: string, options: RequestInit = {}, token?: string): Promise<T> {
  const headers = new Headers(options.headers || {});
  headers.set('Content-Type', 'application/json');
  if (token) headers.set('Authorization', `Bearer ${token}`);

  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error((data as any)?.message || `Request failed with ${response.status}`);
  return data as T;
}

const api = {
  login: (email: string, password: string) =>
    request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),
  me: (token: string) => request<MeResponse>('/auth/me', {}, token),
  getLocations: (token: string) => request<{ locations: Array<{ id: string; name: string; building?: string | null; floor?: string | null }> }>('/locations', {}, token),
  getLockers: (token: string, locationId?: string) => {
    const query = locationId ? `?locationId=${encodeURIComponent(locationId)}` : '';
    return request<{ lockers: Locker[] }>(`/lockers${query}`, {}, token);
  },
  getBookings: (token: string) => request<{ bookings: Booking[] }>('/bookings', {}, token),
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
  registerBiometric: (token: string, lockerId: string, templateHash: string) =>
    request<{ enrollment: unknown }>('/biometric/register', {
      method: 'POST',
      body: JSON.stringify({ lockerId, templateHash }),
    }, token),
};

function statusClass(status: string) {
  switch (status) {
    case 'AVAILABLE':
      return 'bg-emerald-100 text-emerald-700 border-emerald-200';
    case 'OCCUPIED':
      return 'bg-rose-100 text-rose-700 border-rose-200';
    case 'MAINTENANCE':
      return 'bg-amber-100 text-amber-700 border-amber-200';
    default:
      return 'bg-slate-100 text-slate-700 border-slate-200';
  }
}

export default function OmniLockLockerDeviceApp() {
  const [token, setToken] = useState(() => localStorage.getItem(KIOSK_TOKEN_KEY) || '');
  const [userName, setUserName] = useState(() => {
    try {
      const raw = localStorage.getItem(KIOSK_USER_KEY);
      return raw ? JSON.parse(raw).name || '' : '';
    } catch {
      return '';
    }
  });
  const [showLoginModal, setShowLoginModal] = useState(() => !localStorage.getItem(KIOSK_TOKEN_KEY));
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [locations, setLocations] = useState<Array<{ id: string; name: string; building?: string | null; floor?: string | null }>>([]);
  const [selectedLocationId, setSelectedLocationId] = useState(() => localStorage.getItem(KIOSK_LOCATION_KEY) || '');
  const [lockers, setLockers] = useState<Locker[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [selectedLocker, setSelectedLocker] = useState<Locker | null>(null);
  const [otp, setOtp] = useState(DEMO_OTP);
  const [templateHash, setTemplateHash] = useState('demo-biometric-template-hash');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function loadData(activeToken?: string, forcedLocationId?: string) {
    const tokenToUse = activeToken || token;
    if (!tokenToUse) {
      setError('Login first.');
      return;
    }

    setLoading(true);
    setError('');
    setMessage('');

    try {
      const locationsRes = await api.getLocations(tokenToUse);
      setLocations(locationsRes.locations);

      const locationIdToUse = forcedLocationId || selectedLocationId || locationsRes.locations[0]?.id || '';
      if (!locationIdToUse) {
        setLockers([]);
        setBookings([]);
        return;
      }

      if (locationIdToUse !== selectedLocationId) {
        setSelectedLocationId(locationIdToUse);
      }
      localStorage.setItem(KIOSK_LOCATION_KEY, locationIdToUse);

      const [lockerRes, bookingRes] = await Promise.all([
        api.getLockers(tokenToUse, locationIdToUse),
        api.getBookings(tokenToUse),
      ]);

      setLockers(lockerRes.lockers);
      setBookings(bookingRes.bookings);

      if (selectedLocker && selectedLocker.location_id !== locationIdToUse) {
        setSelectedLocker(null);
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to load lockers');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (token) {
      void loadData(token);
    }
  }, [token]);

  useEffect(() => {
    if (token && selectedLocationId) {
      localStorage.setItem(KIOSK_LOCATION_KEY, selectedLocationId);
      void loadData(token, selectedLocationId);
    }
  }, [selectedLocationId]);

  const activeBookingByLocker = useMemo(() => {
    const map = new Map<string, Booking>();
    bookings.forEach((booking) => {
      const notExpired = !booking.end_at || new Date(booking.end_at).getTime() > Date.now();
      if (['ACTIVE', 'PENDING'].includes(booking.status) && notExpired) {
        map.set(booking.locker_id, booking);
      }
    });
    return map;
  }, [bookings]);

  const selectedLocation = useMemo(
    () => locations.find((item) => item.id === selectedLocationId) || null,
    [locations, selectedLocationId]
  );

  async function handleLogin() {
    setLoading(true);
    setError('');
    setMessage('');
    try {
      const auth = await api.login(loginEmail, loginPassword);
      const me = await api.me(auth.accessToken);
      localStorage.setItem(KIOSK_TOKEN_KEY, auth.accessToken);
      localStorage.setItem(KIOSK_USER_KEY, JSON.stringify(me.user));
      setToken(auth.accessToken);
      setUserName(me.user.name);
      setShowLoginModal(false);
      setMessage(`Logged in as ${me.user.name}`);
      await loadData(auth.accessToken);
    } catch (err: any) {
      setError(err?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  }

  function clearSavedSession() {
    localStorage.removeItem(KIOSK_TOKEN_KEY);
    localStorage.removeItem(KIOSK_USER_KEY);
    localStorage.removeItem(KIOSK_LOCATION_KEY);
    setToken('');
    setUserName('');
    setLocations([]);
    setSelectedLocationId('');
    setLockers([]);
    setBookings([]);
    setSelectedLocker(null);
    setMessage('Saved session cleared.');
    setError('');
    setShowLoginModal(true);
  }

  async function handleOtpUnlock() {
    if (!selectedLocker || !token) return;
    setLoading(true);
    setError('');
    setMessage('');
    try {
      await api.requestOtp(token, selectedLocker.id);
      const verified = await api.verifyOtp(token, selectedLocker.id, otp || DEMO_OTP);
      setMessage(`Locker unlocked. Token valid for ${verified.expiresIn}`);
    } catch (err: any) {
      setError(err?.message || 'OTP unlock failed');
    } finally {
      setLoading(false);
    }
  }

  async function handleBiometricRegister() {
    if (!selectedLocker || !token) return;
    setLoading(true);
    setError('');
    setMessage('');
    try {
      await api.requestEnrollmentOtp(token, selectedLocker.id);
      await api.verifyEnrollmentOtp(token, selectedLocker.id, DEMO_OTP);
      await api.registerBiometric(token, selectedLocker.id, templateHash);
      setMessage('Biometric registration successful');
    } catch (err: any) {
      setError(err?.message || 'Biometric registration failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 rounded-3xl border border-slate-800 bg-slate-900 p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-white/10 p-3">
                <Lock className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-2xl font-black">OmniLock Locker Device</h1>
                <p className="text-sm text-slate-400">This screen only operates lockers from one selected location.</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => setShowLoginModal(true)}
                className="rounded-2xl border border-slate-700 px-4 py-3 text-sm font-semibold hover:bg-white/5"
              >
                <UserCog className="mr-2 inline h-4 w-4" />
                {token ? 'Change login' : 'Login'}
              </button>
              <button
                onClick={() => loadData()}
                className="rounded-2xl border border-slate-700 px-4 py-3 text-sm font-semibold hover:bg-white/5"
              >
                <RefreshCw className="mr-2 inline h-4 w-4" />
                Reload data
              </button>
              <button
                onClick={clearSavedSession}
                className="rounded-2xl border border-slate-700 px-4 py-3 text-sm font-semibold hover:bg-white/5"
              >
                Clear session
              </button>
            </div>
          </div>

          <div className="mt-5 grid gap-4 lg:grid-cols-[1fr_320px]">
            <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
              <div className="flex items-center gap-2 text-sm text-slate-400">
                <MapPin className="h-4 w-4" />
                <span>Active device location</span>
              </div>
              <div className="mt-3">
                <select
                  value={selectedLocationId}
                  onChange={(e) => setSelectedLocationId(e.target.value)}
                  className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm outline-none"
                >
                  <option value="">Select a location</option>
                  {locations.map((location) => (
                    <option key={location.id} value={location.id}>
                      {location.name}{location.building ? ` · ${location.building}` : ''}{location.floor ? ` · Floor ${location.floor}` : ''}
                    </option>
                  ))}
                </select>
              </div>
              {selectedLocation && (
                <p className="mt-3 text-sm text-slate-300">
                  Showing lockers for <span className="font-semibold">{selectedLocation.name}</span>
                  {selectedLocation.building ? ` · ${selectedLocation.building}` : ''}
                  {selectedLocation.floor ? ` · Floor ${selectedLocation.floor}` : ''}
                </p>
              )}
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4 text-sm text-slate-400">
              {token ? `Logged in as: ${userName || 'Saved user'}` : 'No saved session'}
            </div>
          </div>
        </div>

        {error && <div className="mb-4 rounded-2xl border border-rose-700 bg-rose-950/40 p-4 text-rose-200">{error}</div>}
        {message && <div className="mb-4 rounded-2xl border border-emerald-700 bg-emerald-950/40 p-4 text-emerald-200">{message}</div>}

        <div className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
          <div className="rounded-3xl border border-slate-800 bg-slate-900 p-5">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold">Locker grid</h2>
                <p className="text-sm text-slate-400">
                  {selectedLocation ? `Only lockers from ${selectedLocation.name} are shown here.` : 'Select a location first.'}
                </p>
              </div>
              <div className="text-sm text-slate-500">{loading ? 'Loading...' : `${lockers.length} lockers`}</div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {lockers.map((locker) => {
                const booking = activeBookingByLocker.get(locker.id);
                const accessReady = Boolean(booking);
                return (
                  <button
                    key={locker.id}
                    onClick={() => {
                      setSelectedLocker(locker);
                      setOtp(DEMO_OTP);
                      setMessage('');
                      setError('');
                    }}
                    className={`rounded-3xl border p-4 text-left transition hover:-translate-y-0.5 ${selectedLocker?.id === locker.id ? 'border-white bg-slate-800' : 'border-slate-800 bg-slate-950/60'}`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-lg font-bold">{locker.locker_name}</p>
                        <p className="text-sm text-slate-400">{locker.location_name || selectedLocation?.name || 'Unknown location'}</p>
                      </div>
                      <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${statusClass(locker.status)}`}>{locker.status}</span>
                    </div>

                    <div className="mt-4 space-y-1 text-sm text-slate-300">
                      <p>Building: {locker.building || selectedLocation?.building || '—'}</p>
                      <p>Floor: {locker.floor || selectedLocation?.floor || '—'}</p>
                      <p>Series: {locker.series || '—'}</p>
                    </div>

                    <div className="mt-4 flex items-center justify-between rounded-2xl bg-white/5 px-3 py-2 text-sm">
                      <span>{accessReady ? 'Booked / checked-in' : 'No active booking'}</span>
                      {accessReady ? <CheckCircle2 className="h-4 w-4 text-emerald-400" /> : <KeyRound className="h-4 w-4 text-slate-500" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="rounded-3xl border border-slate-800 bg-slate-900 p-5">
            <h2 className="text-xl font-bold">Access panel</h2>
            <p className="mt-1 text-sm text-slate-400">Selected location only. OTP unlock first. Biometric registration optional.</p>

            <div className="mt-5 rounded-3xl border border-slate-800 bg-slate-950/60 p-4">
              {selectedLocker ? (
                <>
                  <p className="text-lg font-bold">{selectedLocker.locker_name}</p>
                  <p className="text-sm text-slate-400">{selectedLocker.location_name || selectedLocation?.name || 'Unknown location'}</p>
                  <div className="mt-3 inline-flex rounded-full border border-slate-700 px-3 py-1 text-xs text-slate-300">
                    {activeBookingByLocker.get(selectedLocker.id) ? 'Access eligible' : 'No active booking found'}
                  </div>
                </>
              ) : (
                <p className="text-sm text-slate-400">Select a locker from the chosen location.</p>
              )}
            </div>

            <div className="mt-5 space-y-5">
              <div className="rounded-3xl border border-slate-800 p-4">
                <div className="mb-3 flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5" />
                  <h3 className="font-semibold">OTP unlock</h3>
                </div>
                <input
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm outline-none"
                  placeholder="Enter OTP"
                />
                <p className="mt-2 text-xs text-slate-500">Demo value is fixed to 0000.</p>
                <button
                  onClick={handleOtpUnlock}
                  disabled={!selectedLocker || !activeBookingByLocker.get(selectedLocker.id) || loading}
                  className="mt-4 w-full rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-slate-900 disabled:opacity-40"
                >
                  Unlock via OTP
                </button>
              </div>

              <div className="rounded-3xl border border-slate-800 p-4">
                <div className="mb-3 flex items-center gap-2">
                  <Fingerprint className="h-5 w-5" />
                  <h3 className="font-semibold">Biometric registration</h3>
                </div>
                <input
                  value={templateHash}
                  onChange={(e) => setTemplateHash(e.target.value)}
                  className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm outline-none"
                  placeholder="Biometric template hash"
                />
                <button
                  onClick={handleBiometricRegister}
                  disabled={!selectedLocker || !activeBookingByLocker.get(selectedLocker.id) || loading}
                  className="mt-4 w-full rounded-2xl border border-slate-700 px-4 py-3 text-sm font-semibold disabled:opacity-40"
                >
                  Register biometric
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showLoginModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-md rounded-[2rem] border border-slate-800 bg-slate-900 p-6 shadow-2xl">
            <div className="mb-5 flex items-center gap-3">
              <div className="rounded-2xl bg-white/10 p-3">
                <UserCog className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold">Device login</h3>
                <p className="text-sm text-slate-400">Login once, then bind this screen to one location.</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm text-slate-300">Email</label>
                <input
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm outline-none"
                  placeholder="Enter email"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm text-slate-300">Password</label>
                <input
                  type="password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm outline-none"
                  placeholder="Enter password"
                />
              </div>
            </div>

            <div className="mt-5 flex gap-3">
              <button
                onClick={handleLogin}
                disabled={loading}
                className="flex-1 rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-slate-900 disabled:opacity-40"
              >
                {loading ? 'Signing in...' : 'Login'}
              </button>
              <button
                onClick={() => setShowLoginModal(false)}
                className="rounded-2xl border border-slate-700 px-4 py-3 text-sm font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
