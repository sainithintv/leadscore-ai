'use client';
import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Play, Zap, ChevronRight, BarChart3, AlertCircle } from 'lucide-react';
import { useAppStore, ScoredProfile } from '@/lib/store';
import { Button, Badge, ScoreBar, cn } from '@/components/ui';

type FilterTier = 'all' | 'hot' | 'warm' | 'cold';

export default function ResultsPage() {
  const router = useRouter();
  const { state, dispatch } = useAppStore();
  const [scoring, setScoring] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState<FilterTier>('all');
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const profiles = state.profiles;
  const scored = state.scoredProfiles;

  const runScoring = useCallback(async () => {
    if (!profiles.length) return;
    setScoring(true);
    setError('');
    setProgress(0);

    const apiKey = state.apiKeys.aiModel === 'openai' ? state.apiKeys.openai : state.apiKeys.mistral;
    const BATCH = 10;
    const allScored: ScoredProfile[] = [];

    for (let i = 0; i < profiles.length; i += BATCH) {
      const batch = profiles.slice(i, i + BATCH);
      try {
        const res = await fetch('/api/score', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            profiles: batch,
            persona: state.persona,
            apiKey,
            model: state.apiKeys.aiModel,
          }),
        });
        const data = await res.json();
        if (data.error) throw new Error(data.error);

        const batchScored: ScoredProfile[] = batch.map((p, idx) => {
          const s = data.scores?.find((x: { index: number }) => x.index === idx) || { score: 50, tier: 'warm', reasoning: 'No score returned' };
          return { ...p, score: s.score ?? 50, tier: s.tier ?? 'warm', reasoning: s.reasoning ?? '' };
        });
        allScored.push(...batchScored);
        setProgress(Math.round((allScored.length / profiles.length) * 100));
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Scoring failed');
        setScoring(false);
        return;
      }
    }

    dispatch({ type: 'SET_SCORED_PROFILES', payload: allScored });
    setScoring(false);
  }, [profiles, state.apiKeys, state.persona, dispatch]);

  const filtered = scored
    .filter(p => filter === 'all' || p.tier === filter)
    .sort((a, b) => b.score - a.score);

  const hotCount = scored.filter(p => p.tier === 'hot').length;
  const warmCount = scored.filter(p => p.tier === 'warm').length;
  const coldCount = scored.filter(p => p.tier === 'cold').length;

  const toggleSelect = (id: string) => {
    setSelected(s => {
      const n = new Set(s);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  };

  const goToEnrichment = () => {
    const hotProfiles = scored.filter(p => p.tier === 'hot' || selected.has(p.id));
    dispatch({ type: 'SET_ENRICHED_PROFILES', payload: hotProfiles.map(p => ({ ...p, enrichmentStatus: 'pending' })) });
    router.push('/enrichment');
  };

  const SKELETON_COUNT = 6;

  return (
    <div className="min-h-screen p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 text-violet-400 text-sm font-medium mb-3">
          <BarChart3 size={14} />
          <span>Step 3 of 4</span>
        </div>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">Score Profiles</h1>
            <p className="text-white/50">AI ranks every profile against your persona.</p>
          </div>
          <div className="flex gap-3">
            {scored.length > 0 && (
              <Button
                variant="secondary"
                onClick={goToEnrichment}
                className="flex items-center gap-2"
              >
                <Zap size={14} />
                Enrich Top Profiles
                <ChevronRight size={14} />
              </Button>
            )}
            <Button
              onClick={runScoring}
              disabled={scoring || profiles.length === 0}
              className="flex items-center gap-2"
            >
              {scoring ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  Scoring... {progress}%
                </>
              ) : (
                <>
                  <Play size={14} />
                  {scored.length > 0 ? 'Re-run Scoring' : 'Run Scoring'}
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 mb-6 text-red-400 text-sm">
          <AlertCircle size={14} />
          {error}
        </div>
      )}

      {/* Progress */}
      {scoring && (
        <div className="glass rounded-2xl p-5 mb-6">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-white/70">Scoring profiles...</span>
            <span className="text-white font-mono">{Math.round(progress * profiles.length / 100)} / {profiles.length}</span>
          </div>
          <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-violet-500 to-blue-500 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Stats */}
      {scored.length > 0 && (
        <div className="grid grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Total', value: scored.length, color: 'text-white' },
            { label: 'Hot 🔥', value: hotCount, color: 'text-red-400' },
            { label: 'Warm ☀️', value: warmCount, color: 'text-amber-400' },
            { label: 'Cold ❄️', value: coldCount, color: 'text-blue-400' },
          ].map(s => (
            <div key={s.label} className="glass rounded-xl p-4 text-center">
              <div className={cn('text-2xl font-bold mb-1', s.color)}>{s.value}</div>
              <div className="text-xs text-white/40">{s.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Filter Tabs */}
      {scored.length > 0 && (
        <div className="flex gap-2 mb-4">
          {(['all', 'hot', 'warm', 'cold'] as FilterTier[]).map(t => (
            <button
              key={t}
              onClick={() => setFilter(t)}
              className={cn(
                'px-3 py-1.5 rounded-xl text-sm font-medium transition-all',
                filter === t ? 'bg-violet-600 text-white' : 'glass text-white/50 hover:text-white'
              )}
            >
              {t === 'all' ? `All (${scored.length})` : t === 'hot' ? `Hot 🔥 (${hotCount})` : t === 'warm' ? `Warm ☀️ (${warmCount})` : `Cold ❄️ (${coldCount})`}
            </button>
          ))}
        </div>
      )}

      {/* Table */}
      {(scoring || scored.length > 0) && (
        <div className="glass rounded-2xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/8">
                <th className="px-4 py-3 text-left w-8">
                  <input
                    type="checkbox"
                    className="accent-violet-500"
                    onChange={e => {
                      if (e.target.checked) setSelected(new Set(filtered.map(p => p.id)));
                      else setSelected(new Set());
                    }}
                  />
                </th>
                {['Name', 'Title', 'Company', 'Location', 'Score', 'Tier', 'Reasoning'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-medium text-white/40 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {scoring && !scored.length
                ? Array.from({ length: SKELETON_COUNT }).map((_, i) => (
                  <tr key={i} className="border-b border-white/5">
                    {Array.from({ length: 8 }).map((_, j) => (
                      <td key={j} className="px-4 py-3">
                        <div className="shimmer h-3 rounded-full" style={{ width: `${40 + Math.random() * 40}%` }} />
                      </td>
                    ))}
                  </tr>
                ))
                : filtered.map((p, i) => (
                  <tr key={p.id} className={cn('border-b border-white/5 hover:bg-white/2 transition-colors', i % 2 === 0 ? '' : 'bg-white/1')}>
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        className="accent-violet-500"
                        checked={selected.has(p.id)}
                        onChange={() => toggleSelect(p.id)}
                      />
                    </td>
                    <td className="px-4 py-3 text-white font-medium whitespace-nowrap">{p.firstName} {p.lastName}</td>
                    <td className="px-4 py-3 text-white/60 max-w-[160px] truncate">{p.title || '—'}</td>
                    <td className="px-4 py-3 text-white/60">{p.company || '—'}</td>
                    <td className="px-4 py-3 text-white/50">{p.location || '—'}</td>
                    <td className="px-4 py-3 w-32"><ScoreBar score={p.score} /></td>
                    <td className="px-4 py-3"><Badge tier={p.tier} /></td>
                    <td className="px-4 py-3 text-white/40 text-xs max-w-[240px]">
                      <span
                        onClick={() => setExpandedId(expandedId === p.id ? null : p.id)}
                        className={cn(
                          'cursor-pointer hover:text-white/70 transition-colors',
                          expandedId === p.id ? 'whitespace-normal' : 'line-clamp-2'
                        )}
                      >
                        {p.reasoning}
                      </span>
                      {p.reasoning && p.reasoning.length > 80 && (
                        <button
                          onClick={() => setExpandedId(expandedId === p.id ? null : p.id)}
                          className="block mt-0.5 text-violet-400/60 hover:text-violet-400 text-[10px] font-medium"
                        >
                          {expandedId === p.id ? 'Show less' : 'Read more'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              }
            </tbody>
          </table>
        </div>
      )}

      {/* Empty state */}
      {!scoring && !scored.length && profiles.length > 0 && (
        <div className="glass rounded-2xl p-16 text-center">
          <BarChart3 size={40} className="text-white/20 mx-auto mb-4" />
          <p className="text-white/50 mb-2">Ready to score {profiles.length} profiles</p>
          <p className="text-white/30 text-sm">Click "Run Scoring" to analyze profiles against your persona</p>
        </div>
      )}

      {!profiles.length && (
        <div className="glass rounded-2xl p-16 text-center">
          <BarChart3 size={40} className="text-white/20 mx-auto mb-4" />
          <p className="text-white/50">No profiles loaded</p>
          <p className="text-white/30 text-sm mt-1">Upload a CSV first</p>
        </div>
      )}
    </div>
  );
}
