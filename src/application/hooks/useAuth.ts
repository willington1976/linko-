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
    let isRedirectPending = true;

    // 1. Process redirect result if coming back from Google redirect
    getRedirectResult(auth)
      .then((result) => {
        isRedirectPending = false;
        if (result?.user) {
          setState({ user: result.user, loading: false, error: null });
        }
      })
      .catch((err) => {
        isRedirectPending = false;
        console.error('getRedirectResult error:', err);
        if (err?.code && err.code !== 'auth/redirect-cancelled-by-user') {
          setState({ user: null, loading: false, error: err.code || err.message });
        }
      });

    // 2. Listen for auth state changes with buffer for redirect resolution
    const unsub = onAuthStateChanged(
      auth,
      (user) => {
        if (user) {
          setState({ user, loading: false, error: null });
        } else {
          // Give getRedirectResult time to resolve before declaring user = null
          setTimeout(() => {
            if (auth.currentUser) {
              setState({ user: auth.currentUser, loading: false, error: null });
            } else if (!isRedirectPending) {
              setState({ user: null, loading: false, error: null });
            } else {
              // Final check after 800ms
              setTimeout(() => {
                setState({ user: auth.currentUser, loading: false, error: null });
              }, 300);
            }
          }, 500);
        }
      },
      (err) => {
        console.error('onAuthStateChanged error:', err);
        setState({ user: null, loading: false, error: err.message || String(err) });
      }
    );

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