import { LogOut } from 'lucide-react';
import type { ReactNode } from 'react';
import { ModeSwitcher, type ViewMode } from '../layout/ModeSwitcher';
import type { User } from '@/lib/types';

interface PageShellProps {
  user: User;
  viewMode: ViewMode;
  onModeChange: (mode: ViewMode) => void;
  onLogout: () => void;
  children: ReactNode;
}

export function PageShell({ user, viewMode, onModeChange, onLogout, children }: PageShellProps) {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,#dbeafe_0%,#fffdf9_35%,#fffdf9_100%)] text-slate-900 font-sans selection:bg-blue-100 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-wrap items-center justify-between gap-4 bg-white/90 backdrop-blur rounded-3xl p-4 border border-slate-200 shadow-[0_12px_32px_rgba(15,23,42,0.08)] mb-6">
          <div className="min-w-[180px]">
            <h1 className="font-black text-2xl tracking-tight">OMNILOCK</h1>
            <p className="text-sm text-slate-500">{user.name} • {user.role}</p>
          </div>
          <ModeSwitcher viewMode={viewMode} onChange={onModeChange} />
          <button
            onClick={onLogout}
            className="px-4 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 transition-colors flex items-center gap-2 text-sm font-medium"
          >
            <LogOut size={16} /> Logout
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
