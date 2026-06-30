'use client';
import { useState, useCallback } from 'react';
import { Zap, Download, CheckCircle, XCircle, Loader, AlertCircle } from 'lucide-react';
import { useAppStore, EnrichedProfile } from '@/lib/store';
import { exportToCSV } from '@/lib/csv';
import { Button, Badge, ScoreBar, cn } from '@/components/ui';

export default function EnrichmentPage() {
  const { state, dispatch } = useAppStore();
  const [enriching, setEnriching] = useState(false);
  const [error, setError] = useState('');

  const profiles = state.enrichedProfiles;
  const enriched = profiles.filter(p => p.enrichmentStatus === 'success');
  const failed = profiles.filter(p => p.enrichmentStatus === 'failed');

  const runEnrichment = useCallback(async () => {
    if (!profiles.length) return;
    setEnriching(true);
    setError('');

    // Mark all as pending
    dispatch({
      type: 'SET_ENRICHED_PROFILES',
      payload: profiles.map(p => ({ ...p, enrichmentStatus: 'pending' })),
    });

    const BATCH = 5;
    for (let i = 0; i < profiles.length; i += BATCH) {
      const batch = profiles.slice(i, i + BATCH);
      try {
        const res = await fetch('/api/enrich', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ profiles: batch, lushaApiKey: state.apiKeys.lusha }),
        });
        const data = await res.json();
        if (data.error) throw new Error(data.error);

        data.results.forEach((r: { id: string; email: string | null; phone: string | null; status: string }) => {
          dispatch({
            type: 'UPDATE_ENRICHED_PROFILE',
            payload: {
              id: r.id,
              email: r.email || undefined,
              phone: r.phone || undefined,
              enrichmentStatus: r.status === 'success' ? 'success' : 'failed',
            },
          });
        });
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Enrichment failed');
        setEnriching(false);
        return;
      }
    }
    setEnriching(false);
  }, [profiles, state.apiKeys.lusha, dispatch]);

  const handleExport = () => {
    const data = profiles.map(p => ({
      'First Name': p.firstName,
      'Last Name': p.lastName,
      'Title': p.title,
      'Company': p.company,
      'Location': p.location,
      'Industry': p.industry,
      'LinkedIn URL': p.linkedinUrl,
      'Score': p.score,
      'Tier': p.tier,
      'Reasoning': p.reasoning,
      'Email': p.email || '',
      'Phone': p.phone || '',
      'Enrichment Status': p.enrichmentStatus || '',
    }));
    exportToCSV(data as Record<string, unknown>[], `leadscore-enriched-${new Date().toISOString().split('T')[0]}.csv`);
  };

  const StatusIcon = ({ status }: { status: EnrichedProfile['enrichmentStatus'] }) => {
    if (status === 'success') return <CheckCircle size={14} className="text-green-400" />;
    if (status === 'failed') return <XCircle size={14} className="text-red-400" />;
    if (status === 'pending') return enriching ? <Loader size={14} className="text-violet-400 animate-spin" /> : <div className="w-3.5 h-3.5 rounded-full border border-white/20" />;
    return null;
  };

  return (
    <div className="min-h-screen p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 text-violet-400 text-sm font-medium mb-3">
          <Zap size={14} />
          <span>Step 4 of 4</span>
        </div>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">Enrich Contacts</h1>
            <p className="text-white/50">Fetch email and phone for your top-scored leads via Lusha.</p>
          </div>
          <div className="flex gap-3">
            {profiles.length > 0 && (
              <Button variant="secondary" onClick={handleExport} className="flex items-center gap-2">
                <Download size={14} />
                Export CSV
              </Button>
            )}
            <Button
              onClick={runEnrichment}
              disabled={enriching || profiles.length === 0}
              className="flex items-center gap-2"
            >
              {enriching ? (
                <>
                  <Loader size={14} className="animate-spin" />
                  Enriching...
                </>
              ) : (
                <>
                  <Zap size={14} />
                  Enrich All
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
      {profiles.length > 0 && (
        <div className="flex gap-4 mb-6">
          <div className="glass rounded-xl px-4 py-3 flex items-center gap-2">
            <span className="text-sm text-white/70">{profiles.length} profiles selected</span>
          </div>
          <div className="glass rounded-xl px-4 py-3 flex items-center gap-2">
            <CheckCircle size={13} className="text-green-400" />
            <span className="text-sm text-white/70">{enriched.length} enriched</span>
          </div>
          <div className="glass rounded-xl px-4 py-3 flex items-center gap-2">
            <XCircle size={13} className="text-red-400" />
            <span className="text-sm text-white/70">{failed.length} failed</span>
          </div>
          {profiles.length > 0 && (
            <div className="glass rounded-xl px-4 py-3 flex items-center gap-2">
              <div className="w-24 h-1.5 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-violet-500 to-blue-500 rounded-full transition-all"
                  style={{ width: `${((enriched.length + failed.length) / profiles.length) * 100}%` }}
                />
              </div>
              <span className="text-sm text-white/70 font-mono">{enriched.length + failed.length}/{profiles.length}</span>
            </div>
          )}
        </div>
      )}

      {/* Table */}
      {profiles.length > 0 ? (
        <div className="glass rounded-2xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/8">
                {['Name', 'Company', 'Score', 'Tier', 'Email', 'Phone', 'Status'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-medium text-white/40 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {profiles.map((p, i) => (
                <tr key={p.id} className={cn('border-b border-white/5 hover:bg-white/2 transition-colors', i % 2 === 0 ? '' : 'bg-white/1')}>
                  <td className="px-4 py-3">
                    <div className="text-white font-medium">{p.firstName} {p.lastName}</div>
                    <div className="text-white/40 text-xs">{p.title}</div>
                  </td>
                  <td className="px-4 py-3 text-white/60">{p.company || '—'}</td>
                  <td className="px-4 py-3 w-32"><ScoreBar score={p.score} /></td>
                  <td className="px-4 py-3"><Badge tier={p.tier} /></td>
                  <td className="px-4 py-3">
                    {p.email ? (
                      <span className="text-green-400 text-xs font-mono">{p.email}</span>
                    ) : (
                      <span className="text-white/25 text-xs">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {p.phone ? (
                      <span className="text-blue-400 text-xs font-mono">{p.phone}</span>
                    ) : (
                      <span className="text-white/25 text-xs">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <StatusIcon status={p.enrichmentStatus} />
                      <span className={cn(
                        'text-xs capitalize',
                        p.enrichmentStatus === 'success' ? 'text-green-400' :
                        p.enrichmentStatus === 'failed' ? 'text-red-400' : 'text-white/40'
                      )}>
                        {p.enrichmentStatus || 'pending'}
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="glass rounded-2xl p-16 text-center">
          <Zap size={40} className="text-white/20 mx-auto mb-4" />
          <p className="text-white/50">No profiles selected for enrichment</p>
          <p className="text-white/30 text-sm mt-1">Go to Score Profiles and click "Enrich Top Profiles"</p>
        </div>
      )}
    </div>
  );
}
