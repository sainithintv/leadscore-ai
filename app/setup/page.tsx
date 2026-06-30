'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Settings, User, ChevronRight, Check } from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { Button, Input, Textarea, cn } from '@/components/ui';

export default function SetupPage() {
  const router = useRouter();
  const { state, dispatch } = useAppStore();

  const [persona, setPersona] = useState(state.persona);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    dispatch({ type: 'SET_PERSONA', payload: persona });
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="min-h-screen p-8 max-w-2xl">
      <div className="mb-10">
        <div className="flex items-center gap-2 text-violet-400 text-sm font-medium mb-3">
          <Settings size={14} />
          <span>Step 2 of 4</span>
        </div>
        <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">Ideal Customer Persona</h1>
        <p className="text-white/50">Define who you want to reach — the AI will score every profile against this.</p>
      </div>

      {/* Persona Card */}
      <div className="glass rounded-2xl p-6 mb-6">
        <div className="flex items-center gap-2 mb-5">
          <div className="w-7 h-7 rounded-lg bg-blue-500/20 flex items-center justify-center">
            <User size={13} className="text-blue-400" />
          </div>
          <h2 className="text-sm font-semibold text-white">Persona Configuration</h2>
        </div>

        <div className="flex flex-col gap-4">
          <Input
            label="Persona Name"
            value={persona.name}
            onChange={v => setPersona(p => ({ ...p, name: v }))}
            placeholder="e.g. Senior B2B SaaS Buyer"
          />
          <Textarea
            label="Description"
            value={persona.description}
            onChange={v => setPersona(p => ({ ...p, description: v }))}
            placeholder="Describe your ideal customer in plain language. What problems do they have? What do they care about?"
            rows={4}
          />
          <Input
            label="Target Job Titles"
            value={persona.targetTitles}
            onChange={v => setPersona(p => ({ ...p, targetTitles: v }))}
            placeholder="VP of Sales, Head of Growth, Chief Revenue Officer"
            hint="Comma-separated"
          />
          <Input
            label="Target Industries"
            value={persona.targetIndustries}
            onChange={v => setPersona(p => ({ ...p, targetIndustries: v }))}
            placeholder="SaaS, FinTech, EdTech, E-commerce"
            hint="Comma-separated"
          />

          {/* Seniority */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-white/70">Minimum Seniority</label>
            <select
              value={persona.minSeniority}
              onChange={e => setPersona(p => ({ ...p, minSeniority: e.target.value }))}
              className="bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-violet-500/60 transition-all"
            >
              {['Junior', 'Mid', 'Senior', 'Director', 'VP', 'C-Suite', 'Any'].map(s => (
                <option key={s} value={s.toLowerCase()} className="bg-[#1a1a2e]">{s}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between">
        <div className={cn(
          'flex items-center gap-1.5 text-sm transition-all duration-300',
          saved ? 'text-green-400 opacity-100' : 'opacity-0'
        )}>
          <Check size={14} />
          <span>Persona saved</span>
        </div>
        <div className="flex gap-3">
          <Button variant="secondary" onClick={handleSave}>
            Save
          </Button>
          <Button
            onClick={() => { handleSave(); router.push('/results'); }}
            className="flex items-center gap-2"
          >
            Start Scoring
            <ChevronRight size={14} />
          </Button>
        </div>
      </div>
    </div>
  );
}
