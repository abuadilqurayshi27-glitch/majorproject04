import React, { useState, useEffect, useRef } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext.js';
import { PlayerProvider } from './context/PlayerContext.js';
import { Navbar } from './components/common/Navbar.js';
import { Sidebar } from './components/common/Sidebar.js';
import { MobileNav } from './components/common/MobileNav.js';
import { ApiKeyModal } from './components/common/ApiKeyModal.js';
import { AuthModal } from './components/auth/AuthModal.js';
import { ProfileSetupModal } from './components/auth/ProfileSetupModal.js';

import { HomePage } from './pages/HomePage.js';
import { LearnPage } from './pages/LearnPage.js';
import { VoiceTutorPage } from './pages/VoiceTutorPage.js';
import { AnalysisPage } from './pages/AnalysisPage.js';
import { ProfilePage } from './pages/ProfilePage.js';

const MainLayout: React.FC = () => {
  const { user, profile, loading } = useAuth();
  const [activePage, setActivePage] = useState<string>('home');
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isProfileSetupOpen, setIsProfileSetupOpen] = useState(false);

  // Ref to the sole scroll container — used to reset scroll on page navigation
  const mainRef = useRef<HTMLElement>(null);

  // Instantly scroll to top when the page changes (no animation — prevents
  // prior-page scroll position from bleeding into the new page, exactly like YouTube)
  useEffect(() => {
    if (mainRef.current) {
      mainRef.current.scrollTop = 0;
    }
  }, [activePage]);

  // Check if user is logged in and needs to complete their profile setup
  useEffect(() => {
    if (user && !user.isProfileComplete) {
      setIsProfileSetupOpen(true);
    } else {
      setIsProfileSetupOpen(false);
    }
  }, [user?.uid, user?.isProfileComplete]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0B0B14] flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-brand-600/30 border border-brand-500/40 flex items-center justify-center animate-pulse">
          <div className="w-6 h-6 border-2 border-brand-400 border-t-transparent rounded-full animate-spin" />
        </div>
        <p className="text-xs text-brand-300 font-medium">Launching StudyMind AI Platform...</p>
      </div>
    );
  }

  return (
    <div className="h-[100dvh] flex flex-col bg-[#0B0B14] text-slate-100 overflow-hidden">
      {/* Top Navbar — sticky at top of viewport, always visible */}
      <Navbar
        onOpenAuth={() => setIsAuthOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onNavigate={setActivePage}
        onEditProfile={() => setIsProfileSetupOpen(true)}
        activePage={activePage}
      />

      {/* Content Row: Sidebar + Page — height-constrained so scrolling stays inside */}
      <div className="flex-1 flex min-h-0 overflow-hidden">
        {/* Desktop Collapsible Sidebar — scrolls independently */}
        <Sidebar activePage={activePage} onNavigate={setActivePage} />

        {/* Dynamic Page Router — SOLE scroll container (YouTube-style) */}
        <main
          ref={mainRef}
          className="flex-1 min-w-0 overflow-y-auto overflow-x-hidden pb-20 md:pb-8 page-scroll"
        >
          {activePage === 'home' && <HomePage onNavigate={setActivePage} />}
          {activePage === 'learn' && <LearnPage onNavigate={setActivePage} />}
          {activePage === 'voice' && <VoiceTutorPage onNavigate={setActivePage} />}
          {activePage === 'analysis' && <AnalysisPage onNavigate={setActivePage} />}
          {activePage === 'profile' && <ProfilePage />}
        </main>
      </div>

      {/* Fixed Mobile Bottom Navigation */}
      <MobileNav activePage={activePage} onNavigate={setActivePage} />

      {/* Auth Modal */}
      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />

      {/* Profile Onboarding Modal */}
      <ProfileSetupModal
        isOpen={isProfileSetupOpen}
        onComplete={() => setIsProfileSetupOpen(false)}
      />

      {/* Settings / API Key Modal */}
      <ApiKeyModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <PlayerProvider>
        <MainLayout />
      </PlayerProvider>
    </AuthProvider>
  );
};

export default App;
