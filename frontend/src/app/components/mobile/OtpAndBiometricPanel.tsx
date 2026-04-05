import { type ChangeEvent } from 'react';
import { Fingerprint, ShieldCheck } from 'lucide-react';

interface OtpAndBiometricPanelProps {
  otpLockerId: string;
  otpValue: string;
  biometricLockerId: string;
  templateHash: string;
  onOtpLockerChange: (value: string) => void;
  onOtpValueChange: (value: string) => void;
  onRequestOtp: () => void;
  onVerifyOtp: () => void;
  onRequestEnrollmentOtp: () => void;
  onVerifyEnrollmentOtp: () => void;
  onBiometricLockerChange: (value: string) => void;
  onTemplateHashChange: (value: string) => void;
  onRegisterBiometric: () => void;
}

export function OtpAndBiometricPanel(props: OtpAndBiometricPanelProps) {
  const {
    otpLockerId,
    otpValue,
    biometricLockerId,
    templateHash,
    onOtpLockerChange,
    onOtpValueChange,
    onRequestOtp,
    onVerifyOtp,
    onRequestEnrollmentOtp,
    onVerifyEnrollmentOtp,
    onBiometricLockerChange,
    onTemplateHashChange,
    onRegisterBiometric
  } = props;

  return (
    <div className="space-y-4">
      <div className="bg-white/95 backdrop-blur rounded-3xl border border-slate-200 shadow-[0_14px_34px_rgba(15,23,42,0.08)] p-4">
        <h3 className="font-bold mb-2 flex items-center gap-2">
          <ShieldCheck size={16} /> OTP Unlock
        </h3>
        <input
          className="w-full p-2 rounded-xl border border-slate-200 mb-2 bg-white outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-300"
          placeholder="Locker UUID"
          value={otpLockerId}
          onChange={(e: ChangeEvent<HTMLInputElement>) => onOtpLockerChange(e.target.value)}
        />
        <input
          className="w-full p-2 rounded-xl border border-slate-200 mb-2 bg-white outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-300"
          placeholder="6-digit OTP"
          value={otpValue}
          onChange={(e: ChangeEvent<HTMLInputElement>) => onOtpValueChange(e.target.value)}
        />
        <div className="grid grid-cols-2 gap-2 mb-2">
          <button onClick={onRequestOtp} className="py-2 rounded-xl border border-slate-200 text-sm font-medium hover:bg-slate-50 transition-colors">
            Request Access OTP
          </button>
          <button onClick={onVerifyOtp} className="py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-sm font-semibold shadow-lg shadow-emerald-200">
            Verify Access OTP
          </button>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <button onClick={onRequestEnrollmentOtp} className="py-2 rounded-xl border border-slate-200 text-sm font-medium hover:bg-slate-50 transition-colors">
            Request Enrollment OTP
          </button>
          <button onClick={onVerifyEnrollmentOtp} className="py-2 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 text-white text-sm font-semibold shadow-lg shadow-amber-200">
            Verify Enrollment OTP
          </button>
        </div>
      </div>

      <div className="bg-white/95 backdrop-blur rounded-3xl border border-slate-200 shadow-[0_14px_34px_rgba(15,23,42,0.08)] p-4">
        <h3 className="font-bold mb-2 flex items-center gap-2">
          <Fingerprint size={16} /> Biometric Enrollment
        </h3>
        <p className="text-xs text-slate-500 mb-2">Uses /biometric/register. Requires active access grant.</p>
        <input
          className="w-full p-2 rounded-xl border border-slate-200 mb-2 bg-white outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-300"
          placeholder="Locker UUID"
          value={biometricLockerId}
          onChange={(e: ChangeEvent<HTMLInputElement>) => onBiometricLockerChange(e.target.value)}
        />
        <input
          className="w-full p-2 rounded-xl border border-slate-200 mb-2 bg-white outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-300"
          placeholder="Template hash (min 16 chars)"
          value={templateHash}
          onChange={(e: ChangeEvent<HTMLInputElement>) => onTemplateHashChange(e.target.value)}
        />
        <button onClick={onRegisterBiometric} className="w-full py-2 rounded-xl bg-gradient-to-r from-slate-900 to-slate-700 text-white text-sm font-semibold shadow-lg shadow-slate-200">
          Register Biometric
        </button>
      </div>
    </div>
  );
}
