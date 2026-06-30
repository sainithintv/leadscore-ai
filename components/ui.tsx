'use client';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: (string | undefined | null | boolean)[]) {
  return twMerge(clsx(inputs));
}

export function Badge({ tier }: { tier: 'hot' | 'warm' | 'cold' }) {
  const styles = {
    hot: 'bg-red-500/20 text-red-400 border border-red-500/30',
    warm: 'bg-amber-500/20 text-amber-400 border border-amber-500/30',
    cold: 'bg-blue-500/20 text-blue-400 border border-blue-500/30',
  };
  const icons = { hot: '🔥', warm: '☀️', cold: '❄️' };
  return (
    <span className={cn('px-2 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wide', styles[tier])}>
      {icons[tier]} {tier}
    </span>
  );
}

export function ScoreBar({ score }: { score: number }) {
  const color = score >= 75 ? '#ef4444' : score >= 40 ? '#f59e0b' : '#3b82f6';
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
        <div style={{ width: `${score}%`, background: color }} className="h-full rounded-full transition-all duration-700" />
      </div>
      <span className="text-xs font-mono font-bold" style={{ color }}>{score}</span>
    </div>
  );
}

export function Button({ children, onClick, variant = 'primary', disabled, className, type }: {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  disabled?: boolean;
  className?: string;
  type?: 'button' | 'submit';
}) {
  const styles = {
    primary: 'bg-violet-600 hover:bg-violet-500 text-white shadow-lg shadow-violet-500/20',
    secondary: 'glass hover:bg-white/10 text-white',
    ghost: 'hover:bg-white/5 text-white/70 hover:text-white',
    danger: 'bg-red-600/80 hover:bg-red-500 text-white',
  };
  return (
    <button
      type={type || 'button'}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'px-4 py-2 rounded-xl font-medium text-sm transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer',
        styles[variant],
        className
      )}
    >
      {children}
    </button>
  );
}

export function Input({ label, value, onChange, placeholder, type = 'text', hint }: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  hint?: string;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-white/70">{label}</label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-violet-500/60 focus:bg-white/8 transition-all"
      />
      {hint && <p className="text-xs text-white/40">{hint}</p>}
    </div>
  );
}

export function Textarea({ label, value, onChange, placeholder, rows = 4 }: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  rows?: number;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-white/70">{label}</label>
      <textarea
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        className="bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-violet-500/60 transition-all resize-none"
      />
    </div>
  );
}
