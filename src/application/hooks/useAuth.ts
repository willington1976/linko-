// src/application/hooks/useAuth.ts

import { useState, useEffect } from 'react';
import {
  onAuthStateChanged,
  signOut,
  type User,
} from 'firebase/auth';
import { auth } from '../../infrastructure/firebase/firebaseConfig';

interface AuthState {
  user: User | null;
  loading: boolean;
}

export function useAuth() {
  const [state, setState] = useState<AuthState>({ user: null, loading: true });

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      setState({ user, loading: false });
    });
    return () => unsub();
  }, []);

  const logout = async () => {
    await signOut(auth);
  };

  return { ...state, logout };
}