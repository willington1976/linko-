// src/application/hooks/useAuth.ts

import { useState, useEffect } from 'react';
import {
  onAuthStateChanged,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInAnonymously,
  signOut,
  GoogleAuthProvider,
  type User,
} from 'firebase/auth';
import { auth } from '../../infrastructure/firebase/firebaseConfig';

interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
}

export function useAuth() {
  const [state, setState] = useState<AuthState>({ user: null, loading: true, error: null });

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      setState({ user, loading: false, error: null });
    });

    getRedirectResult(auth)
      .then((result) => {
        if (result?.user) {
          setState({ user: result.user, loading: false, error: null });
        }
      })
      .catch((err) => {
        console.warn('getRedirectResult warning:', err);
      });

    return () => unsub();
  }, []);

  const signInWithGoogle = () => {
    setState((prev) => ({ ...prev, error: null }));
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });
    return signInWithPopup(auth, provider).catch((err: any) => {
      if (err.code === 'auth/popup-blocked') {
        console.warn('Popup blocked, falling back to signInWithRedirect');
        return signInWithRedirect(auth, provider);
      }
      throw err;
    });
  };



  const signInEmail = async (email: string, pass: string) => {
    setState((prev) => ({ ...prev, error: null }));
    await signInWithEmailAndPassword(auth, email, pass);
  };

  const signUpEmail = async (email: string, pass: string) => {
    setState((prev) => ({ ...prev, error: null }));
    await createUserWithEmailAndPassword(auth, email, pass);
  };

  const signInGuest = async () => {
    setState((prev) => ({ ...prev, error: null }));
    await signInAnonymously(auth);
  };

  const logout = async () => {
    await signOut(auth);
  };

  return {
    ...state,
    signInWithGoogle,
    signInEmail,
    signUpEmail,
    signInGuest,
    logout,
  };
}