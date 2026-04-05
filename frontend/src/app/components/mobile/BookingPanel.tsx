import { type ChangeEvent } from 'react';
import type { Locker, Plan } from '@/lib/types';

interface BookingPanelProps {
  lockers: Locker[];
  plans: Plan[];
  selectedLockerId: string;
  selectedPlanId: string;
  quoteText?: string;
  onSelectLocker: (value: string) => void;
  onSelectPlan: (value: string) => void;
  onQuote: () => void;
  onBookAndPay: () => void;
  onExtendSubscription: () => void;
}

export function BookingPanel({
  lockers,
  plans,
  selectedLockerId,
  selectedPlanId,
  quoteText,
  onSelectLocker,
  onSelectPlan,
  onQuote,
  onBookAndPay,
  onExtendSubscription
}: BookingPanelProps) {
  return (
    <div className="bg-white/95 backdrop-blur rounded-3xl border border-slate-200 shadow-[0_14px_34px_rgba(15,23,42,0.08)] p-4">
      <h3 className="font-bold mb-2 text-slate-900">Booking / Subscription</h3>
      <p className="text-xs text-slate-500 mb-3">Uses /bookings/quote, /bookings, /payments/checkout, /subscriptions/extend.</p>

      <select
        className="w-full p-2 rounded-xl border border-slate-200 mb-2 bg-white outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-300"
        value={selectedLockerId}
        onChange={(e: ChangeEvent<HTMLSelectElement>) => onSelectLocker(e.target.value)}
      >
        <option value="">Select locker</option>
        {lockers
          .filter((locker) => locker.status === 'AVAILABLE')
          .map((locker) => (
            <option key={locker.id} value={locker.id}>
              {locker.locker_name}
            </option>
          ))}
      </select>

      <select
        className="w-full p-2 rounded-xl border border-slate-200 mb-2 bg-white outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-300"
        value={selectedPlanId}
        onChange={(e: ChangeEvent<HTMLSelectElement>) => onSelectPlan(e.target.value)}
      >
        <option value="">Select plan</option>
        {plans.map((plan) => (
          <option key={plan.id} value={plan.id}>
            {plan.name} • {plan.duration_minutes}m • ${Number(plan.price).toFixed(2)}
          </option>
        ))}
      </select>

      {plans.length === 0 && (
        <p className="text-[11px] text-amber-600 mb-2">No plans available for this user role. Admin can create plans in Admin tab.</p>
      )}

      <div className="grid grid-cols-2 gap-2">
        <button onClick={onQuote} className="py-2 rounded-xl border border-slate-200 text-sm font-medium hover:bg-slate-50 transition-colors">
          Quote
        </button>
        <button onClick={onBookAndPay} className="py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-semibold shadow-lg shadow-blue-200">
          Book + Pay
        </button>
        <button onClick={onExtendSubscription} className="col-span-2 py-2 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white text-sm font-semibold shadow-lg shadow-violet-200">
          Extend Latest Active Subscription
        </button>
      </div>

      {quoteText && <p className="text-xs mt-3 text-slate-700 bg-slate-50 border border-slate-100 rounded-lg px-2 py-1.5">{quoteText}</p>}
    </div>
  );
}
