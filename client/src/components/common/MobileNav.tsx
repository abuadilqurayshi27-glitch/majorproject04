import React from 'react';
import { Home, Mic, BarChart3, User, GraduationCap } from 'lucide-react';
import { usePlayer } from '../../context/PlayerContext.js';

interface MobileNavProps {
  activePage: string;
  onNavigate: (page: string) => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({ activePage, onNavigate }) => {
  const { currentVideo } = usePlayer();

  const navItems = [
    { id: 'home', label: 'HOME', icon: Home },
    ...(currentVideo
      ? [{ id: 'learn', label: 'STUDY', icon: GraduationCap, badge: true }]
      : []),
    { id: 'voice', label: 'VOICE TUTOR', icon: Mic, isVoice: true },
    { id: 'analysis', label: 'ANALYZE', icon: BarChart3 },
    { id: 'profile', label: 'PROFILE', icon: User },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#0E0E1B]/95 backdrop-blur-lg border-t border-surface-border/80 px-2 py-1.5 safe-area-bottom">
      <div className="flex items-center justify-around max-w-md mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activePage === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all relative ${
                isActive
                  ? 'text-brand-300 font-bold'
                  : 'text-surface-muted hover:text-slate-200'
              }`}
            >
              {/* Highlight active pill background */}
              {isActive && (
                <span className="absolute inset-0 bg-brand-600/20 border border-brand-500/30 rounded-xl -z-10 shadow-sm shadow-brand-500/10" />
              )}

              {item.isVoice ? (
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center transition-transform ${
                    isActive
                      ? 'bg-gradient-to-tr from-brand-600 to-indigo-500 text-white scale-110 shadow-md shadow-brand-500/30'
                      : 'bg-surface-card text-brand-400'
                  }`}
                >
                  <Icon className="w-4 h-4 animate-pulse" />
                </div>
              ) : (
                <Icon
                  className={`w-5 h-5 mb-0.5 transition-transform ${
                    isActive ? 'scale-110 text-brand-400' : ''
                  }`}
                />
              )}

              <span className="text-[9px] tracking-wider uppercase">
                {item.label}
              </span>

              {/* In-session indicator dot */}
              {item.badge && !isActive && (
                <span className="absolute top-1 right-2 w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
