import { type ChangeEvent, useState } from 'react';
import { Activity, AlertTriangle, RefreshCw } from 'lucide-react';
import type { Locker, Plan, User } from '@/lib/types';

interface AdminPanelProps {
  user: User;
  lockers: Locker[];
  plans: Plan[];
  onRefresh: () => void;
  onToggleMaintenance: (locker: Locker) => void;
  onUnlock: (lockerId: string) => void;
  onCreateLocation: (name: string, building: string, floor: string, latitude?: number, longitude?: number) => void;
  onUpdateLocker: (lockerId: string, lockerName: string, series: string, firmwareVersion: string) => void;
  onCreatePlan: (name: string, billingType: string, durationMinutes: number, price: number) => void;
}

export function AdminPanel(props: AdminPanelProps) {
  const {
    user,
    lockers,
    plans,
    onRefresh,
    onToggleMaintenance,
    onUnlock,
    onCreateLocation,
    onUpdateLocker,
    onCreatePlan
  } = props;

  const [locationName, setLocationName] = useState('');
  const [locationBuilding, setLocationBuilding] = useState('');
  const [locationFloor, setLocationFloor] = useState('');
  const [locationLatitude, setLocationLatitude] = useState('');
  const [locationLongitude, setLocationLongitude] = useState('');

  const [updateLockerId, setUpdateLockerId] = useState('');
  const [updateLockerName, setUpdateLockerName] = useState('');
  const [updateSeries, setUpdateSeries] = useState('');
  const [updateFirmware, setUpdateFirmware] = useState('');

  const [planName, setPlanName] = useState('');
  const [planBillingType, setPlanBillingType] = useState('HOURLY');
  const [planDuration, setPlanDuration] = useState('60');
  const [planPrice, setPlanPrice] = useState('2');

  if (user.role !== 'admin') {
    return (
      <div className="p-4 rounded-2xl border border-amber-200 bg-amber-50 text-amber-700 text-sm flex items-start gap-2">
        <AlertTriangle size={18} />
        <div>
          <p className="font-semibold">Admin token required</p>
          <p>Login with an account where role = ADMIN to use admin endpoints.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/95 backdrop-blur rounded-3xl border border-slate-200 shadow-[0_18px_42px_rgba(15,23,42,0.1)] p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-black text-2xl flex items-center gap-2">
          <Activity size={22} /> Admin Dashboard
        </h2>
        <button onClick={onRefresh} className="px-3 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-sm font-medium transition-colors">
          <RefreshCw size={14} className="inline mr-1" /> Refresh
        </button>
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <div className="border border-slate-200 rounded-2xl bg-white p-4 lg:col-span-2">
          <h3 className="font-semibold mb-2">Locker Operations</h3>
          <ul className="space-y-2 max-h-80 overflow-auto">
            {lockers.map((locker) => (
              <li key={locker.id} className="p-3 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-between gap-2">
                <div>
                  <p className="font-medium text-sm">{locker.locker_name}</p>
                  <p className="text-xs text-slate-500">{locker.status}</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => onUnlock(locker.id)} className="text-xs px-3 py-1 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-200">
                    Emergency Unlock
                  </button>
                  <button onClick={() => onToggleMaintenance(locker)} className="text-xs px-3 py-1 rounded-full bg-gradient-to-r from-slate-900 to-slate-700 text-white shadow-md shadow-slate-200">
                    {locker.status === 'MAINTENANCE' ? 'Set AVAILABLE' : 'Set MAINTENANCE'}
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="border border-slate-200 rounded-2xl bg-white p-4">
          <h3 className="font-semibold mb-2">Create Location</h3>
          <input className="w-full p-2 border border-slate-200 rounded-lg mb-2 bg-white outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-300" placeholder="Name" onChange={(e: ChangeEvent<HTMLInputElement>) => setLocationName(e.target.value)} />
          <input className="w-full p-2 border border-slate-200 rounded-lg mb-2 bg-white outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-300" placeholder="Building" onChange={(e: ChangeEvent<HTMLInputElement>) => setLocationBuilding(e.target.value)} />
          <input className="w-full p-2 border border-slate-200 rounded-lg mb-2 bg-white outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-300" placeholder="Floor" onChange={(e: ChangeEvent<HTMLInputElement>) => setLocationFloor(e.target.value)} />
          <input className="w-full p-2 border border-slate-200 rounded-lg mb-2 bg-white outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-300" placeholder="Latitude (e.g. 23.7296)" onChange={(e: ChangeEvent<HTMLInputElement>) => setLocationLatitude(e.target.value)} />
          <input className="w-full p-2 border border-slate-200 rounded-lg mb-2 bg-white outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-300" placeholder="Longitude (e.g. 90.3991)" onChange={(e: ChangeEvent<HTMLInputElement>) => setLocationLongitude(e.target.value)} />
          <button
            className="w-full py-2 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-sm font-semibold shadow-lg shadow-emerald-200"
            onClick={() => {
              const parsedLatitude = locationLatitude.trim() ? Number(locationLatitude) : undefined;
              const parsedLongitude = locationLongitude.trim() ? Number(locationLongitude) : undefined;
              onCreateLocation(locationName, locationBuilding, locationFloor, parsedLatitude, parsedLongitude);
            }}
          >
            Create
          </button>

          <h3 className="font-semibold mt-4 mb-2">Update Locker Metadata</h3>
          <input className="w-full p-2 border border-slate-200 rounded-lg mb-2 bg-white outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-300" placeholder="Locker UUID" onChange={(e: ChangeEvent<HTMLInputElement>) => setUpdateLockerId(e.target.value)} />
          <input className="w-full p-2 border border-slate-200 rounded-lg mb-2 bg-white outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-300" placeholder="Locker Name" onChange={(e: ChangeEvent<HTMLInputElement>) => setUpdateLockerName(e.target.value)} />
          <input className="w-full p-2 border border-slate-200 rounded-lg mb-2 bg-white outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-300" placeholder="Series" onChange={(e: ChangeEvent<HTMLInputElement>) => setUpdateSeries(e.target.value)} />
          <input className="w-full p-2 border border-slate-200 rounded-lg mb-2 bg-white outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-300" placeholder="Firmware Version" onChange={(e: ChangeEvent<HTMLInputElement>) => setUpdateFirmware(e.target.value)} />
          <button className="w-full py-2 rounded-lg bg-gradient-to-r from-slate-900 to-slate-700 text-white text-sm font-semibold shadow-lg shadow-slate-200" onClick={() => onUpdateLocker(updateLockerId, updateLockerName, updateSeries, updateFirmware)}>
            Update
          </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-4 mt-4">
        <div className="border border-slate-200 rounded-2xl bg-white p-4">
          <h3 className="font-semibold mb-2">Subscription Plans ({plans.length})</h3>
          <ul className="space-y-2 max-h-40 overflow-auto mb-3">
            {plans.map((plan) => (
              <li key={plan.id} className="p-2 bg-slate-50 border border-slate-100 rounded-lg text-sm">
                {plan.name} • {plan.duration_minutes}m • ${Number(plan.price).toFixed(2)}
              </li>
            ))}
          </ul>
          <input className="w-full p-2 border border-slate-200 rounded-lg mb-2 bg-white outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-300" placeholder="Plan name" onChange={(e: ChangeEvent<HTMLInputElement>) => setPlanName(e.target.value)} />
          <input className="w-full p-2 border border-slate-200 rounded-lg mb-2 bg-white outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-300" placeholder="Billing type" defaultValue="HOURLY" onChange={(e: ChangeEvent<HTMLInputElement>) => setPlanBillingType(e.target.value)} />
          <input className="w-full p-2 border border-slate-200 rounded-lg mb-2 bg-white outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-300" placeholder="Duration (minutes)" defaultValue="60" onChange={(e: ChangeEvent<HTMLInputElement>) => setPlanDuration(e.target.value)} />
          <input className="w-full p-2 border border-slate-200 rounded-lg mb-2 bg-white outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-300" placeholder="Price" defaultValue="2" onChange={(e: ChangeEvent<HTMLInputElement>) => setPlanPrice(e.target.value)} />
          <button
            className="w-full py-2 rounded-lg bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white text-sm font-semibold shadow-lg shadow-violet-200"
            onClick={() => onCreatePlan(planName, planBillingType, Number(planDuration), Number(planPrice))}
          >
            Create Plan
          </button>
        </div>

        <div className="border border-slate-200 rounded-2xl bg-white p-4">
          <h3 className="font-semibold mb-2">Backend Feature Coverage</h3>
          <ul className="text-sm text-slate-600 list-disc ml-5 space-y-1">
            <li>/auth/register, /auth/login, /auth/me, /auth/refresh</li>
            <li>/locations, /lockers, /lockers/:id</li>
            <li>/bookings/quote, /bookings, /bookings/:id, /subscriptions/extend</li>
            <li>/payments/checkout, /payments/history</li>
            <li>/otp/request, /otp/verify, /otp/enrollment, /otp/verify-enrollment</li>
            <li>/biometric/register</li>
            <li>/admin/locations, /admin/lockers, /admin/lockers/:id, /admin/unlock, /admin/subscription-plans</li>
            <li>/access/decision, /device/events, /device/telemetry (device secret required)</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
