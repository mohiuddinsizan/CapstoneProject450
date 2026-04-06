import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { toast, Toaster } from 'sonner';
import { Bell, Search, ShieldCheck, User as UserIcon } from 'lucide-react';
import {
  adminCreateLocation,
  adminCreatePlan,
  adminDevices,
  adminLockers,
  adminAudit,
  adminMaintenance,
  adminSubscriptionPlans,
  adminUnlock,
  adminUpdateLocker,
  deviceAccessDecision,
  deviceEvent,
  deviceTelemetry,
  checkout,
  createBooking,
  extendSubscription,
  getBookings,
  getBookingDetails,
  getLockerDetails,
  getLocations,
  getLockers,
  getMe,
  getPayments,
  getPlans,
  login,
  quoteBooking,
  refreshToken,
  register,
  registerBiometric,
  requestEnrollmentOtp,
  requestOtp,
  verifyEnrollmentOtp,
  verifyOtp
} from '@/lib/api';
import type { Booking, Location, Locker, Payment, Plan, User } from '@/lib/types';
import { AdminPanel } from './components/admin/AdminPanel';
import { AuthPanel } from './components/auth/AuthPanel';
import { type ViewMode } from './components/layout/ModeSwitcher';
import { BookingPanel } from './components/mobile/BookingPanel';
import { DataPanels } from './components/mobile/DataPanels';
import { DiscoveryPanel } from './components/mobile/DiscoveryPanel';
import { OtpAndBiometricPanel } from './components/mobile/OtpAndBiometricPanel';
import { PageShell } from './components/shared/PageShell';
import { TabletPanel } from './components/tablet/TabletPanel';
import * as OmniUI from './components/ui/all';

const tokenKey = 'omnilock-access-token';
const refreshTokenKey = 'omnilock-refresh-token';

