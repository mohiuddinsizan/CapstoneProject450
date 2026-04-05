// @ts-nocheck
import { useEffect, useMemo, useState, type ChangeEvent } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  Activity,
  AlertTriangle,
  Bell,
  CreditCard,
  Lock,
  LogOut,
  Monitor,
  RefreshCw,
  Settings,
  ShieldCheck,
  Smartphone
} from 'lucide-react';
import { toast, Toaster } from 'sonner';
import {
  adminAudit,
  adminDevices,
  adminLockers,
  adminMaintenance,
  checkout,
  createBooking,
  getBookings,
  getLocations,
  getLockers,
  getMe,
  getPayments,
  listPlansMaybe,
  login,
  quoteBooking,
  register,
  requestOtp,
  verifyOtp
} from '@/lib/api';
import type { Booking, Location, Locker, Payment, Plan, User } from '@/lib/types';
import { ImageWithFallback } from './components/figma/ImageWithFallback';

type ViewMode = 'mobile' | 'tablet' | 'admin';

const tokenKey = 'omnilock-access-token';

function statusBadge(status: string) {
  if (status === 'AVAILABLE') return 'bg-emerald-100 text-emerald-700';
  if (status === 'OCCUPIED') return 'bg-rose-100 text-rose-700';
  if (status === 'MAINTENANCE') return 'bg-amber-100 text-amber-700';
  return 'bg-slate-100 text-slate-700';
}

