import React from 'react';
import {
  Home,
  GraduationCap,
  Mic,
  BarChart3,
  User,
  History,
  Sparkles,
  BookOpen,
} from 'lucide-react';
import { usePlayer } from '../../context/PlayerContext.js';

interface SidebarProps {
  activePage: string;
  onNavigate: (page: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activePage, onNavigate }) => {
  const { currentVideo } = usePlayer();

  const navItems = [
    { id: 'home', label: 'Home', icon: Home },
    {
      id: 'learn',
      label: 'Study Room',
      icon: GraduationCap,
      badge: currentVideo ? 'Active' : undefined,
    },
    { id: 'voice', label: 'Voice Tutor', icon: Mic, glow: true },
    { id: 'analysis', label: 'Analyze', icon: BarChart3 },
    { id: 'profile', label: 'Profile', icon: User },
  ];

  return (
    <aside className="hidden md:flex flex-col w-60 h-full border-r border-surface-border bg-[#0B0B14] p-4 shrink-0 justify-between select-none overflow-y-auto">
      <div className="space-y-6">
        {/* Navigation list */}
        <div className="space-y-1">
          <p className="px-3 text-[11px] font-semibold uppercase tracking-wider text-surface-muted/60 mb-2">
            Main Menu
          </p>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activePage === item.id;

            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-brand-600/20 text-brand-300 border border-brand-500/30 shadow-sm'
                    : 'text-slate-300 hover:bg-surface-card hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-4 h-4 ${
                      isActive
                        ? 'text-brand-400'
                        : item.glow
                        ? 'text-purple-400 animate-pulse'
                        : 'text-surface-muted'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>

                {item.badge && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-semibold border border-emerald-500/30 animate-pulse">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Current video quick preview if in session */}
        {currentVideo && activePage !== 'learn' && (
          <div className="p-3 rounded-xl bg-surface-card border border-surface-border/80">
            <div className="flex items-center gap-1.5 text-xs text-brand-400 font-semibold mb-2">
              <BookOpen className="w-3.5 h-3.5" />
              <span>In Progress Lesson</span>
            </div>
            <div className="flex items-center gap-2.5">
              <img
                src={currentVideo.thumbnail}
                alt={currentVideo.title}
                className="w-14 h-10 object-cover rounded-md border border-surface-border"
              />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-slate-200 truncate">
                  {currentVideo.title}
                </p>
                <p className="text-[10px] text-surface-muted truncate">
                  {currentVideo.channel}
                </p>
              </div>
            </div>
            <button
              onClick={() => onNavigate('learn')}
              className="mt-2.5 w-full py-1 text-center text-xs font-semibold text-brand-300 bg-brand-950/60 hover:bg-brand-900/60 border border-brand-800/40 rounded-lg transition-colors"
            >
              Resume Learning →
            </button>
          </div>
        )}
      </div>

      {/* Bottom Pro Card */}
      <div className="p-3.5 rounded-2xl bg-gradient-to-br from-brand-950/60 via-purple-950/40 to-[#121226] border border-brand-800/30">
        <div className="flex items-center gap-2 text-brand-300 mb-1.5">
          <Sparkles className="w-4 h-4 text-brand-400" />
          <span className="text-xs font-bold">StudyMind Grounding</span>
        </div>
        <p className="text-[11px] text-surface-muted leading-relaxed">
          All smart notes & quizzes are mathematically anchored to actual video captions.
        </p>
      </div>
    </aside>
  );
};
