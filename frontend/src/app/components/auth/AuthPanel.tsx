import { type ChangeEvent } from 'react';
import { Lock } from 'lucide-react';

interface AuthPanelProps {
  isRegistering: boolean;
  isLoading: boolean;
  name: string;
  email: string;
  phone: string;
  password: string;
  setName: (value: string) => void;
  setEmail: (value: string) => void;
  setPhone: (value: string) => void;
  setPassword: (value: string) => void;
  onSubmit: () => void;
  onToggleMode: () => void;
}

export function AuthPanel(props: AuthPanelProps) {
  const {
    isRegistering,
    isLoading,
    name,
    email,
    phone,
    password,
    setName,
    setEmail,
    setPhone,
    setPassword,
    onSubmit,
    onToggleMode
  } = props;

  return (
    <div className="w-full max-w-md bg-white/95 backdrop-blur rounded-[2rem] shadow-[0_24px_60px_rgba(15,23,42,0.16)] border border-slate-200 p-8">
      <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center mb-6 mx-auto shadow-lg shadow-blue-200">
        <Lock className="text-white" size={32} />
      </div>
      <h1 className="text-3xl font-black text-center tracking-tight">OMNILOCK</h1>
      <p className="text-slate-500 text-sm text-center mt-2 mb-8">Secure smart locker access for modern campus life.</p>

      {isRegistering && (
        <input
          className="w-full mb-3 p-3 rounded-xl border border-slate-200 bg-white outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-300"
          placeholder="Full name"
          value={name}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
        />
      )}
      <input
        className="w-full mb-3 p-3 rounded-xl border border-slate-200 bg-white outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-300"
        placeholder="Email"
        value={email}
        onChange={(e: ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
      />
      {isRegistering && (
        <input
          className="w-full mb-3 p-3 rounded-xl border border-slate-200 bg-white outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-300"
          placeholder="Phone"
          value={phone}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setPhone(e.target.value)}
        />
      )}
      <input
        className="w-full mb-4 p-3 rounded-xl border border-slate-200 bg-white outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-300"
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e: ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
      />

      <button
        onClick={onSubmit}
        disabled={isLoading}
        className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-xl font-bold shadow-lg shadow-blue-200 hover:opacity-95 active:scale-[0.995] transition-all"
      >
        {isLoading ? 'Please wait...' : isRegistering ? 'Create account' : 'Sign in'}
      </button>
      <button onClick={onToggleMode} className="w-full mt-3 text-blue-700 text-sm font-medium hover:text-blue-800 transition-colors">
        {isRegistering ? 'Have an account? Login' : 'No account? Register'}
      </button>
    </div>
  );
}