export default function App() {
  const [viewMode, setViewMode] = useState<ViewMode>('mobile');
  const [token, setToken] = useState<string>(() => localStorage.getItem(tokenKey) || '');
  const [user, setUser] = useState<User | null>(null);
  const [lockers, setLockers] = useState<Locker[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [selectedLockerId, setSelectedLockerId] = useState('');
  const [selectedPlanId, setSelectedPlanId] = useState('');
  const [otpLockerId, setOtpLockerId] = useState('');
  const [otpValue, setOtpValue] = useState('');
  const [quote, setQuote] = useState<{ totalAmount: number; endAt: string; durationMinutes: number } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);

  const selectedLocker = useMemo(() => lockers.find((l: Locker) => l.id === selectedLockerId) || null, [lockers, selectedLockerId]);

  async function bootstrap(accessToken: string) {
    setIsLoading(true);
    try {
      const [me, loc, lock, b, p] = await Promise.all([
        getMe(accessToken),
        getLocations(accessToken),
        getLockers(accessToken),
        getBookings(accessToken),
        getPayments(accessToken)
      ]);

      setUser(me.user);
      setLocations(loc.locations);
      setLockers(lock.lockers);
      setBookings(b.bookings);
      setPayments(p.payments);

      try {
        const plansRes = await listPlansMaybe(accessToken);
        setPlans(plansRes.plans.filter((plan) => plan.active));
      } catch {
        setPlans([]);
      }
    } catch (error) {
      localStorage.removeItem(tokenKey);
      setToken('');
      setUser(null);
      toast.error(error instanceof Error ? error.message : 'Failed to load app');
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    if (token) {
      localStorage.setItem(tokenKey, token);
      void bootstrap(token);
    }
  }, [token]);

  async function onAuthSubmit() {
    setIsLoading(true);
    try {
      const authResponse = isRegistering
        ? await register({ name, email, password, phone })
        : await login({ email, password });
      setToken(authResponse.accessToken);
      toast.success(isRegistering ? 'Registration successful' : 'Logged in successfully');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Authentication failed');
    } finally {
      setIsLoading(false);
    }
  }

  function logout() {
    localStorage.removeItem(tokenKey);
    setToken('');
    setUser(null);
    setLockers([]);
    setLocations([]);
    setPlans([]);
    setBookings([]);
    setPayments([]);
  }

  async function handleQuote() {
    if (!token || !selectedLockerId || !selectedPlanId) return;
    try {
      const q = await quoteBooking(token, {
        lockerId: selectedLockerId,
        planId: selectedPlanId,
        startAt: new Date().toISOString()
      });
      setQuote(q);
      toast.success('Quote generated');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Quote failed');
    }
  }

  async function handleBooking() {
    if (!token || !selectedLockerId || !selectedPlanId) return;
    try {
      const created = await createBooking(token, {
        lockerId: selectedLockerId,
        planId: selectedPlanId,
        startAt: new Date().toISOString()
      });
      const payment = await checkout(token, created.booking.id);
      toast.success('Booking created. Redirecting to payment simulation.');
      window.open(payment.redirectUrl, '_blank', 'noopener,noreferrer');
      await bootstrap(token);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Booking failed');
    }
  }

  async function handleOtpRequest() {
    if (!token || !otpLockerId) return;
    try {
      const response = await requestOtp(token, otpLockerId);
      toast.success(`OTP sent. Expires at ${new Date(response.expiresAt).toLocaleTimeString()}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'OTP request failed');
    }
  }

  async function handleOtpVerify() {
    if (!token || !otpLockerId || !otpValue) return;
    try {
      const response = await verifyOtp(token, otpLockerId, otpValue);
      toast.success(`Unlock token ready: ${response.expiresIn}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'OTP verification failed');
    }
  }

  async function refreshAdminData() {
    if (!token) return;
    try {
      const [adminLockerRes, auditRes, devicesRes] = await Promise.all([
        adminLockers(token),
        adminAudit(token),
        adminDevices(token)
      ]);
      setLockers(adminLockerRes.lockers);
      toast.success(`Admin synced: ${auditRes.logs.length} logs, ${devicesRes.devices.length} devices`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Admin sync failed');
    }
  }

  async function toggleMaintenance(locker: Locker) {
    if (!token) return;
    const isMaintenance = locker.status === 'MAINTENANCE';
    try {
      await adminMaintenance(token, locker.id, !isMaintenance);
      toast.success(!isMaintenance ? 'Maintenance enabled' : 'Locker back to available');
      await refreshAdminData();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Maintenance update failed');
    }
  }

  if (!token || !user) {
    return (
      <div className="min-h-screen bg-[#FFFDF9] text-slate-900 flex items-center justify-center p-6">
        <Toaster richColors position="top-center" />
        <div className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-slate-200 p-8">
          <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mb-6 mx-auto">
            <Lock className="text-white" size={32} />
          </div>
          <h1 className="text-3xl font-black text-center">OMNILOCK</h1>
          <p className="text-slate-500 text-sm text-center mt-2 mb-8">Frontend synced to Capstone backend APIs.</p>

          {isRegistering && (
            <input className="w-full mb-3 p-3 rounded-xl border border-slate-200" placeholder="Full name" value={name} onChange={(e: ChangeEvent<HTMLInputElement>) => setName(e.target.value)} />
          )}
          <input className="w-full mb-3 p-3 rounded-xl border border-slate-200" placeholder="Email" value={email} onChange={(e: ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)} />
          {isRegistering && (
            <input className="w-full mb-3 p-3 rounded-xl border border-slate-200" placeholder="Phone" value={phone} onChange={(e: ChangeEvent<HTMLInputElement>) => setPhone(e.target.value)} />
          )}
          <input className="w-full mb-4 p-3 rounded-xl border border-slate-200" type="password" placeholder="Password" value={password} onChange={(e: ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)} />

          <button onClick={onAuthSubmit} disabled={isLoading} className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold">
            {isLoading ? 'Please wait...' : isRegistering ? 'Create account' : 'Sign in'}
          </button>
          <button onClick={() => setIsRegistering((v) => !v)} className="w-full mt-3 text-blue-700 text-sm">
            {isRegistering ? 'Have an account? Login' : 'No account? Register'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FFFDF9] text-slate-900 font-sans selection:bg-blue-100 p-4 md:p-8">
      <Toaster richColors position="top-center" />
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between gap-4 bg-white rounded-2xl p-4 border border-slate-200 shadow-sm mb-6">
          <div>
            <h1 className="font-black text-2xl">OMNILOCK</h1>
            <p className="text-sm text-slate-500">{user.name} • {user.role}</p>
          </div>
          <div className="flex items-center gap-2 bg-slate-50 p-1 rounded-full border border-slate-200">
            <button onClick={() => setViewMode('mobile')} className={`px-3 py-2 rounded-full text-sm ${viewMode === 'mobile' ? 'bg-blue-600 text-white' : ''}`}><Smartphone size={16} /></button>
            <button onClick={() => setViewMode('tablet')} className={`px-3 py-2 rounded-full text-sm ${viewMode === 'tablet' ? 'bg-blue-600 text-white' : ''}`}><Monitor size={16} /></button>
            <button onClick={() => setViewMode('admin')} className={`px-3 py-2 rounded-full text-sm ${viewMode === 'admin' ? 'bg-blue-600 text-white' : ''}`}><Settings size={16} /></button>
          </div>
          <button onClick={logout} className="px-4 py-2 rounded-xl border border-slate-200 flex items-center gap-2 text-sm"><LogOut size={16} /> Logout</button>
        </div>

        <AnimatePresence mode="wait">
          {viewMode === 'mobile' && (
            <motion.div key="mobile" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="grid lg:grid-cols-3 gap-4">
              <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200 overflow-hidden">
                <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                  <h2 className="font-bold">Locker Discovery</h2>
                  <button className="text-sm px-3 py-1 rounded-lg border border-slate-200" onClick={() => token && bootstrap(token)}><RefreshCw size={14} className="inline mr-1" /> Sync</button>
                </div>
                <div className="relative h-72 md:h-96">
                  <ImageWithFallback src="https://images.unsplash.com/photo-1690204704210-fb93da378980?q=80&w=1080" className="absolute inset-0 w-full h-full object-cover opacity-50" />
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-100/30 to-white/40" />
                  <div className="absolute inset-0 p-4 overflow-auto">
                    <div className="grid sm:grid-cols-2 gap-3">
                      {lockers.map((locker) => (
                        <button key={locker.id} onClick={() => setSelectedLockerId(locker.id)} className={`text-left p-3 rounded-xl border bg-white/90 ${selectedLockerId === locker.id ? 'ring-2 ring-blue-500' : 'border-slate-200'}`}>
                          <div className="flex items-center justify-between gap-2">
                            <p className="text-sm font-bold truncate">{locker.locker_name}</p>
                            <span className={`text-[10px] px-2 py-1 rounded-full font-bold ${statusBadge(locker.status)}`}>{locker.status}</span>
                          </div>
                          <p className="text-xs text-slate-500 mt-1 truncate">{locker.location_name || 'Unknown location'}</p>
                          <p className="text-[11px] text-slate-400 mt-1">{locker.id}</p>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="bg-white rounded-3xl border border-slate-200 p-4">
                  <h3 className="font-bold mb-2">Booking</h3>
                  <p className="text-xs text-slate-500 mb-3">Select locker and plan. Plans come from admin endpoint.</p>

                  <select className="w-full p-2 rounded-xl border border-slate-200 mb-2" value={selectedLockerId} onChange={(e: ChangeEvent<HTMLSelectElement>) => setSelectedLockerId(e.target.value)}>
                    <option value="">Select locker</option>
                    {lockers.filter((locker) => locker.status === 'AVAILABLE').map((locker) => (
                      <option key={locker.id} value={locker.id}>{locker.locker_name}</option>
                    ))}
                  </select>

                  <select className="w-full p-2 rounded-xl border border-slate-200 mb-2" value={selectedPlanId} onChange={(e: ChangeEvent<HTMLSelectElement>) => setSelectedPlanId(e.target.value)}>
                    <option value="">Select plan</option>
                    {plans.map((plan) => (
                      <option key={plan.id} value={plan.id}>{plan.name} • {plan.duration_minutes}m • ${Number(plan.price).toFixed(2)}</option>
                    ))}
                  </select>

                  {plans.length === 0 && (
                    <p className="text-[11px] text-amber-600 mb-2">No accessible plans. Use an ADMIN account or manually seed plans in DB.</p>
                  )}

                  <div className="flex gap-2">
                    <button onClick={handleQuote} className="flex-1 py-2 rounded-xl border border-slate-200 text-sm">Quote</button>
                    <button onClick={handleBooking} className="flex-1 py-2 rounded-xl bg-blue-600 text-white text-sm">Book + Pay</button>
                  </div>
                  {quote && <p className="text-xs mt-3 text-slate-600">Quote: ${quote.totalAmount.toFixed(2)} • Ends {new Date(quote.endAt).toLocaleString()}</p>}
                  {selectedLocker && <p className="text-[11px] text-slate-400 mt-2">Locker ID: {selectedLocker.id}</p>}
                </div>

                <div className="bg-white rounded-3xl border border-slate-200 p-4">
                  <h3 className="font-bold mb-2 flex items-center gap-2"><ShieldCheck size={16} /> OTP Unlock</h3>
                  <input className="w-full p-2 rounded-xl border border-slate-200 mb-2" placeholder="Locker UUID" value={otpLockerId} onChange={(e: ChangeEvent<HTMLInputElement>) => setOtpLockerId(e.target.value)} />
                  <input className="w-full p-2 rounded-xl border border-slate-200 mb-2" placeholder="6-digit OTP" value={otpValue} onChange={(e: ChangeEvent<HTMLInputElement>) => setOtpValue(e.target.value)} />
                  <div className="flex gap-2">
                    <button onClick={handleOtpRequest} className="flex-1 py-2 rounded-xl border border-slate-200 text-sm">Request</button>
                    <button onClick={handleOtpVerify} className="flex-1 py-2 rounded-xl bg-emerald-600 text-white text-sm">Verify</button>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-3 grid md:grid-cols-3 gap-4">
                <div className="bg-white rounded-2xl border border-slate-200 p-4">
                  <h4 className="font-semibold mb-2 flex items-center gap-2"><Bell size={14} /> Locations ({locations.length})</h4>
                  <ul className="space-y-2 max-h-52 overflow-auto text-sm">
                    {locations.map((location) => (
                      <li key={location.id} className="p-2 bg-slate-50 rounded-lg">{location.name}</li>
                    ))}
                  </ul>
                </div>
                <div className="bg-white rounded-2xl border border-slate-200 p-4 md:col-span-2">
                  <h4 className="font-semibold mb-2 flex items-center gap-2"><CreditCard size={14} /> Bookings & Payments</h4>
                  <div className="grid md:grid-cols-2 gap-3">
                    <div>
                      <p className="text-xs text-slate-500 mb-2">Bookings ({bookings.length})</p>
                      <ul className="space-y-2 max-h-52 overflow-auto text-sm">
                        {bookings.map((booking) => (
                          <li key={booking.id} className="p-2 bg-slate-50 rounded-lg">
                            <p className="font-medium">{booking.plan_name || booking.plan_id}</p>
                            <p className="text-xs text-slate-500">{booking.status} • {booking.id.slice(0, 8)}</p>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 mb-2">Payments ({payments.length})</p>
                      <ul className="space-y-2 max-h-52 overflow-auto text-sm">
                        {payments.map((payment) => (
                          <li key={payment.id} className="p-2 bg-slate-50 rounded-lg">
                            <p className="font-medium">{payment.status} • ${Number(payment.amount).toFixed(2)}</p>
                            <p className="text-xs text-slate-500">{payment.provider_ref}</p>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {viewMode === 'tablet' && (
            <motion.div key="tablet" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white rounded-3xl border border-slate-200 p-8 text-center">
              <Monitor size={42} className="mx-auto mb-3 text-blue-600" />
              <h2 className="font-black text-2xl">Locker Tablet Mode</h2>
              <p className="text-slate-500 mt-2">UI pattern is preserved. Device decisions are handled by backend route /access/decision (device-auth protected).</p>
            </motion.div>
          )}

          {viewMode === 'admin' && (
            <motion.div key="admin" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white rounded-3xl border border-slate-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-black text-2xl flex items-center gap-2"><Activity size={22} /> Admin Dashboard</h2>
                <button onClick={refreshAdminData} className="px-3 py-2 rounded-xl border border-slate-200 text-sm"><RefreshCw size={14} className="inline mr-1" /> Refresh</button>
              </div>

              {user.role !== 'ADMIN' ? (
                <div className="p-4 rounded-2xl border border-amber-200 bg-amber-50 text-amber-700 text-sm flex items-start gap-2">
                  <AlertTriangle size={18} />
                  <div>
                    <p className="font-semibold">Admin token required</p>
                    <p>Login with an account where `role = ADMIN` to use admin endpoints.</p>
                  </div>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="border border-slate-200 rounded-2xl p-4">
                    <h3 className="font-semibold mb-2">Locker Operations</h3>
                    <ul className="space-y-2 max-h-96 overflow-auto">
                      {lockers.map((locker) => (
                        <li key={locker.id} className="p-3 bg-slate-50 rounded-xl flex items-center justify-between gap-2">
                          <div>
                            <p className="font-medium text-sm">{locker.locker_name}</p>
                            <p className="text-xs text-slate-500">{locker.status}</p>
                          </div>
                          <button onClick={() => toggleMaintenance(locker)} className="text-xs px-3 py-1 rounded-full bg-slate-900 text-white">
                            {locker.status === 'MAINTENANCE' ? 'Set AVAILABLE' : 'Set MAINTENANCE'}
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="border border-slate-200 rounded-2xl p-4">
                    <h3 className="font-semibold mb-2">Backend Sync Status</h3>
                    <p className="text-sm text-slate-600 mb-2">This frontend consumes:</p>
                    <ul className="text-sm text-slate-600 list-disc ml-5 space-y-1">
                      <li>/auth/*</li>
                      <li>/locations, /lockers</li>
                      <li>/bookings/*</li>
                      <li>/payments/*</li>
                      <li>/otp/*</li>
                      <li>/admin/*</li>
                    </ul>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
