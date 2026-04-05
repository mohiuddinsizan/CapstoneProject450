import { Bell, CreditCard } from 'lucide-react';
import type { Booking, Location, Payment } from '@/lib/types';

interface DataPanelsProps {
  locations: Location[];
  bookings: Booking[];
  payments: Payment[];
}

export function DataPanels({ locations, bookings, payments }: DataPanelsProps) {
  return (
    <div className="lg:col-span-3 grid md:grid-cols-3 gap-4">
      <div className="bg-white/95 backdrop-blur rounded-2xl border border-slate-200 shadow-[0_12px_30px_rgba(15,23,42,0.07)] p-4">
        <h4 className="font-semibold mb-2 flex items-center gap-2">
          <Bell size={14} /> Locations ({locations.length})
        </h4>
        <ul className="space-y-2 max-h-52 overflow-auto text-sm">
          {locations.map((location) => (
            <li key={location.id} className="p-2 bg-slate-50 border border-slate-100 rounded-lg">
              {location.name}
            </li>
          ))}
        </ul>
      </div>
      <div className="bg-white/95 backdrop-blur rounded-2xl border border-slate-200 shadow-[0_12px_30px_rgba(15,23,42,0.07)] p-4 md:col-span-2">
        <h4 className="font-semibold mb-2 flex items-center gap-2">
          <CreditCard size={14} /> Bookings & Payments
        </h4>
        <div className="grid md:grid-cols-2 gap-3">
          <div>
            <p className="text-xs text-slate-500 mb-2">Bookings ({bookings.length})</p>
            <ul className="space-y-2 max-h-52 overflow-auto text-sm">
              {bookings.map((booking) => (
                <li key={booking.id} className="p-2 bg-slate-50 border border-slate-100 rounded-lg">
                  <p className="font-medium">{booking.plan_name || booking.plan_id}</p>
                  <p className="text-xs text-slate-500">
                    {booking.status} • {booking.id.slice(0, 8)}
                  </p>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-xs text-slate-500 mb-2">Payments ({payments.length})</p>
            <ul className="space-y-2 max-h-52 overflow-auto text-sm">
              {payments.map((payment) => (
                <li key={payment.id} className="p-2 bg-slate-50 border border-slate-100 rounded-lg">
                  <p className="font-medium">
                    {payment.status} • ${Number(payment.amount).toFixed(2)}
                  </p>
                  <p className="text-xs text-slate-500">{payment.provider_ref}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
