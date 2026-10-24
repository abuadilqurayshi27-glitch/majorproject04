import React, { useState } from 'react';
import { X, Sparkles, Mail, Lock, User, ArrowRight, UserCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.js';
import { StudyMindLogo } from '../common/StudyMindLogo.js';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { loginWithGoogle, loginWithEmail, signupWithEmail, loginAsDemoStudent } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isSignUp) {
        if (!name.trim()) throw new Error('Please enter your full name');
        await signupWithEmail(email, password, name);
      } else {
        await loginWithEmail(email, password);
      }
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setError(null);
      setLoading(true);
      await loginWithGoogle();
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Google sign in failed');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoSignIn = async () => {
    try {
      setLoading(true);
      await loginAsDemoStudent();
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Demo login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-md bg-surface-card border border-surface-border rounded-2xl p-6 shadow-2xl space-y-5">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-surface-muted hover:text-white hover:bg-surface-border transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Brand Header */}
        <div className="text-center space-y-1.5 pt-2">
          <div className="inline-flex justify-center mb-1">
            <StudyMindLogo size="lg" variant="badge" />
          </div>
          <h2 className="text-xl font-extrabold text-white">
            {isSignUp ? 'Join StudyMind AI' : 'Welcome to StudyMind AI'}
          </h2>
          <p className="text-xs text-surface-muted max-w-xs mx-auto">
            Transform educational videos into structured Smart Notes, dynamic Flashcards, and AI Tutoring.
          </p>
        </div>

        {/* Quick Demo Student Button */}
        <button
          type="button"
          onClick={handleDemoSignIn}
          disabled={loading}
          className="w-full py-2.5 px-4 bg-gradient-to-r from-emerald-600/20 via-emerald-500/10 to-teal-600/20 hover:from-emerald-600/30 hover:to-teal-600/30 border border-emerald-500/40 rounded-xl text-emerald-300 text-xs font-semibold flex items-center justify-center gap-2 transition-all shadow-sm"
        >
          <UserCheck className="w-4 h-4 text-emerald-400" />
          <span>Instant One-Click Demo Student Access</span>
        </button>

        {/* Divider */}
        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-surface-border" />
          <span className="text-[11px] text-surface-muted uppercase font-medium">Or continue with</span>
          <div className="flex-1 h-px bg-surface-border" />
        </div>

        {/* Google Login Button */}
        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={loading}
          className="w-full py-2.5 px-4 bg-surface-card hover:bg-surface-cardHover border border-surface-border rounded-xl text-slate-100 text-xs font-semibold flex items-center justify-center gap-2.5 transition-all shadow-sm"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.65v3h3.88c2.27-2.09 3.665-5.17 3.665-9.09z"
            />
            <path
              fill="#34A853"
              d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.1C3.28 21.43 7.36 24 12 24z"
            />
            <path
              fill="#FBBC05"
              d="M5.28 14.32c-.25-.72-.38-1.49-.38-2.32s.13-1.6.38-2.32V6.58H1.25C.45 8.17 0 9.99 0 12s.45 3.83 1.25 5.42l4.03-3.1z"
            />
            <path
              fill="#EA4335"
              d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.36 0 3.28 2.57 1.25 6.58l4.03 3.1c.95-2.83 3.6-4.93 6.72-4.93z"
            />
          </svg>
          <span>Continue with Google</span>
        </button>

        {/* Email Form */}
        <form onSubmit={handleSubmit} className="space-y-3 pt-1">
          {isSignUp && (
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Full Name</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-surface-muted">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  placeholder="e.g. Alex Rivera"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-[#0E0E1B] border border-surface-border rounded-xl text-xs text-white placeholder-surface-muted/60 focus:outline-none focus:border-brand-500"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Student Email</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-surface-muted">
                <Mail className="w-4 h-4" />
              </div>
              <input
                type="email"
                required
                placeholder="student@university.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-[#0E0E1B] border border-surface-border rounded-xl text-xs text-white placeholder-surface-muted/60 focus:outline-none focus:border-brand-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Password</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-surface-muted">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-[#0E0E1B] border border-surface-border rounded-xl text-xs text-white placeholder-surface-muted/60 focus:outline-none focus:border-brand-500"
              />
            </div>
          </div>

          {error && (
            <p className="text-[11px] text-rose-400 bg-rose-950/40 p-2 rounded-lg border border-rose-800/40">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-md shadow-brand-600/20"
          >
            <span>{isSignUp ? 'Create Student Account' : 'Sign In'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </form>

        {/* Toggle Sign In / Sign Up */}
        <p className="text-center text-xs text-surface-muted">
          {isSignUp ? 'Already have an account?' : "Don't have an account yet?"}{' '}
          <button
            type="button"
            onClick={() => {
              setIsSignUp(!isSignUp);
              setError(null);
            }}
            className="text-brand-400 hover:text-brand-300 font-semibold underline underline-offset-2 ml-1"
          >
            {isSignUp ? 'Sign In' : 'Sign Up'}
          </button>
        </p>
      </div>
    </div>
  );
};
