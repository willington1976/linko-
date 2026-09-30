// src/application/hooks/useBusiness.ts

import { useState, useEffect } from 'react';
import { getBusiness } from '../../infrastructure/firebase/businessService';
import type { Business } from '../../domain/entities/Business';

interface BusinessState {
  business: Business | null;
  loading: boolean;
  error: string | null;
}

export function useBusiness(userId: string | null) {
  const [state, setState] = useState<BusinessState>({
    business: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    if (!userId) {
      setState({ business: null, loading: false, error: null });
      return;
    }

    let cancelled = false;

    getBusiness(userId)
      .then((business) => {
        if (!cancelled) setState({ business, loading: false, error: null });
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          const msg = err instanceof Error ? err.message : 'Error cargando negocio';
          setState({ business: null, loading: false, error: msg });
        }
      });

    return () => { cancelled = true; };
  }, [userId]);

  const refresh = () => {
    if (!userId) return;
    setState((prev) => ({ ...prev, loading: true }));
    getBusiness(userId)
      .then((business) => setState({ business, loading: false, error: null }))
      .catch((err: unknown) => {
        const msg = err instanceof Error ? err.message : 'Error cargando negocio';
        setState({ business: null, loading: false, error: msg });
      });
  };

  const hasMembership = state.business?.membership.status === 'active';

  return { ...state, hasMembership, refresh };
}