export default function OmniLockApp() {
  const [viewMode, setViewMode] = useState<ViewMode>('mobile');
  const [token, setToken] = useState<string>(() => localStorage.getItem(tokenKey) || '');
  const [refreshTokenValue, setRefreshTokenValue] = useState<string>(() => localStorage.getItem(refreshTokenKey) || '');
  const [user, setUser] = useState<User | null>(null);
  const [lockers, setLockers] = useState<Locker[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [selectedLocationId, setSelectedLocationId] = useState('');
  const [selectedLockerId, setSelectedLockerId] = useState('');
  const [selectedPlanId, setSelectedPlanId] = useState('');
  const [otpLockerId, setOtpLockerId] = useState('');
  const [otpValue, setOtpValue] = useState('');
  const [biometricLockerId, setBiometricLockerId] = useState('');
  const [templateHash, setTemplateHash] = useState('');
  const [mobileTab, setMobileTab] = useState<'home' | 'map' | 'security' | 'profile'>('home');
  const [quote, setQuote] = useState<{ totalAmount: number; endAt: string; durationMinutes: number } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);

  const selectedLocker = useMemo(() => lockers.find((l) => l.id === selectedLockerId) || null, [lockers, selectedLockerId]);
  const uiComponentsCount = useMemo(() => Object.keys(OmniUI).length, []);

  const quoteText = quote
    ? `Quote: $${quote.totalAmount.toFixed(2)} • Ends ${new Date(quote.endAt).toLocaleString()}`
    : selectedLocker
      ? `Selected locker: ${selectedLocker.id}`
      : undefined;

  async function bootstrap(accessToken: string) {
    setIsLoading(true);
    try {
      const loadAppData = async (tokenToUse: string, meUser?: User) => {
        const [loc, lock, b, p, plansRes] = await Promise.all([
          getLocations(tokenToUse),
          getLockers(tokenToUse, undefined, selectedLocationId || undefined),
          getBookings(tokenToUse),
          getPayments(tokenToUse),
          getPlans(tokenToUse)
        ]);

        setUser(meUser ?? (await getMe(tokenToUse)).user);
        setLocations(loc.locations);
        setLockers(lock.lockers);
        setBookings(b.bookings);
        setPayments(p.payments);
        setPlans(plansRes.plans.filter((plan) => plan.active));
      };

      await loadAppData(accessToken);
    } catch (error) {
      if (refreshTokenValue) {
        try {
          const refreshed = await refreshToken(refreshTokenValue);
          setToken(refreshed.accessToken);
          setRefreshTokenValue(refreshed.refreshToken);
          localStorage.setItem(tokenKey, refreshed.accessToken);
          localStorage.setItem(refreshTokenKey, refreshed.refreshToken);

          const [loc, lock, b, p, plansRes] = await Promise.all([
            getLocations(refreshed.accessToken),
            getLockers(refreshed.accessToken, undefined, selectedLocationId || undefined),
            getBookings(refreshed.accessToken),
            getPayments(refreshed.accessToken),
            getPlans(refreshed.accessToken)
          ]);

          setUser(refreshed.user);
          setLocations(loc.locations);
          setLockers(lock.lockers);
          setBookings(b.bookings);
          setPayments(p.payments);
          setPlans(plansRes.plans.filter((plan) => plan.active));
          return;
        } catch {
          // fallback to full logout below
        }
      }

      localStorage.removeItem(tokenKey);
      localStorage.removeItem(refreshTokenKey);
      setToken('');
      setRefreshTokenValue('');
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

  useEffect(() => {
    if (!token) return;
    void getLockers(token, undefined, selectedLocationId || undefined)
      .then((res) => setLockers(res.lockers))
      .catch(() => undefined);
  }, [token, selectedLocationId]);

  useEffect(() => {
    if (refreshTokenValue) {
      localStorage.setItem(refreshTokenKey, refreshTokenValue);
    }
  }, [refreshTokenValue]);

  useEffect(() => {
    if (!token || !selectedLockerId) return;
    void getLockerDetails(token, selectedLockerId).catch(() => undefined);
  }, [token, selectedLockerId]);

  useEffect(() => {
    if (!token || bookings.length === 0) return;
    void getBookingDetails(token, bookings[0].id).catch(() => undefined);
  }, [token, bookings]);

  async function onAuthSubmit() {
    setIsLoading(true);
    try {
      const authResponse = isRegistering
        ? await register({ name, email, password, phone })
        : await login({ email, password });
      setToken(authResponse.accessToken);
      setRefreshTokenValue(authResponse.refreshToken);
      toast.success(isRegistering ? 'Registration successful' : 'Logged in successfully');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Authentication failed');
    } finally {
      setIsLoading(false);
    }
  }

  function logout() {
    localStorage.removeItem(tokenKey);
    localStorage.removeItem(refreshTokenKey);
    setToken('');
    setRefreshTokenValue('');
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

  async function handleExtendSubscription() {
    if (!token || !selectedPlanId) return;
    const activeBooking = bookings.find((booking) => booking.status === 'ACTIVE');
    if (!activeBooking) {
      toast.error('No active booking found to extend');
      return;
    }

    try {
      await extendSubscription(token, activeBooking.id, selectedPlanId);
      toast.success('Subscription extension booking created');
      await bootstrap(token);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Extension failed');
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

  async function handleEnrollmentOtpRequest() {
    if (!token || !otpLockerId) return;
    try {
      const response = await requestEnrollmentOtp(token, otpLockerId);
      toast.success(`Enrollment OTP sent. Expires at ${new Date(response.expiresAt).toLocaleTimeString()}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Enrollment OTP request failed');
    }
  }

  async function handleEnrollmentOtpVerify() {
    if (!token || !otpLockerId || !otpValue) return;
    try {
      const response = await verifyEnrollmentOtp(token, otpLockerId, otpValue);
      toast.success(`Enrollment verified (${response.expiresIn})`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Enrollment OTP verification failed');
    }
  }

  async function handleBiometricRegister() {
    if (!token || !biometricLockerId || templateHash.length < 16) {
      toast.error('Locker id and template hash (>=16 chars) are required');
      return;
    }

    try {
      await registerBiometric(token, { lockerId: biometricLockerId, templateHash });
      toast.success('Biometric enrolled');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Biometric registration failed');
    }
  }

  async function handleTabletAccessDecision(lockerId: string, nonce: number, deviceSecret: string) {
    if (!user?.id || !lockerId || !deviceSecret) {
      toast.error('Locker, user and device secret are required');
      return;
    }

    try {
      const decision = await deviceAccessDecision({ lockerId, userId: user.id, nonce }, deviceSecret);
      if (decision.allow) {
        toast.success(`Access allowed${decision.unlockToken ? ' (unlock token issued)' : ''}`);
      } else {
        toast.error(`Access denied: ${decision.reason || 'Unknown reason'}`);
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Access decision failed');
    }
  }

  async function handleTabletDeviceEvent(
    lockerId: string,
    eventType: 'UNLOCKED' | 'OPENED' | 'CLOSED' | 'LOCKED',
    deviceSecret: string
  ) {
    if (!lockerId || !deviceSecret) {
      toast.error('Locker and device secret are required');
      return;
    }

    try {
      await deviceEvent({ lockerId, eventType }, deviceSecret);
      toast.success(`Event ${eventType} sent`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Device event failed');
    }
  }

  async function handleTabletTelemetry(lockerId: string, payload: Record<string, unknown>, deviceSecret: string) {
    if (!lockerId || !deviceSecret) {
      toast.error('Locker and device secret are required');
      return;
    }

    try {
      await deviceTelemetry({ lockerId, payload }, deviceSecret);
      toast.success('Telemetry sent');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Telemetry failed');
    }
  }

  async function refreshAdminData() {
    if (!token) return;
    try {
      const [adminLockerRes, auditRes, devicesRes, plansRes] = await Promise.all([
        adminLockers(token),
        adminAudit(token),
        adminDevices(token),
        adminSubscriptionPlans(token)
      ]);
      setLockers(adminLockerRes.lockers);
      setPlans(plansRes.plans);
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

  async function handleAdminUnlock(lockerId: string) {
    if (!token) return;
    try {
      const result = await adminUnlock(token, lockerId);
      toast.success(`Emergency unlock token issued (${result.expiresIn})`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unlock failed');
    }
  }

  async function handleAdminCreateLocation(nameValue: string, building: string, floor: string, latitude?: number, longitude?: number) {
    if (!token || !nameValue) return;
    try {
      await adminCreateLocation(token, {
        name: nameValue,
        building,
        floor,
        latitude: Number.isFinite(latitude) ? latitude : undefined,
        longitude: Number.isFinite(longitude) ? longitude : undefined
      });
      toast.success('Location created');
      await bootstrap(token);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Location creation failed');
    }
  }

  async function handleAdminUpdateLocker(lockerId: string, lockerName: string, series: string, firmwareVersion: string) {
    if (!token || !lockerId) return;
    try {
      await adminUpdateLocker(token, lockerId, { lockerName, series, firmwareVersion });
      toast.success('Locker metadata updated');
      await bootstrap(token);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Locker update failed');
    }
  }

  async function handleAdminCreatePlan(nameValue: string, billingType: string, durationMinutes: number, price: number) {
    if (!token || !nameValue || !durationMinutes || !price) return;
    try {
      await adminCreatePlan(token, { name: nameValue, billingType, durationMinutes, price, active: true });
      toast.success('Subscription plan created');
      await bootstrap(token);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Plan creation failed');
    }
  }

  if (!token || !user) {
    return (
      <div className="min-h-screen bg-[#FFFDF9] text-slate-900 flex items-center justify-center p-6">
        <Toaster richColors position="top-center" />
        <AuthPanel
          isRegistering={isRegistering}
          isLoading={isLoading}
          name={name}
          email={email}
          phone={phone}
          password={password}
          setName={setName}
          setEmail={setEmail}
          setPhone={setPhone}
          setPassword={setPassword}
          onSubmit={onAuthSubmit}
          onToggleMode={() => setIsRegistering((v) => !v)}
        />
      </div>
    );
  }

  return (
    <>
      <Toaster richColors position="top-center" />
      <PageShell user={user} viewMode={viewMode} onModeChange={setViewMode} onLogout={logout}>
        <AnimatePresence mode="wait">
          {viewMode === 'mobile' && (
            <motion.div key="mobile" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mx-auto w-[390px] max-w-full">
              <div className="h-[780px] bg-white rounded-[3rem] shadow-2xl border-[10px] border-slate-900 overflow-hidden relative flex flex-col">
                <div className="h-6 w-32 bg-slate-900 absolute top-0 left-1/2 -translate-x-1/2 rounded-b-2xl z-50" />

                <div className="flex-1 overflow-y-auto px-3 pt-10 pb-20 bg-[#FFFDF9]">
                  {mobileTab === 'home' && (
                    <div className="space-y-3">
                      <BookingPanel
                        lockers={lockers}
                        plans={plans}
                        selectedLockerId={selectedLockerId}
                        selectedPlanId={selectedPlanId}
                        quoteText={quoteText}
                        onSelectLocker={setSelectedLockerId}
                        onSelectPlan={setSelectedPlanId}
                        onQuote={handleQuote}
                        onBookAndPay={handleBooking}
                        onExtendSubscription={handleExtendSubscription}
                      />
                      <DataPanels locations={locations} bookings={bookings} payments={payments} />
                    </div>
                  )}

                  {mobileTab === 'map' && (
                    <DiscoveryPanel
                      lockers={lockers}
                      locations={locations}
                      selectedLockerId={selectedLockerId}
                      selectedLocationId={selectedLocationId}
                      onSelectLocker={setSelectedLockerId}
                      onSelectLocation={setSelectedLocationId}
                      onRefresh={() => token && void bootstrap(token)}
                    />
                  )}

                  {mobileTab === 'security' && (
                    <OtpAndBiometricPanel
                      otpLockerId={otpLockerId}
                      otpValue={otpValue}
                      biometricLockerId={biometricLockerId}
                      templateHash={templateHash}
                      onOtpLockerChange={setOtpLockerId}
                      onOtpValueChange={setOtpValue}
                      onRequestOtp={handleOtpRequest}
                      onVerifyOtp={handleOtpVerify}
                      onRequestEnrollmentOtp={handleEnrollmentOtpRequest}
                      onVerifyEnrollmentOtp={handleEnrollmentOtpVerify}
                      onBiometricLockerChange={setBiometricLockerId}
                      onTemplateHashChange={setTemplateHash}
                      onRegisterBiometric={handleBiometricRegister}
                    />
                  )}

                  {mobileTab === 'profile' && (
                    <div className="space-y-3">
                      <div className="bg-slate-900 text-white rounded-3xl p-5 shadow-xl">
                        <p className="text-xs text-slate-300">Signed in as</p>
                        <h3 className="text-xl font-black mt-1">{user.name}</h3>
                        <p className="text-sm text-slate-300">{user.email}</p>
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        <div className="bg-white border border-slate-200 rounded-2xl p-3 text-center">
                          <p className="text-[10px] text-slate-500">Bookings</p>
                          <p className="text-lg font-black">{bookings.length}</p>
                        </div>
                        <div className="bg-white border border-slate-200 rounded-2xl p-3 text-center">
                          <p className="text-[10px] text-slate-500">Payments</p>
                          <p className="text-lg font-black">{payments.length}</p>
                        </div>
                        <div className="bg-white border border-slate-200 rounded-2xl p-3 text-center">
                          <p className="text-[10px] text-slate-500">Locations</p>
                          <p className="text-lg font-black">{locations.length}</p>
                        </div>
                      </div>
                      <button onClick={logout} className="w-full py-3 rounded-2xl bg-rose-600 text-white font-semibold">
                        Logout
                      </button>

                      <OmniUI.Card className="border-slate-200 shadow-sm">
                        <OmniUI.CardHeader>
                          <OmniUI.CardTitle className="text-base">OmniLock UI Kit</OmniUI.CardTitle>
                          <OmniUI.CardDescription>All ui folder components are now loaded in this frontend.</OmniUI.CardDescription>
                        </OmniUI.CardHeader>
                        <OmniUI.CardContent className="flex items-center justify-between gap-2">
                          <OmniUI.Badge variant="secondary">{uiComponentsCount} exports</OmniUI.Badge>
                          <OmniUI.Button size="sm" variant="outline" onClick={() => toast.success('UI kit is active')}>
                            Test UI Button
                          </OmniUI.Button>
                        </OmniUI.CardContent>
                      </OmniUI.Card>
                    </div>
                  )}
                </div>

                <div className="h-16 border-t border-slate-100 px-10 flex justify-between items-center bg-white/90 backdrop-blur-md shrink-0">
                  <button onClick={() => setMobileTab('home')} className={mobileTab === 'home' ? 'text-blue-600' : 'text-slate-300'}>
                    <Bell size={20} />
                  </button>
                  <button onClick={() => setMobileTab('map')} className={mobileTab === 'map' ? 'text-blue-600' : 'text-slate-300'}>
                    <Search size={20} />
                  </button>
                  <button onClick={() => setMobileTab('security')} className={mobileTab === 'security' ? 'text-blue-600' : 'text-slate-300'}>
                    <ShieldCheck size={20} />
                  </button>
                  <button onClick={() => setMobileTab('profile')} className={mobileTab === 'profile' ? 'text-blue-600' : 'text-slate-300'}>
                    <UserIcon size={20} />
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {viewMode === 'tablet' && (
            <motion.div key="tablet" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <TabletPanel
                lockers={lockers}
                userId={user.id}
                onAccessDecision={handleTabletAccessDecision}
                onSendEvent={handleTabletDeviceEvent}
                onSendTelemetry={handleTabletTelemetry}
              />
            </motion.div>
          )}

          {viewMode === 'admin' && (
            <motion.div key="admin" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <AdminPanel
                user={user}
                lockers={lockers}
                plans={plans}
                onRefresh={refreshAdminData}
                onToggleMaintenance={toggleMaintenance}
                onUnlock={handleAdminUnlock}
                onCreateLocation={handleAdminCreateLocation}
                onUpdateLocker={handleAdminUpdateLocker}
                onCreatePlan={handleAdminCreatePlan}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </PageShell>
    </>
  );
}
