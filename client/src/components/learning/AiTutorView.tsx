import React, { useState, useEffect, useRef } from 'react';
import {
  Send,
  Sparkles,
  Bot,
  User,
  Lightbulb,
  HelpCircle,
  RotateCcw,
  BookOpen,
  ArrowRight,
} from 'lucide-react';
import { usePlayer } from '../../context/PlayerContext.js';
import { useAuth } from '../../context/AuthContext.js';
import { ApiService } from '../../services/apiService.js';
import { FirestoreService } from '../../services/firestoreService.js';
import { TutorMessage } from '../../types/tutor.js';

const QUICK_ACTIONS = [
  { label: 'Explain simply', icon: Lightbulb },
  { label: 'Give example', icon: Sparkles },
  { label: 'Explain step-by-step', icon: BookOpen },
  { label: 'Where is it used?', icon: HelpCircle },
  { label: 'Why is it used?', icon: HelpCircle },
  { label: 'Test me', icon: ArrowRight },
];

export const AiTutorView: React.FC = () => {
  const { currentVideo, smartNotes, transcript } = usePlayer();
  const { user, profile } = useAuth();

  const [messages, setMessages] = useState<TutorMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load conversation history from Firestore if available
  useEffect(() => {
    if (user && currentVideo) {
      FirestoreService.getTutorConversation(user.uid, currentVideo.id).then((saved) => {
        if (saved && saved.length > 0) {
          setMessages(saved);
        } else {
          // Initialize friendly greeting
          setMessages([
            {
              id: 'msg-welcome',
              role: 'assistant',
              content: `Hello ${profile?.name || user?.displayName || 'there'}! I am your StudyMind AI Tutor for **${currentVideo.title}**.\n\nI have fully analyzed the video transcript and concepts. How can I assist your learning today? You can select any quick prompt below or ask me any question!`,
              timestamp: new Date().toISOString(),
            },
          ]);
        }
      });
    } else if (currentVideo) {
      setMessages([
        {
          id: 'msg-welcome',
          role: 'assistant',
          content: `Hello! I am your AI Tutor for **${currentVideo.title}**. Ask me any question or choose a quick action below!`,
          timestamp: new Date().toISOString(),
        },
      ]);
    }
  }, [currentVideo?.id, user?.uid]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSend = async (customMessage?: string, quickAction?: string) => {
    const textToSend = customMessage || inputText;
    if (!textToSend.trim() && !quickAction) return;

    const userMsg: TutorMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: quickAction ? `Can you please: "${quickAction}"?` : textToSend,
      timestamp: new Date().toISOString(),
      quickAction,
    };

    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInputText('');
    setLoading(true);

    try {
      const response = await ApiService.sendTutorMessage({
        message: textToSend,
        quickAction,
        videoTitle: currentVideo?.title || 'Educational Lesson',
        notes: smartNotes || undefined,
        transcriptSnippet: transcript.slice(0, 5).map((t) => t.text).join(' '),
        history: newMessages,
        studentProfile: profile ? {
          name: profile.name,
          education: profile.education,
          course: profile.course,
          learningGoal: profile.learningGoal,
          learningLevel: profile.learningLevel,
        } : undefined,
      });

      const assistantMsg: TutorMessage = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: response.reply,
        timestamp: response.timestamp || new Date().toISOString(),
      };

      const finalMessages = [...newMessages, assistantMsg];
      setMessages(finalMessages);

      if (user && currentVideo) {
        FirestoreService.saveTutorConversation(user.uid, currentVideo.id, finalMessages);
      }
    } catch (err: any) {
      const errMsg: TutorMessage = {
        id: `err-${Date.now()}`,
        role: 'assistant',
        content: `I'm having a brief issue reaching the tutor model. However, you can review the Smart Notes or try asking again in a moment!`,
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleResetChat = () => {
    if (currentVideo) {
      const initial: TutorMessage[] = [
        {
          id: `msg-reset-${Date.now()}`,
          role: 'assistant',
          content: `Chat reset. What concept from **${currentVideo.title}** should we explore next?`,
          timestamp: new Date().toISOString(),
        },
      ];
      setMessages(initial);
      if (user) {
        FirestoreService.saveTutorConversation(user.uid, currentVideo.id, initial);
      }
    }
  };

  return (
    <div className="flex flex-col h-[600px] rounded-2xl bg-surface-card border border-surface-border overflow-hidden shadow-2xl">
      {/* Tutor Header */}
      <div className="px-4 py-3 bg-[#0E0E1B] border-b border-surface-border/80 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-brand-600/30 border border-brand-500/40 flex items-center justify-center text-brand-300">
            <Bot className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
              <span>StudyMind AI Tutor</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            </h4>
            <p className="text-[10px] text-surface-muted truncate max-w-xs">
              Context: {currentVideo?.title || 'Video Lesson'}
            </p>
          </div>
        </div>

        <button
          onClick={handleResetChat}
          className="p-1.5 rounded-lg text-surface-muted hover:text-white hover:bg-surface-card transition-colors text-xs flex items-center gap-1"
          title="Reset conversation"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span className="hidden sm:inline text-[11px]">Clear</span>
        </button>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => {
          const isUser = msg.role === 'user';
          return (
            <div
              key={msg.id}
              className={`flex items-start gap-2.5 ${isUser ? 'justify-end' : 'justify-start'}`}
            >
              {!isUser && (
                <div className="w-7 h-7 rounded-xl bg-brand-950 border border-brand-800 text-brand-400 flex items-center justify-center shrink-0 mt-0.5">
                  <Bot className="w-3.5 h-3.5" />
                </div>
              )}

              <div
                className={`max-w-[85%] p-3.5 rounded-2xl text-xs leading-relaxed ${
                  isUser
                    ? 'bg-brand-600 text-white rounded-tr-none shadow-md shadow-brand-600/20'
                    : 'bg-[#0E0E1B] text-slate-200 border border-surface-border/70 rounded-tl-none whitespace-pre-line'
                }`}
              >
                {msg.content}
              </div>

              {isUser && (
                <div className="w-7 h-7 rounded-xl bg-indigo-950 border border-indigo-800 text-indigo-300 flex items-center justify-center shrink-0 mt-0.5">
                  <User className="w-3.5 h-3.5" />
                </div>
              )}
            </div>
          );
        })}

        {loading && (
          <div className="flex items-start gap-2.5">
            <div className="w-7 h-7 rounded-xl bg-brand-950 border border-brand-800 text-brand-400 flex items-center justify-center shrink-0">
              <Bot className="w-3.5 h-3.5" />
            </div>
            <div className="p-3.5 rounded-2xl bg-[#0E0E1B] border border-surface-border/70 rounded-tl-none text-xs text-brand-300 flex items-center gap-2">
              <div className="w-3 h-3 border-2 border-brand-400/30 border-t-brand-400 rounded-full animate-spin" />
              <span>Analyzing video context & composing answer...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Action Prompt Chips */}
      <div className="px-3 py-2 bg-[#0E0E1B]/60 border-t border-surface-border/50 overflow-x-auto flex items-center gap-1.5 no-scrollbar">
        <span className="text-[10px] font-bold uppercase tracking-wider text-surface-muted shrink-0 mr-1">
          Prompts:
        </span>
        {QUICK_ACTIONS.map((action, idx) => {
          const Icon = action.icon;
          return (
            <button
              key={idx}
              type="button"
              disabled={loading}
              onClick={() => handleSend(action.label, action.label)}
              className="px-2.5 py-1 rounded-xl bg-surface-card hover:bg-brand-950 hover:text-brand-300 border border-surface-border hover:border-brand-700/60 text-[11px] font-semibold text-slate-300 whitespace-nowrap flex items-center gap-1 transition-all shrink-0"
            >
              <Icon className="w-3 h-3 text-brand-400" />
              <span>{action.label}</span>
            </button>
          );
        })}
      </div>

      {/* Input Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="p-3 bg-[#0E0E1B] border-t border-surface-border/80 flex items-center gap-2"
      >
        <input
          type="text"
          placeholder="Ask AI Tutor anything about this video..."
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          disabled={loading}
          className="flex-1 px-3.5 py-2.5 bg-surface-card border border-surface-border rounded-xl text-xs text-white placeholder-surface-muted/60 focus:outline-none focus:border-brand-500"
        />
        <button
          type="submit"
          disabled={loading || !inputText.trim()}
          className="p-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 disabled:opacity-40 text-white transition-all shadow-md shadow-brand-600/20 shrink-0"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
