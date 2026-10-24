import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getStorage, FirebaseStorage } from 'firebase/storage';

// Firebase configuration from environment or window/localStorage
export const getFirebaseConfig = () => {
  const env = import.meta.env;
  const storedConfig = localStorage.getItem('studymind_firebase_config');
  if (storedConfig) {
    try {
      return JSON.parse(storedConfig);
    } catch (e) {
      console.warn('Failed to parse stored firebase config');
    }
  }

  return {
    apiKey: env.VITE_FIREBASE_API_KEY || '',
    authDomain: env.VITE_FIREBASE_AUTH_DOMAIN || '',
    projectId: env.VITE_FIREBASE_PROJECT_ID || '',
    storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET || '',
    messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
    appId: env.VITE_FIREBASE_APP_ID || '',
  };
};

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;
let storage: FirebaseStorage | null = null;
let googleProvider: GoogleAuthProvider | null = null;

const currentConfig = getFirebaseConfig();
export const isFirebaseConfigured = Boolean(
  currentConfig.apiKey &&
  currentConfig.apiKey.length > 10 &&
  currentConfig.projectId &&
  !currentConfig.apiKey.includes('YOUR_')
);

if (isFirebaseConfigured) {
  try {
    app = getApps().length > 0 ? getApp() : initializeApp(currentConfig);
    auth = getAuth(app);
    db = getFirestore(app);
    storage = getStorage(app);
    googleProvider = new GoogleAuthProvider();
    console.log('🔥 Firebase initialized successfully with project:', currentConfig.projectId);
  } catch (err) {
    console.warn('Firebase initialization error, fallback mode activated:', err);
    app = null;
    auth = null;
    db = null;
    storage = null;
  }
} else {
  console.log('ℹ️ Running in StudyMind AI Local/Offline Mode (Firebase credentials not set in .env)');
}

export { app, auth, db, storage, googleProvider };
