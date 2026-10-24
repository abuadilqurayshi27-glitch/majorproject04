import React, { useState, useEffect, useRef } from 'react';
import {
  Bell,
  CheckCircle,
  Clock,
  Sparkles,
  Unlock,
  AlertTriangle,
  ChevronRight,
  CheckCheck,
  X,
  Flame,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.js';
import { FirestoreService } from '../../services/firestoreService.js';
import { RevisionNotification } from '../../types/learning.js';

interface NotificationBellProps {
  onNavigate: (page: string) => void;
  onSelectVideoForRevision?: (videoId: string) => void;
}

export const NotificationBell: React.FC<NotificationBellProps> = ({
  onNavigate,
  onSelectVideoForRevision,
}) => {
  const { user } = useAuth();
  const uid = user?.uid || 'demo_student_studymind_01';

  const [notifications, setNotifications] = useState<RevisionNotification[]>([]);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const fetchNotifications = async () => {
    try {
      const list = await FirestoreService.checkAndGenerateRevisionNotifications(uid, true);
      setNotifications(list);
    } catch (e) {
      console.warn('Error fetching notifications:', e);
    }
  };

  useEffect(() => {
    fetchNotifications();

    // Check notifications periodically (every 30 seconds)
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [uid]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const handleMarkAsRead = async (notifId: string) => {
    await FirestoreService.markNotificationAsRead(uid, notifId);
    setNotifications((prev) =>
      prev.map((n) => (n.id === notifId ? { ...n, isRead: true } : n))
    );
  };

  const handleMarkAllRead = async () => {
    for (const n of notifications) {
      if (!n.isRead) {
        await FirestoreService.markNotificationAsRead(uid, n.id);
      }
    }
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const handleAction = async (notif: RevisionNotification) => {
    await handleMarkAsRead(notif.id);
    setIsOpen(false);
    if (notif.type === 'streak_motivational' || notif.type === 'streak_reminder') {
      onNavigate('home');
      return;
    }
    if (notif.videoId && onSelectVideoForRevision) {
      onSelectVideoForRevision(notif.videoId);
    }
    onNavigate('analysis');
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        onClick={() => {
          setIsOpen(!isOpen);
          fetchNotifications();
        }}
        className="relative p-2 text-surface-muted hover:text-white rounded-xl hover:bg-surface-card border border-transparent hover:border-surface-border transition-colors focus:outline-none"
        title="Learning & Consistency Notifications"
      >
        <Bell className="w-5 h-5 text-slate-300" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex items-center justify-center min-w-[18px] h-[18px] px-1 bg-gradient-to-r from-amber-500 to-brand-500 text-white text-[10px] font-black rounded-full shadow-lg shadow-amber-500/40 animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-[#0F0F1D] border border-surface-border shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95">
          {/* Header */}
          <div className="p-3.5 px-4 bg-[#131326] border-b border-surface-border flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-brand-400" />
              <span className="text-xs font-bold text-white">Smart Consistency & Revisions</span>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-brand-950 text-brand-300 border border-brand-800 text-[10px] font-bold">
                  {unreadCount} new
                </span>
              )}
            </div>

            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="text-[11px] text-surface-muted hover:text-brand-300 flex items-center gap-1 transition-colors"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                <span>Mark all read</span>
              </button>
            )}
          </div>

          {/* Notification List */}
          <div className="max-h-96 overflow-y-auto divide-y divide-surface-border/50 no-scrollbar">
            {notifications.length === 0 ? (
              <div className="p-8 text-center space-y-2">
                <Clock className="w-8 h-8 text-surface-muted mx-auto opacity-40" />
                <p className="text-xs font-medium text-slate-300">No notifications right now</p>
                <p className="text-[11px] text-surface-muted max-w-xs mx-auto leading-relaxed">
                  Study educational lessons to build your streak and receive smart spaced repetition notifications!
                </p>
              </div>
            ) : (
              notifications.map((notif) => {
                const isDue = notif.type === 'revision_due';
                const isStreak = notif.type === 'streak_motivational' || notif.type === 'streak_reminder';

                return (
                  <div
                    key={notif.id}
                    className={`p-3.5 sm:p-4 hover:bg-surface-cardHover/70 transition-colors flex gap-3 items-start ${
                      !notif.isRead ? 'bg-brand-950/20' : ''
                    }`}
                  >
                    {/* Icon */}
                    <div
                      className={`w-8 h-8 rounded-xl shrink-0 flex items-center justify-center mt-0.5 shadow-md ${
                        isDue
                          ? 'bg-amber-950/80 border border-amber-700/60 text-amber-400'
                          : isStreak
                          ? 'bg-orange-950/80 border border-orange-700/60 text-orange-400'
                          : 'bg-emerald-950/80 border border-emerald-700/60 text-emerald-400'
                      }`}
                    >
                      {isDue ? (
                        <Clock className="w-4 h-4" />
                      ) : isStreak ? (
                        <Flame className="w-4 h-4 fill-orange-400" />
                      ) : (
                        <Unlock className="w-4 h-4" />
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between gap-1">
                        <span
                          className={`text-xs font-bold leading-tight ${
                            isDue
                              ? 'text-amber-300'
                              : isStreak
                              ? 'text-orange-300'
                              : 'text-emerald-300'
                          }`}
                        >
                          {notif.title}
                        </span>
                        {!notif.isRead && (
                          <span className="w-2 h-2 rounded-full bg-brand-400 shrink-0" />
                        )}
                      </div>

                      <p className="text-[11px] text-slate-200 leading-snug">
                        {notif.message}
                      </p>

                      <div className="flex items-center justify-between pt-1 text-[10px] text-surface-muted">
                        <span>
                          {new Date(notif.createdAt).toLocaleDateString(undefined, {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>

                        <button
                          onClick={() => handleAction(notif)}
                          className={`px-2.5 py-1 rounded-lg font-bold transition-all flex items-center gap-1 ${
                            isStreak
                              ? 'bg-orange-600/30 hover:bg-orange-600 text-orange-300 hover:text-white'
                              : 'bg-brand-600/30 hover:bg-brand-600 text-brand-300 hover:text-white'
                          }`}
                        >
                          <span>{isStreak ? 'Study Now 🔥' : 'Start Revision'}</span>
                          <ChevronRight className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};
