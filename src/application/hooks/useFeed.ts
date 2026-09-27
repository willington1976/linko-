// src/application/hooks/useFeed.ts

import { useState, useEffect, useCallback } from 'react';
import {
  subscribeToFeed,
  fetchNuevoHoy,
  fetchFeed,
} from '../../infrastructure/repositories/PublicationRepository';
import { fetchActiveBusinesses } from '../../infrastructure/repositories/BusinessRepository';
import type { Publication } from '../../domain/entities/Publication';
import type { Business } from '../../domain/entities/Business';
import type { PublicationCategory } from '../../domain/entities/Publication';

interface FeedState {
  publications: Publication[];
  nuevoHoy:     Publication[];
  businesses:   Business[];
  loading:      boolean;
  error:        string | null;
}

export function useFeed(category?: PublicationCategory) {
  const [state, setState] = useState<FeedState>({
    publications: [],
    nuevoHoy:     [],
    businesses:   [],
    loading:      true,
    error:        null,
  });

  const loadSupplementary = useCallback(async () => {
    try {
      const [nuevoHoy, businesses] = await Promise.all([
        fetchNuevoHoy(),
        fetchActiveBusinesses(),
      ]);
      setState((prev) => ({ ...prev, nuevoHoy, businesses }));
    } catch (err) {
      console.error('useFeed supplementary error:', err);
    }
  }, []);

  useEffect(() => {
    setState((prev) => ({ ...prev, loading: true, error: null }));

    // Listener en tiempo real para el feed principal
    const unsub = subscribeToFeed(
      (publications) => {
        setState((prev) => ({ ...prev, publications, loading: false }));
      },
      (err) => {
        setState((prev) => ({ ...prev, error: err.message, loading: false }));
      },
    );

    void loadSupplementary();

    return () => unsub();
  }, [category, loadSupplementary]);

  const refresh = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const [publications, nuevoHoy, businesses] = await Promise.all([
        fetchFeed({ category }),
        fetchNuevoHoy(),
        fetchActiveBusinesses(),
      ]);
      setState({ publications, nuevoHoy, businesses, loading: false, error: null });
    } catch (err) {
      setState((prev) => ({
        ...prev,
        loading: false,
        error: err instanceof Error ? err.message : 'Error al cargar el feed.',
      }));
    }
  }, [category]);

  return { ...state, refresh };
}