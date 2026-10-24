import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Search,
  Key,
  Flame,
  User as UserIcon,
  LogOut,
  Settings,
  Compass,
  Zap,
  Edit3,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.js';
import { usePlayer } from '../../context/PlayerContext.js';
import { FirestoreService } from '../../services/firestoreService.js';
import { NotificationBell } from './NotificationBell.js';
import { StudyMindLogo } from './StudyMindLogo.js';

interface NavbarProps {
  onOpenAuth: () => void;
  onOpenSettings: () => void;
  onNavigate: (page: string) => void;
  onEditProfile?: () => void;
  activePage: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenAuth,
  onOpenSettings,
  onNavigate,
  onEditProfile,
  activePage,
}) => {
  const { user, profile, logout } = useAuth();
  const { loadAndAnalyzeVideo, isAnalyzing } = usePlayer();
  const [urlInput, setUrlInput] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [dayStreak, setDayStreak] = useState<number>(0);

  useEffect(() => {
    if (!user) {
      setDayStreak(0);
      return;
    }
    FirestoreService.getStudentAnalytics(user.uid)
      .then((data) => setDayStreak(data.dayStreak))
      .catch(() => setDayStreak(0));
  }, [user]);

  const handleSearchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!urlInput.trim()) return;
    const success = await loadAndAnalyzeVideo(urlInput.trim());
    if (success) {
      onNavigate('learn');
      setUrlInput('');
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-surface-border bg-[#0B0B14]/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 h-16 flex items-center justify-between gap-2 sm:gap-4">
        {/* Brand Logo */}
        <button
          onClick={() => onNavigate('home')}
          className="flex items-center gap-2.5 group focus:outline-none shrink-0"
        >
          <StudyMindLogo size="md" variant="badge" />
          <div className="flex flex-col text-left">
            <span className="font-extrabold text-lg sm:text-xl tracking-tight bg-gradient-to-r from-white via-slate-200 to-brand-300 bg-clip-text text-transparent">
              StudyMind<span className="text-brand-400">.AI</span>
            </span>
            <span className="text-[10px] text-surface-muted hidden sm:block -mt-1 tracking-wider uppercase font-semibold">
              YouTube to Mastery
            </span>
          </div>
        </button>

        {/* Global YouTube Paste / Search Bar */}
        <form
          onSubmit={handleSearchSubmit}
          className="flex-1 max-w-xl mx-2 hidden md:flex items-center relative"
        >
          <div className="relative w-full">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-surface-muted">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              placeholder="Paste any YouTube educational URL (e.g. DBMS, Python, System Design)..."
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              className="w-full pl-10 pr-24 py-2 text-sm bg-surface-card border border-surface-border rounded-full text-slate-100 placeholder-surface-muted/70 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all"
            />
            <button
              type="submit"
              disabled={isAnalyzing || !urlInput.trim()}
              className="absolute right-1 top-1 bottom-1 px-3 bg-brand-600 hover:bg-brand-500 disabled:opacity-50 text-white rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm"
            >
              {isAnalyzing ? (
                <>
                  <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Analyzing...</span>
                </>
              ) : (
                <>
                  <Zap className="w-3.5 h-3.5 text-amber-300 fill-amber-300" />
                  <span>Analyze</span>
                </>
              )}
            </button>
          </div>
        </form>

        {/* Right Action Icons & Profile */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Quick learning streak badge */}
          <div
            onClick={() => onNavigate('analyze')}
            className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-brand-950/60 border border-brand-800/40 text-xs font-medium text-brand-300 cursor-pointer hover:border-brand-500/50 transition-colors"
            title="View detailed learning analytics"
          >
            <Flame className={`w-4 h-4 ${dayStreak > 0 ? 'text-orange-400 fill-orange-400 animate-bounce' : 'text-surface-muted'}`} />
            <span>{dayStreak} Day Streak</span>
          </div>

          {/* Revision Notifications Bell */}
          <NotificationBell onNavigate={onNavigate} />

          {/* Settings / API Key Button */}
          <button
            onClick={onOpenSettings}
            title="Configure AI & Settings"
            className="p-2 text-surface-muted hover:text-slate-100 rounded-lg hover:bg-surface-card border border-transparent hover:border-surface-border transition-colors"
          >
            <Key className="w-4 h-4 text-brand-400" />
          </button>

          {/* User Account / Auth Dropdown */}
          {user ? (
            <div className="relative">
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center gap-2 p-1 rounded-full border border-surface-border hover:border-brand-500 transition-colors focus:outline-none"
              >
                <img
                  src={
                    profile?.photoURL ||
                    user.photoURL ||
                    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'
                  }
                  alt={user.displayName}
                  className="w-8 h-8 rounded-full object-cover"
                />
              </button>

              {isDropdownOpen && (
                <div
                  className="absolute right-0 mt-2 w-56 rounded-xl bg-surface-card border border-surface-border shadow-2xl py-2 z-50 animate-in fade-in zoom-in-95"
                  onMouseLeave={() => setIsDropdownOpen(false)}
                >
                  <div className="px-4 py-2 border-b border-surface-border/50">
                    <p className="text-sm font-semibold text-white truncate">
                      {profile?.name || user.displayName}
                    </p>
                    <p className="text-xs text-surface-muted truncate">{user.email}</p>
                    <span className="inline-block mt-1 text-[10px] px-2 py-0.5 bg-brand-900/50 text-brand-300 rounded font-medium border border-brand-700/30">
                      {profile?.learningLevel || 'Intermediate'} Learner
                    </span>
                  </div>

                  <button
                    onClick={() => {
                      onNavigate('profile');
                      setIsDropdownOpen(false);
                    }}
                    className="w-full text-left px-4 py-2 text-xs text-slate-200 hover:bg-surface-cardHover flex items-center gap-2"
                  >
                    <UserIcon className="w-3.5 h-3.5 text-brand-400" />
                    <span>My Student Profile</span>
                  </button>

                  {onEditProfile && (
                    <button
                      onClick={() => {
                        onEditProfile();
                        setIsDropdownOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 text-xs text-slate-200 hover:bg-surface-cardHover flex items-center gap-2"
                    >
                      <Edit3 className="w-3.5 h-3.5 text-indigo-400" />
                      <span>Edit Profile & Goals</span>
                    </button>
                  )}

                  <button
                    onClick={() => {
                      onNavigate('analysis');
                      setIsDropdownOpen(false);
                    }}
                    className="w-full text-left px-4 py-2 text-xs text-slate-200 hover:bg-surface-cardHover flex items-center gap-2"
                  >
                    <Compass className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Learning Analytics</span>
                  </button>

                  <button
                    onClick={() => {
                      onOpenSettings();
                      setIsDropdownOpen(false);
                    }}
                    className="w-full text-left px-4 py-2 text-xs text-slate-200 hover:bg-surface-cardHover flex items-center gap-2"
                  >
                    <Settings className="w-3.5 h-3.5 text-amber-400" />
                    <span>API & Database Setup</span>
                  </button>

                  <div className="border-t border-surface-border/50 my-1" />

                  <button
                    onClick={() => {
                      logout();
                      setIsDropdownOpen(false);
                    }}
                    className="w-full text-left px-4 py-2 text-xs text-rose-400 hover:bg-rose-950/20 flex items-center gap-2"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Log Out</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={onOpenAuth}
              className="px-4 py-1.5 rounded-full bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white text-xs font-semibold shadow-md shadow-brand-600/20 transition-all flex items-center gap-1.5"
            >
              <UserIcon className="w-3.5 h-3.5" />
              <span>Sign In</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
