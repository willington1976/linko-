// src/infrastructure/firebase/firebaseConfig.ts

import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { getStorage, type FirebaseStorage } from 'firebase/storage';
import { getFunctions, type Functions } from 'firebase/functions';

const firebaseConfig = {
  apiKey:            (import.meta.env.VITE_FIREBASE_API_KEY as string) || 'AIzaSyBjN-BO1co_m4QOpBPHHbTeyAIbyFjWokg',
  authDomain:        (import.meta.env.VITE_FIREBASE_AUTH_DOMAIN as string) || 'linko-e1499.firebaseapp.com',
  projectId:         (import.meta.env.VITE_FIREBASE_PROJECT_ID as string) || 'linko-e1499',
  storageBucket:     (import.meta.env.VITE_FIREBASE_STORAGE_BUCKET as string) || 'linko-e1499.firebasestorage.app',
  messagingSenderId: (import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID as string) || '340145371035',
  appId:             (import.meta.env.VITE_FIREBASE_APP_ID as string) || '1:340145371035:web:b2e46804f90adc0bf4133e',
};

const app: FirebaseApp =
  getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0]!;

export const auth: Auth             = getAuth(app);
export const db: Firestore          = getFirestore(app);
export const storage: FirebaseStorage = getStorage(app);
export const functions: Functions   = getFunctions(app, 'us-central1');