'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from './ui';
import { Upload, Settings, BarChart3, Zap, Sparkles } from 'lucide-react';

const steps = [
  { href: '/', label: 'Upload CSV', icon: Upload, step: 1 },
  { href: '/setup', label: 'Persona & Keys', icon: Settings, step: 2 },
  { href: '/results', label: 'Score Profiles', icon: BarChart3, step: 3 },
  { href: '/enrichment', label: 'Enrich Contacts', icon: Zap, step: 4 },
];

export default function Sidebar() {
  const pathname = usePathname();
  return (
    <aside className="w-64 shrink-0 h-screen sticky top-0 flex flex-col glass border-r border-white/8">
      <div className="p-6 border-b border-white/8">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-500 to-blue-600 flex items-center justify-center">
            <Sparkles size={16} className="text-white" />
          </div>
          <div>
            <div className="text-sm font-bold text-white tracking-tight">LeadScore AI</div>
            <div className="text-[10px] text-white/40 uppercase tracking-widest">by NxtWave</div>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 flex flex-col gap-1">
        {steps.map(({ href, label, icon: Icon, step }) => {
          const active = pathname === href;
          return (
            <Link key={href} href={href} className={cn(
              'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all group',
              active ? 'bg-violet-600/20 text-violet-300 border border-violet-500/25' : 'text-white/50 hover:text-white hover:bg-white/5'
            )}>
              <div className={cn(
                'w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold',
                active ? 'bg-violet-500 text-white' : 'bg-white/8 text-white/40 group-hover:bg-white/12'
              )}>
                {step}
              </div>
              <Icon size={14} className="shrink-0" />
              <span className="font-medium">{label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-white/8">
        <p className="text-[11px] text-white/25 text-center">LinkedIn Scorer v1.0</p>
      </div>
    </aside>
  );
}
