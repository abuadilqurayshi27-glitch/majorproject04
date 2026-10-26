import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as fbSignOut,
  onAuthStateChanged,
} from 'firebase/auth';
import { auth, googleProvider, isFirebaseConfigured } from '../services/firebase.js';
import { FirestoreService } from '../services/firestoreService.js';
import { StudentProfile, UserAccount, isProfileDataComplete } from '../types/auth.js';

interface AuthContextType {
  user: UserAccount | null;
  profile: StudentProfile | null;
  loading: boolean;
  isFirebaseActive: boolean;
  loginWithGoogle: () => Promise<void>;
  loginWithEmail: (email: string, pass: string) => Promise<void>;
  signupWithEmail: (email: string, pass: string, name: string) => Promise<void>;
  loginAsDemoStudent: () => Promise<void>;
  logout: () => Promise<void>;
  saveProfile: (profile: Partial<StudentProfile>) => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserAccount | null>(null);
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Load profile for a user
  const loadProfile = async (
    uid: string,
    fallbackEmail: string,
    fallbackName: string,
    fallbackPhoto?: string
  ) => {
    try {
      const existing = await FirestoreService.getUserProfile(uid);
      if (existing) {
        const complete = isProfileDataComplete(existing);
        setProfile(existing);
        setUser((prev) => (prev ? {
          ...prev,
          displayName: existing.name || prev.displayName,
          photoURL: existing.photoURL || prev.photoURL,
          isProfileComplete: complete,
        } : null));
        return;
      }

      // Fallback: check active profile in localStorage
      const activeProfileStr = localStorage.getItem('studymind_active_profile');
      if (activeProfileStr) {
        try {
          const activeProfile = JSON.parse(activeProfileStr) as StudentProfile;
          if (activeProfile && activeProfile.uid === uid) {
            const complete = isProfileDataComplete(activeProfile);
            setProfile(activeProfile);
            setUser((prev) => (prev ? {
              ...prev,
              displayName: activeProfile.name || prev.displayName,
              photoURL: activeProfile.photoURL || prev.photoURL,
              isProfileComplete: complete,
            } : null));
            return;
          }
        } catch {}
      }

      // First-time login: create a draft student profile pre-filled with Google/Auth info
      const draftProfile: StudentProfile = {
        uid,
        name: fallbackName || 'Student',
        email: fallbackEmail || '',
        photoURL: fallbackPhoto || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
        education: '',
        course: '',
        subjects: [],
        learningGoal: '',
        learningLevel: 'Beginner',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setProfile(draftProfile);
      setUser((prev) => (prev ? { ...prev, isProfileComplete: false } : null));
    } catch (e) {
      console.warn('Error loading profile:', e);
    }
  };

  useEffect(() => {
    if (isFirebaseConfigured && auth) {
      const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
        if (fbUser) {
          const userAcc: UserAccount = {
            uid: fbUser.uid,
            email: fbUser.email || '',
            displayName: fbUser.displayName || 'Student',
            photoURL: fbUser.photoURL || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
            isProfileComplete: false,
          };
          setUser(userAcc);
          await loadProfile(fbUser.uid, userAcc.email, userAcc.displayName, fbUser.photoURL || undefined);
        } else {
          // Check if local user exists as fallback
          const savedUser = localStorage.getItem('studymind_local_user');
          if (savedUser) {
            try {
              const parsed = JSON.parse(savedUser) as UserAccount;
              setUser(parsed);
              loadProfile(parsed.uid, parsed.email, parsed.displayName).finally(() => setLoading(false));
              return;
            } catch {}
          }

          // Check if an active profile exists without a user yet
          const savedProfileStr = localStorage.getItem('studymind_active_profile');
          if (savedProfileStr) {
            try {
              const savedProfile = JSON.parse(savedProfileStr) as StudentProfile;
              if (savedProfile && savedProfile.uid) {
                const restoredUser: UserAccount = {
                  uid: savedProfile.uid,
                  email: savedProfile.email || 'student@studymind.ai',
                  displayName: savedProfile.name || 'Student Learner',
                  photoURL: savedProfile.photoURL,
                  isProfileComplete: true,
                };
                setUser(restoredUser);
                setProfile(savedProfile);
                localStorage.setItem('studymind_local_user', JSON.stringify(restoredUser));
                setLoading(false);
                return;
              }
            } catch {}
          }

          setUser(null);
          setProfile(null);
        }
        setLoading(false);
      });
      return () => unsubscribe();
    } else {
      // Local fallback auth state
      const savedUser = localStorage.getItem('studymind_local_user');
      if (savedUser) {
        try {
          const parsed = JSON.parse(savedUser) as UserAccount;
          setUser(parsed);
          loadProfile(parsed.uid, parsed.email, parsed.displayName).finally(() => setLoading(false));
          return;
        } catch {}
      }

      // Check if an active profile exists
      const savedProfileStr = localStorage.getItem('studymind_active_profile');
      if (savedProfileStr) {
        try {
          const savedProfile = JSON.parse(savedProfileStr) as StudentProfile;
          if (savedProfile && savedProfile.uid) {
            const restoredUser: UserAccount = {
              uid: savedProfile.uid,
              email: savedProfile.email || 'student@studymind.ai',
              displayName: savedProfile.name || 'Student Learner',
              photoURL: savedProfile.photoURL,
              isProfileComplete: true,
            };
            setUser(restoredUser);
            setProfile(savedProfile);
            localStorage.setItem('studymind_local_user', JSON.stringify(restoredUser));
            setLoading(false);
            return;
          }
        } catch {}
      }

      setLoading(false);
    }
  }, []);

  const loginWithGoogle = async () => {
    if (isFirebaseConfigured && auth && googleProvider) {
      const res = await signInWithPopup(auth, googleProvider);
      const userAcc: UserAccount = {
        uid: res.user.uid,
        email: res.user.email || '',
        displayName: res.user.displayName || 'Student',
        photoURL: res.user.photoURL || undefined,
        isProfileComplete: false,
      };
      setUser(userAcc);
      await loadProfile(userAcc.uid, userAcc.email, userAcc.displayName, userAcc.photoURL);
    } else {
      // Mock Google Login when Firebase Auth is not active in environment
      const mockUid = 'google_demo_' + Date.now();
      const mockUser: UserAccount = {
        uid: mockUid,
        email: '',
        displayName: 'Student Learner',
        photoURL: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
        isProfileComplete: false,
      };
      localStorage.setItem('studymind_local_user', JSON.stringify(mockUser));
      setUser(mockUser);
      await loadProfile(mockUid, '', mockUser.displayName, mockUser.photoURL);
    }
  };

  const loginWithEmail = async (email: string, pass: string) => {
    if (isFirebaseConfigured && auth) {
      const res = await signInWithEmailAndPassword(auth, email, pass);
      const userAcc: UserAccount = {
        uid: res.user.uid,
        email: res.user.email || email,
        displayName: res.user.displayName || email.split('@')[0],
        photoURL: res.user.photoURL || undefined,
        isProfileComplete: false,
      };
      setUser(userAcc);
      await loadProfile(userAcc.uid, userAcc.email, userAcc.displayName, userAcc.photoURL);
    } else {
      const mockUid = 'email_user_' + Math.abs(email.split('').reduce((a, b) => ((a << 5) - a) + b.charCodeAt(0), 0));
      const mockUser: UserAccount = {
        uid: mockUid,
        email,
        displayName: email.split('@')[0],
        photoURL: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
        isProfileComplete: false,
      };
      localStorage.setItem('studymind_local_user', JSON.stringify(mockUser));
      setUser(mockUser);
      await loadProfile(mockUid, email, mockUser.displayName, mockUser.photoURL);
    }
  };

  const signupWithEmail = async (email: string, pass: string, name: string) => {
    if (isFirebaseConfigured && auth) {
      const res = await createUserWithEmailAndPassword(auth, email, pass);
      const userAcc: UserAccount = {
        uid: res.user.uid,
        email,
        displayName: name,
        isProfileComplete: false,
      };
      setUser(userAcc);
      await loadProfile(userAcc.uid, email, name);
    } else {
      const mockUid = 'student_' + Date.now();
      const mockUser: UserAccount = {
        uid: mockUid,
        email,
        displayName: name,
        photoURL: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
        isProfileComplete: false,
      };
      localStorage.setItem('studymind_local_user', JSON.stringify(mockUser));
      setUser(mockUser);
      await loadProfile(mockUid, email, name, mockUser.photoURL);
    }
  };

  const loginAsDemoStudent = async () => {
    const demoUid = 'demo_student_studymind_01';
    const demoUser: UserAccount = {
      uid: demoUid,
      email: 'fayaz.student@studymind.ai',
      displayName: 'Fayaz Patel',
      photoURL: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      isProfileComplete: true,
    };

    const demoProfile: StudentProfile = {
      uid: demoUid,
      name: 'Fayaz Patel',
      email: 'fayaz.student@studymind.ai',
      age: 21,
      education: 'Undergraduate',
      course: 'Computer Science & Engineering',
      subjects: ['DBMS', 'Python', 'Algorithms', 'Distributed Systems'],
      learningGoal: 'Master Database Architecture & Crack Tech Interviews',
      learningLevel: 'Intermediate',
      photoURL: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    localStorage.setItem('studymind_local_user', JSON.stringify(demoUser));
    await FirestoreService.saveUserProfile(demoProfile);
    setUser(demoUser);
    setProfile(demoProfile);
  };

  const logout = async () => {
    if (isFirebaseConfigured && auth) {
      await fbSignOut(auth);
    }
    localStorage.removeItem('studymind_local_user');
    localStorage.removeItem('studymind_active_profile');
    setUser(null);
    setProfile(null);
  };

  const saveProfile = async (data: Partial<StudentProfile>) => {
    let currentUser = user;
    if (!currentUser) {
      // Re-use existing local user from storage if available
      const storedLocalStr = localStorage.getItem('studymind_local_user');
      if (storedLocalStr) {
        try {
          currentUser = JSON.parse(storedLocalStr) as UserAccount;
        } catch {}
      }

      if (!currentUser) {
        const localUid = 'student_' + Date.now();
        currentUser = {
          uid: localUid,
          email: data.email || 'student@studymind.ai',
          displayName: data.name || 'Student Learner',
          photoURL: data.photoURL || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
          isProfileComplete: true,
        };
      }
    }

    const updated: StudentProfile = {
      uid: currentUser.uid,
      name: data.name || currentUser.displayName || 'Student',
      email: data.email || currentUser.email || 'student@studymind.ai',
      age: data.age !== undefined && !isNaN(Number(data.age)) ? Number(data.age) : (profile?.age || 17),
      education: data.education || profile?.education || 'PUC',
      stream: data.stream ?? profile?.stream ?? '',
      course: data.course || profile?.course || 'PUC Science',
      subjects: data.subjects && data.subjects.length > 0 ? data.subjects : (profile?.subjects || ['Physics', 'Chemistry', 'Mathematics']),
      learningGoal: data.learningGoal || profile?.learningGoal || 'Score well in board exams',
      learningLevel: (data.learningLevel as any) || profile?.learningLevel || 'Beginner',
      classLevel: data.classLevel ?? profile?.classLevel ?? '',
      boardExam: data.boardExam ?? profile?.boardExam ?? '',
      photoURL: data.photoURL || profile?.photoURL || currentUser.photoURL || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      createdAt: profile?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const isComplete = isProfileDataComplete(updated);
    const updatedUser: UserAccount = {
      ...currentUser,
      email: updated.email,
      displayName: updated.name,
      photoURL: updated.photoURL,
      isProfileComplete: isComplete,
    };
    setUser(updatedUser);
    try {
      localStorage.setItem('studymind_local_user', JSON.stringify(updatedUser));
    } catch {}

    await FirestoreService.saveUserProfile(updated);
    setProfile(updated);
  };

  const refreshProfile = async () => {
    if (user) {
      await loadProfile(user.uid, user.email, user.displayName);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        isFirebaseActive: isFirebaseConfigured,
        loginWithGoogle,
        loginWithEmail,
        signupWithEmail,
        loginAsDemoStudent,
        logout,
        saveProfile,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
