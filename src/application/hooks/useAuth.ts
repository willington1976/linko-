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
    const unsub = onAuthStateChanged(
      auth,
      (user) => {
        setState((prev) => ({ ...prev, user, loading: false }));
      },
      (err) => {
        console.error('onAuthStateChanged error:', err);
        setState((prev) => ({ ...prev, loading: false, error: err.message || String(err) }));
      }
    );

    getRedirectResult(auth)
      .then((result) => {
        if (result?.user) {
          setState({ user: result.user, loading: false, error: null });
        }
      })
      .catch((err) => {
        console.error('getRedirectResult error:', err);
        if (err && err.code && err.code !== 'auth/redirect-cancelled-by-user') {
          setState((prev) => ({
            ...prev,
            loading: false,
            error: err.code || err.message || 'Error de redirección en autenticación.',
          }));
        }
      });

    return () => unsub();
  }, []);


  const signInWithGooglePopup = () => {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });
    return signInWithPopup(auth, provider);
  };

  const signInWithGoogleRedirect = () => {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });
    return signInWithRedirect(auth, provider);
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
    signInWithGooglePopup,
    signInWithGoogleRedirect,
    signInEmail,
    signUpEmail,
    signInGuest,
    logout,
  };
}