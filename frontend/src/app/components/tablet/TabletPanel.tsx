import { useMemo, useState } from 'react';
import { Monitor, Radar, ShieldCheck, Send } from 'lucide-react';
import type { Locker } from '@/lib/types';

interface TabletPanelProps {
  lockers: Locker[];
  userId: string;
  onAccessDecision: (lockerId: string, nonce: number, deviceSecret: string) => void;
  onSendEvent: (lockerId: string, eventType: 'UNLOCKED' | 'OPENED' | 'CLOSED' | 'LOCKED', deviceSecret: string) => void;
  onSendTelemetry: (lockerId: string, payload: Record<string, unknown>, deviceSecret: string) => void;
}

export function TabletPanel({ lockers, userId, onAccessDecision, onSendEvent, onSendTelemetry }: TabletPanelProps) {
  const [lockerId, setLockerId] = useState('');
  const [deviceSecret, setDeviceSecret] = useState('dev-secret');
  const [nonce, setNonce] = useState('1');
  const [eventType, setEventType] = useState<'UNLOCKED' | 'OPENED' | 'CLOSED' | 'LOCKED'>('UNLOCKED');
  const [telemetryText, setTelemetryText] = useState('{"battery":92,"temp":31.2}');

  const lockerOptions = useMemo(() => lockers.map((locker) => ({ id: locker.id, name: locker.locker_name })), [lockers]);

  function parseTelemetry(text: string) {
    try {
      const parsed = JSON.parse(text);
      if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
        return parsed as Record<string, unknown>;
      }
      return { raw: parsed };
    } catch {
      return { rawText: text };
    }
  }

  const resolvedLockerId = lockerId || lockerOptions[0]?.id || '';

  return (
    <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-4">
      <div className="text-center">
        <Monitor size={42} className="mx-auto mb-3 text-blue-600" />
        <h2 className="font-black text-2xl">Locker Tablet Mode</h2>
        <p className="text-slate-500 mt-2 text-sm">Phase G device simulation for /access and /device endpoints.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-semibold text-slate-600">Locker</label>
          <select
            className="w-full p-2 border rounded-lg mt-1"
            value={resolvedLockerId}
            onChange={(e) => setLockerId(e.target.value)}
          >
            {lockerOptions.length === 0 ? (
              <option value="">No lockers loaded</option>
            ) : (
              lockerOptions.map((locker) => (
                <option key={locker.id} value={locker.id}>
                  {locker.name} ({locker.id})
                </option>
              ))
            )}
          </select>
        </div>
        <div>
          <label className="text-xs font-semibold text-slate-600">Device Secret</label>
          <input
            className="w-full p-2 border rounded-lg mt-1"
            value={deviceSecret}
            onChange={(e) => setDeviceSecret(e.target.value)}
            placeholder="x-device-secret"
          />
        </div>
      </div>

      <div className="text-xs text-slate-500">User ID for decision: <span className="font-mono">{userId}</span></div>

      <div className="grid lg:grid-cols-3 gap-3">
        <div className="border border-slate-200 rounded-2xl p-3">
          <h3 className="font-semibold text-sm mb-2 flex items-center gap-1"><ShieldCheck size={14} /> Access decision</h3>
          <input
            className="w-full p-2 border rounded-lg mb-2"
            value={nonce}
            onChange={(e) => setNonce(e.target.value)}
            placeholder="Nonce"
          />
          <button
            className="w-full py-2 rounded-lg bg-blue-600 text-white text-sm"
            onClick={() => onAccessDecision(resolvedLockerId, Number(nonce), deviceSecret)}
            disabled={!resolvedLockerId || !deviceSecret}
          >
            Decision Request
          </button>
        </div>

        <div className="border border-slate-200 rounded-2xl p-3">
          <h3 className="font-semibold text-sm mb-2 flex items-center gap-1"><Send size={14} /> Device event</h3>
          <select
            className="w-full p-2 border rounded-lg mb-2"
            value={eventType}
            onChange={(e) => setEventType(e.target.value as 'UNLOCKED' | 'OPENED' | 'CLOSED' | 'LOCKED')}
          >
            <option value="UNLOCKED">UNLOCKED</option>
            <option value="OPENED">OPENED</option>
            <option value="CLOSED">CLOSED</option>
            <option value="LOCKED">LOCKED</option>
          </select>
          <button
            className="w-full py-2 rounded-lg bg-slate-900 text-white text-sm"
            onClick={() => onSendEvent(resolvedLockerId, eventType, deviceSecret)}
            disabled={!resolvedLockerId || !deviceSecret}
          >
            Send Event
          </button>
        </div>

        <div className="border border-slate-200 rounded-2xl p-3">
          <h3 className="font-semibold text-sm mb-2 flex items-center gap-1"><Radar size={14} /> Telemetry</h3>
          <textarea
            className="w-full p-2 border rounded-lg mb-2 h-16"
            value={telemetryText}
            onChange={(e) => setTelemetryText(e.target.value)}
            placeholder='{"battery":90}'
          />
          <button
            className="w-full py-2 rounded-lg bg-emerald-600 text-white text-sm"
            onClick={() => onSendTelemetry(resolvedLockerId, parseTelemetry(telemetryText), deviceSecret)}
            disabled={!resolvedLockerId || !deviceSecret}
          >
            Send Telemetry
          </button>
        </div>
      </div>
    </div>
  );
}
