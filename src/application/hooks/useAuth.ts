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

  const signInWithGoogle = async () => {
    setState((prev) => ({ ...prev, error: null }));
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (err: any) {
      if (err.code === 'auth/popup-blocked' || err.code === 'auth/popup-closed-by-user') {
        try {
          await signInWithRedirect(auth, provider);
        } catch (redirectErr: any) {
          throw redirectErr;
        }
      } else {
        throw err;
      }
    }
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