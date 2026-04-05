import { Monitor, Settings, Smartphone } from 'lucide-react';

type ViewMode = 'mobile' | 'tablet' | 'admin';

interface ModeSwitcherProps {
  viewMode: ViewMode;
  onChange: (mode: ViewMode) => void;
}

export function ModeSwitcher({ viewMode, onChange }: ModeSwitcherProps) {
  const base = 'flex items-center gap-1.5 px-3 py-2 rounded-full text-sm font-medium transition-all';
  return (
    <div className="flex items-center gap-1 bg-slate-50/90 backdrop-blur p-1 rounded-full border border-slate-200 shadow-sm">
      <button
        onClick={() => onChange('mobile')}
        className={`${base} ${viewMode === 'mobile' ? 'bg-blue-600 text-white shadow-md shadow-blue-200' : 'text-slate-600 hover:bg-white'}`}
      >
        <Smartphone size={16} /> <span className="hidden md:inline">Mobile</span>
      </button>
      <button
        onClick={() => onChange('tablet')}
        className={`${base} ${viewMode === 'tablet' ? 'bg-blue-600 text-white shadow-md shadow-blue-200' : 'text-slate-600 hover:bg-white'}`}
      >
        <Monitor size={16} /> <span className="hidden md:inline">Tablet</span>
      </button>
      <button
        onClick={() => onChange('admin')}
        className={`${base} ${viewMode === 'admin' ? 'bg-blue-600 text-white shadow-md shadow-blue-200' : 'text-slate-600 hover:bg-white'}`}
      >
        <Settings size={16} /> <span className="hidden md:inline">Admin</span>
      </button>
    </div>
  );
}

export type { ViewMode };
