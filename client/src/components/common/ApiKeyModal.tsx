import React, { useState, useEffect } from 'react';
import { X, Key, CheckCircle2, ShieldCheck, Cpu, Database, Save, Info } from 'lucide-react';
import { ApiService } from '../../services/apiService.js';
import { isFirebaseConfigured } from '../../services/firebase.js';

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ApiKeyModal: React.FC<ApiKeyModalProps> = ({ isOpen, onClose }) => {
  const [geminiKey, setGeminiKey] = useState('');
  const [status, setStatus] = useState<{ hasGeminiKey: boolean; hasYouTubeKey: boolean; geminiModel: string }>({
    hasGeminiKey: false,
    hasYouTubeKey: false,
    geminiModel: 'gemini-1.5-flash',
  });
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      ApiService.checkStatus().then(setStatus);
      setError(null);
      setSaveSuccess(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSaveGeminiKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!geminiKey.trim()) return;
    setSaving(true);
    setError(null);

    try {
      const ok = await ApiService.updateGeminiKey(geminiKey.trim());
      if (ok) {
        setSaveSuccess(true);
        setStatus((prev) => ({ ...prev, hasGeminiKey: true }));
        setGeminiKey('');
        setTimeout(() => setSaveSuccess(false), 3000);
      } else {
        setError('Could not update Gemini key.');
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to update key');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-lg bg-surface-card border border-surface-border rounded-2xl p-6 shadow-2xl space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-surface-border/60 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-brand-950 border border-brand-800 text-brand-400">
              <Key className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">System & API Credentials</h3>
              <p className="text-xs text-surface-muted">Secure backend credentials management</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-surface-muted hover:text-white hover:bg-surface-border transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current status indicators */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 rounded-xl bg-[#0E0E1B] border border-surface-border/60 space-y-1">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
              <Cpu className="w-4 h-4 text-brand-400" />
              <span>Gemini AI Engine</span>
            </div>
            <div className="flex items-center gap-1.5 text-[11px]">
              {status.hasGeminiKey ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400 font-medium">Active (Gemini 1.5/2.5)</span>
                </>
              ) : (
                <>
                  <Info className="w-3.5 h-3.5 text-cyan-400" />
                  <span className="text-cyan-400 font-medium">Smart Fallback NLP Ready</span>
                </>
              )}
            </div>
          </div>

          <div className="p-3 rounded-xl bg-[#0E0E1B] border border-surface-border/60 space-y-1">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
              <Database className="w-4 h-4 text-amber-400" />
              <span>Firebase Database</span>
            </div>
            <div className="flex items-center gap-1.5 text-[11px]">
              {isFirebaseConfigured ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400 font-medium">Cloud Firestore Connected</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-brand-400" />
                  <span className="text-brand-300 font-medium">Offline/Local Store Active</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Gemini Key Input Form */}
        <form onSubmit={handleSaveGeminiKey} className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-slate-200 mb-1.5">
              Google Gemini API Key
            </label>
            <input
              type="password"
              placeholder={status.hasGeminiKey ? "Key configured (enter to replace)..." : "AIzaSy..."}
              value={geminiKey}
              onChange={(e) => setGeminiKey(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-[#0E0E1B] border border-surface-border rounded-xl text-sm text-slate-100 placeholder-surface-muted/60 focus:outline-none focus:border-brand-500 font-mono"
            />
            <p className="mt-1 text-[11px] text-surface-muted">
              Keys are stored securely in backend server environment memory and never exposed to the frontend.
            </p>
          </div>

          {error && (
            <p className="text-xs text-rose-400 bg-rose-950/30 p-2 rounded-lg border border-rose-800/30">
              {error}
            </p>
          )}

          {saveSuccess && (
            <p className="text-xs text-emerald-400 bg-emerald-950/30 p-2 rounded-lg border border-emerald-800/30 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Gemini API Key activated successfully!</span>
            </p>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-surface-muted hover:text-white rounded-xl hover:bg-surface-border transition-colors"
            >
              Close
            </button>
            <button
              type="submit"
              disabled={saving || !geminiKey.trim()}
              className="px-4 py-2 bg-brand-600 hover:bg-brand-500 disabled:opacity-50 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-all shadow-md shadow-brand-600/20"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{saving ? 'Updating...' : 'Save & Connect'}</span>
            </button>
          </div>
        </form>

        {/* Security Notice */}
        <div className="p-3 rounded-xl bg-slate-900/50 border border-slate-800 flex items-start gap-2.5">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
          <p className="text-[11px] text-slate-400 leading-relaxed">
            <strong>Security Architecture:</strong> StudyMind AI enforces strict separation between client and server. No secret API keys are ever bundled into clientside scripts or network responses.
          </p>
        </div>
      </div>
    </div>
  );
};
