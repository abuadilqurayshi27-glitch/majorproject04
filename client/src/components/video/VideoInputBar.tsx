import React, { useState } from 'react';
import { Sparkles, ArrowRight, Video, CheckCircle2, PlayCircle, Languages, Globe } from 'lucide-react';
import { usePlayer } from '../../context/PlayerContext.js';
import { ApiService } from '../../services/apiService.js';

interface VideoInputBarProps {
  onSuccess: () => void;
}

const SUPPORTED_LANGUAGES = [
  { code: 'original', label: 'Original', nativeLabel: 'Auto-Preserve Original' },
  { code: 'en', label: 'English', nativeLabel: 'English' },
  { code: 'hi', label: 'Hindi', nativeLabel: 'हिन्दी' },
  { code: 'kn', label: 'Kannada', nativeLabel: 'ಕನ್ನಡ' },
  { code: 'ur', label: 'Urdu', nativeLabel: 'اردو' },
  { code: 'bn', label: 'Bengali', nativeLabel: 'বাংলা' },
];

const SAMPLE_EDUCATIONAL_VIDEOS = [
  {
    title: 'SQL Database Indexing',
    url: 'https://www.youtube.com/watch?v=fsG1XaZEa78',
    channel: 'Socratica',
    tag: 'DBMS',
  },
  {
    title: 'Database Normalization',
    url: 'https://www.youtube.com/watch?v=GFQaEYEc8_8',
    channel: 'FreeCodeCamp',
    tag: 'Database',
  },
  {
    title: 'Python OOP Tutorial',
    url: 'https://www.youtube.com/watch?v=ZDa-Z5JzLYM',
    channel: 'Corey Schafer',
    tag: 'Python',
  },
  {
    title: 'How The Internet Works',
    url: 'https://www.youtube.com/watch?v=7_LPdttKXPc',
    channel: 'NetworkChuck',
    tag: 'Networking',
  },
];

