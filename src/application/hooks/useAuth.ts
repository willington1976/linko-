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
    let unsub: (() => void) | undefined;

    // Wait for redirect result to resolve FIRST, THEN start the auth state listener.
    // This prevents onAuthStateChanged from firing user=null before Firebase has
    // processed the redirect token, which was causing the "return to login" loop.
    getRedirectResult(auth)
      .then((result) => {
        if (result?.user) {
          // Redirect just completed successfully — state will be set by onAuthStateChanged below
          console.log('Redirect auth completed for:', result.user.email);
        }
      })
      .catch((err) => {
        if (err?.code && err.code !== 'auth/redirect-cancelled-by-user') {
          console.error('getRedirectResult error:', err);
          setState((prev) => ({ ...prev, error: err.code || err.message }));
        }
      })
      .finally(() => {
        // Only after redirect result is resolved, subscribe to auth state.
        // At this point Firebase has the correct user (or null) in its internal state.
        unsub = onAuthStateChanged(
          auth,
          (user) => {
            setState({ user, loading: false, error: null });
          },
          (err) => {
            console.error('onAuthStateChanged error:', err);
            setState({ user: null, loading: false, error: err.message || String(err) });
          }
        );
      });

    return () => unsub?.();
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