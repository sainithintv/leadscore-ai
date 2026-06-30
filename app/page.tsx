'use client';
import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Upload, FileText, ChevronRight, Table2, Sparkles } from 'lucide-react';
import { parseCSV, normalizeProfile } from '@/lib/csv';
import { useAppStore, Profile } from '@/lib/store';
import { Button, cn } from '@/components/ui';

export default function UploadPage() {
  const router = useRouter();
  const { state, dispatch } = useAppStore();
  const [dragging, setDragging] = useState(false);
  const [fileName, setFileName] = useState('');
  const [columns, setColumns] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const handleFile = useCallback(async (file: File) => {
    if (!file.name.endsWith('.csv')) return;
    setLoading(true);
    try {
      const rows = await parseCSV(file);
      const profiles: Profile[] = rows.map((row, i) => normalizeProfile(row, i) as Profile);
      dispatch({ type: 'SET_PROFILES', payload: profiles });
      setFileName(file.name);
      setColumns(rows.length > 0 ? Object.keys(rows[0]) : []);
    } finally {
      setLoading(false);
    }
  }, [dispatch]);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const onFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const profiles = state.profiles;
  const preview = profiles.slice(0, 5);

  return (
    <div className="min-h-screen p-8">
      {/* Header */}
      <div className="mb-10">
        <div className="flex items-center gap-2 text-violet-400 text-sm font-medium mb-3">
          <Sparkles size={14} />
          <span>Step 1 of 4</span>
        </div>
        <h1 className="text-4xl font-bold text-white mb-3 tracking-tight">
          Score Your LinkedIn Leads<br />
          <span className="bg-gradient-to-r from-violet-400 to-blue-400 bg-clip-text text-transparent">with AI</span>
        </h1>
        <p className="text-white/50 text-lg max-w-xl">
          Upload your Emelia CSV export, set your ideal customer persona, and let AI rank every profile for you.
        </p>
      </div>

      {/* Stats bar */}
      {profiles.length > 0 && (
        <div className="flex gap-4 mb-6">
          <div className="glass rounded-xl px-4 py-3 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-400" />
            <span className="text-sm text-white/70">{profiles.length} profiles loaded</span>
          </div>
          <div className="glass rounded-xl px-4 py-3 flex items-center gap-2">
            <Table2 size={14} className="text-white/40" />
            <span className="text-sm text-white/70">{columns.length} columns detected</span>
          </div>
          <div className="glass rounded-xl px-4 py-3 flex items-center gap-2">
            <FileText size={14} className="text-white/40" />
            <span className="text-sm text-white/70">{fileName}</span>
          </div>
        </div>
      )}

      {/* Drop Zone */}
      <div
        onDragOver={e => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        className={cn(
          'relative rounded-2xl border-2 border-dashed transition-all duration-200 cursor-pointer mb-8',
          dragging ? 'border-violet-500 bg-violet-500/10' : 'border-white/15 hover:border-white/30 hover:bg-white/2',
          profiles.length > 0 ? 'py-8' : 'py-16'
        )}
        onClick={() => document.getElementById('csv-input')?.click()}
      >
        <input
          id="csv-input"
          type="file"
          accept=".csv"
          className="hidden"
          onChange={onFileInput}
        />
        <div className="flex flex-col items-center gap-3 text-center px-8">
          {loading ? (
            <>
              <div className="w-12 h-12 rounded-2xl bg-violet-500/20 flex items-center justify-center">
                <div className="w-5 h-5 border-2 border-violet-400 border-t-transparent rounded-full animate-spin" />
              </div>
              <p className="text-white/60 text-sm">Parsing CSV...</p>
            </>
          ) : profiles.length > 0 ? (
            <>
              <div className="w-12 h-12 rounded-2xl bg-green-500/20 flex items-center justify-center">
                <FileText size={22} className="text-green-400" />
              </div>
              <div>
                <p className="text-white font-medium">{fileName}</p>
                <p className="text-white/50 text-sm">{profiles.length} profiles ready · Click to replace</p>
              </div>
            </>
          ) : (
            <>
              <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10">
                <Upload size={26} className="text-white/40" />
              </div>
              <div>
                <p className="text-white font-medium text-lg">Drop your CSV here</p>
                <p className="text-white/40 text-sm mt-1">or click to browse · Supports Emelia CSV exports</p>
              </div>
              <div className="mt-2 flex gap-2 text-xs text-white/30">
                <span className="glass rounded-lg px-2 py-1">First Name</span>
                <span className="glass rounded-lg px-2 py-1">Last Name</span>
                <span className="glass rounded-lg px-2 py-1">Job Title</span>
                <span className="glass rounded-lg px-2 py-1">Company</span>
                <span className="glass rounded-lg px-2 py-1">LinkedIn URL</span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Preview Table */}
      {preview.length > 0 && (
        <div className="glass rounded-2xl overflow-hidden mb-8 glow-purple">
          <div className="px-5 py-4 border-b border-white/8 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Table2 size={15} className="text-violet-400" />
              <span className="text-sm font-semibold text-white">Preview</span>
              <span className="text-xs text-white/40">First 5 rows</span>
            </div>
            <span className="text-xs text-white/30">{profiles.length} total rows</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/5">
                  {['Name', 'Title', 'Company', 'Location', 'Industry'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-medium text-white/40 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {preview.map((p, i) => (
                  <tr key={p.id} className={cn('border-b border-white/5', i % 2 === 0 ? 'bg-white/1' : '')}>
                    <td className="px-4 py-3 text-white font-medium">{p.firstName} {p.lastName}</td>
                    <td className="px-4 py-3 text-white/60 max-w-[200px] truncate">{p.title || '—'}</td>
                    <td className="px-4 py-3 text-white/60">{p.company || '—'}</td>
                    <td className="px-4 py-3 text-white/50">{p.location || '—'}</td>
                    <td className="px-4 py-3 text-white/50">{p.industry || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Continue */}
      <div className="flex justify-end">
        <Button
          disabled={profiles.length === 0}
          onClick={() => router.push('/setup')}
          className="flex items-center gap-2 px-6 py-3 text-base"
        >
          Continue
          <ChevronRight size={16} />
        </Button>
      </div>
    </div>
  );
}