export const VideoInputBar: React.FC<VideoInputBarProps> = ({ onSuccess }) => {
  const [url, setUrl] = useState('');
  const [identifiedTopic, setIdentifiedTopic] = useState<string | null>(null);
  const [detectedLanguage, setDetectedLanguage] = useState<string | null>(null);
  const [isIdentifying, setIsIdentifying] = useState<boolean>(false);
  const { loadAndAnalyzeVideo, isAnalyzing, analysisStep, error, selectedLanguage, setSelectedLanguage } = usePlayer();

  const autoIdentifyTopic = async (inputUrl: string) => {
    if (!inputUrl || !inputUrl.trim()) return;
    const trimmed = inputUrl.trim();
    const isYouTube = /(?:youtube\.com\/(?:watch\?v=|shorts\/)|youtu\.be\/|^[a-zA-Z0-9_-]{11}$)/.test(trimmed);
    if (!isYouTube) return;

    setIsIdentifying(true);
    try {
      const res = await ApiService.identifyTopic(trimmed);
      if (res && res.topic) {
        setIdentifiedTopic(res.topic);
      }
      if (res && res.detectedLanguage) {
        setDetectedLanguage(res.detectedLanguage);
      }
    } catch (err) {
      console.warn('Auto topic identification error:', err);
    } finally {
      setIsIdentifying(false);
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const text = e.clipboardData.getData('text');
    if (text && text.trim()) {
      autoIdentifyTopic(text.trim());
    }
  };

  const handleAnalyze = async (inputUrl: string) => {
    const target = inputUrl || url;
    if (!target.trim()) return;
    const ok = await loadAndAnalyzeVideo(target.trim(), selectedLanguage);
    if (ok) {
      setUrl('');
      setIdentifiedTopic(null);
      setDetectedLanguage(null);
      onSuccess();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleAnalyze(url);
  };

  return (
    <div className="w-full max-w-3xl mx-auto space-y-3.5">
      {/* Primary URL Input Card */}
      <form
        onSubmit={handleSubmit}
        className="relative flex flex-col sm:flex-row items-center gap-2 p-2 sm:p-2.5 rounded-2xl bg-surface-card border border-surface-border shadow-2xl focus-within:border-brand-500 focus-within:ring-2 focus-within:ring-brand-500/20 transition-all"
      >
        <div className="flex items-center gap-2.5 pl-3 w-full sm:w-auto flex-1">
          <div className="w-8 h-8 rounded-lg bg-red-600/10 border border-red-500/20 flex items-center justify-center shrink-0">
            <Video className="w-4 h-4 text-red-400" />
          </div>
          <input
            type="text"
            disabled={isAnalyzing}
            placeholder="Paste YouTube URL (e.g. https://www.youtube.com/watch?v=...)"
            value={url}
            onPaste={handlePaste}
            onChange={(e) => {
              const val = e.target.value;
              setUrl(val);
              if (val.trim().length > 10 && !isIdentifying && !identifiedTopic) {
                autoIdentifyTopic(val.trim());
              }
            }}
            className="w-full bg-transparent text-sm text-slate-100 placeholder-surface-muted/60 focus:outline-none"
          />
        </div>

        <button
          type="submit"
          disabled={isAnalyzing || !url.trim()}
          className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-brand-600 via-indigo-600 to-purple-600 hover:from-brand-500 hover:to-indigo-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-brand-600/30 shrink-0"
        >
          {isAnalyzing ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Analyzing Video...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>Generate Smart Lesson</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </>
          )}
        </button>
      </form>

      {/* Language Selector Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-3.5 py-2.5 rounded-xl bg-surface-card border border-surface-border text-xs">
        <div className="flex items-center gap-1.5 text-slate-300 font-medium">
          <Languages className="w-4 h-4 text-brand-400" />
          <span>Lesson Language:</span>
        </div>
        <div className="flex items-center gap-1.5 flex-wrap">
          {SUPPORTED_LANGUAGES.map((lang) => {
            const isSelected = selectedLanguage === lang.code;
            return (
              <button
                key={lang.code}
                type="button"
                disabled={isAnalyzing}
                onClick={() => setSelectedLanguage(lang.code)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all border ${
                  isSelected
                    ? 'bg-brand-600 text-white border-brand-500 shadow-sm shadow-brand-500/30'
                    : 'bg-[#0E0E1B] text-slate-300 hover:text-white border-surface-border hover:border-brand-500/40'
                }`}
                title={lang.nativeLabel}
              >
                <span>{lang.nativeLabel}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Automatically identified topic when a YouTube link is pasted: ONLY Topic: [main topic] & Language detection badge */}
      {(isIdentifying || identifiedTopic) && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-4 py-2.5 rounded-xl bg-surface-card border border-brand-500/50 shadow-md animate-in fade-in">
          {isIdentifying ? (
            <div className="flex items-center gap-2 text-xs text-brand-300 font-mono">
              <div className="w-3.5 h-3.5 border-2 border-brand-400/30 border-t-brand-400 rounded-full animate-spin shrink-0" />
              <span>Identifying main topic & language...</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-xs font-bold text-brand-200 font-mono tracking-wide">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
              <span>{identifiedTopic}</span>
            </div>
          )}

          {detectedLanguage && !isIdentifying && (
            <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-300 bg-[#0E0E1B] px-2.5 py-1 rounded-lg border border-surface-border/80">
              <Globe className="w-3 h-3 text-cyan-400 shrink-0" />
              <span>
                Detected: <strong className="text-cyan-300 font-bold">{detectedLanguage}</strong>
                {detectedLanguage.toLowerCase() !== 'english' ? ' → English Smart Notes' : ' • English Smart Notes'}
              </span>
              <span className="text-emerald-400 text-[10px] font-semibold">
                (English Only)
              </span>
            </div>
          )}
        </div>
      )}

      {/* Progress status while analyzing */}
      {isAnalyzing && (
        <div className="p-3.5 rounded-xl bg-brand-950/40 border border-brand-800/40 flex items-center gap-3 animate-in fade-in">
          <div className="w-5 h-5 border-2 border-brand-400/30 border-t-brand-400 rounded-full animate-spin shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-brand-200">{analysisStep}</p>
            <p className="text-[10px] text-surface-muted truncate">
              Grounding concepts in video transcript, generating flashcards, formulas & quiz...
            </p>
          </div>
        </div>
      )}

      {/* Error message */}
      {error && (
        <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-800/40 text-xs text-rose-300">
          ⚠️ {error}
        </div>
      )}

      {/* Sample Quick-Start Chips */}
      <div className="space-y-1.5 pt-1">
        <p className="text-[11px] font-semibold text-surface-muted uppercase tracking-wider text-center sm:text-left">
          Or try a curated educational sample video:
        </p>
        <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
          {SAMPLE_EDUCATIONAL_VIDEOS.map((item, idx) => (
            <button
              key={idx}
              type="button"
              disabled={isAnalyzing}
              onClick={() => {
                setUrl(item.url);
                handleAnalyze(item.url);
              }}
              className="group flex items-center gap-2 px-3 py-1.5 rounded-xl bg-surface-card hover:bg-surface-cardHover border border-surface-border hover:border-brand-500/50 text-xs text-slate-300 transition-all text-left"
            >
              <PlayCircle className="w-3.5 h-3.5 text-brand-400 group-hover:scale-110 transition-transform" />
              <span className="font-medium text-slate-200">{item.title}</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-brand-950 text-brand-300 border border-brand-800/40">
                {item.tag}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
