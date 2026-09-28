// src/application/hooks/useFeed.ts

import { useState, useEffect, useCallback } from 'react';
import {
  subscribeToFeed,
  fetchNuevoHoy,
  fetchFeed,
  searchPublications,
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

export function useFeed(category?: PublicationCategory, searchQuery?: string) {
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
    // Con searchQuery activo usamos fetch puntual, no listener en tiempo real
    if (searchQuery && searchQuery.trim().length > 0) {
      setState((prev) => ({ ...prev, loading: true, error: null }));
      searchPublications(searchQuery.trim(), category)
        .then((publications) => setState((prev) => ({ ...prev, publications, loading: false })))
        .catch((err: unknown) => setState((prev) => ({
          ...prev,
          loading: false,
          error: err instanceof Error ? err.message : 'Error en busqueda',
        })));
      return;
    }

    // Sin searchQuery: listener en tiempo real
    setState((prev) => ({ ...prev, loading: true, error: null }));
    const unsub = subscribeToFeed(
      (publications) => setState((prev) => ({ ...prev, publications, loading: false })),
      (err) => setState((prev) => ({ ...prev, error: err.message, loading: false })),
      category,
    );
    void loadSupplementary();
    return () => unsub();
  }, [category, searchQuery, loadSupplementary]);

  const refresh = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const [publications, nuevoHoy, businesses] = await Promise.all([
        searchQuery?.trim()
          ? searchPublications(searchQuery.trim(), category)
          : fetchFeed({ category }),
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
  }, [category, searchQuery]);

  return { ...state, refresh };
}