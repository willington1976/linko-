// src/application/hooks/useBusiness.ts

import { useState, useEffect, useCallback } from 'react';
import { httpsCallable } from 'firebase/functions';
import { functions } from '../../infrastructure/firebase/firebaseConfig';
import {
  fetchBusinessByOwner,
  fetchBusinessById,
} from '../../infrastructure/repositories/BusinessRepository';
import {
  uploadBusinessLogo,
  type UploadProgress,
} from '../../infrastructure/services/StorageService';
import type { Business } from '../../domain/entities/Business';
import type { CreateBusinessInput, CreateBusinessResult } from '../../domain/usecases/CreateBusiness';

interface UseBusinessState {
  business:  Business | null;
  loading:   boolean;
  error:     string | null;
}

// Hook para cargar el negocio del usuario autenticado
export function useMyBusiness(ownerId: string | null) {
  const [state, setState] = useState<UseBusinessState>({
    business: null,
    loading:  !!ownerId,
    error:    null,
  });

  useEffect(() => {
    if (!ownerId) {
      setState({ business: null, loading: false, error: null });
      return;
    }
    setState((prev) => ({ ...prev, loading: true }));
    fetchBusinessByOwner(ownerId)
      .then((business) => setState({ business, loading: false, error: null }))
      .catch((err: unknown) =>
        setState({
          business: null,
          loading: false,
          error: err instanceof Error ? err.message : 'Error al cargar negocio.',
        }),
      );
  }, [ownerId]);

  return state;
}

// Hook para cargar un negocio por ID (página pública)
export function useBusiness(businessId: string | null) {
  const [state, setState] = useState<UseBusinessState>({
    business: null,
    loading:  !!businessId,
    error:    null,
  });

  useEffect(() => {
    if (!businessId) return;
    setState((prev) => ({ ...prev, loading: true }));
    fetchBusinessById(businessId)
      .then((business) => setState({ business, loading: false, error: null }))
      .catch((err: unknown) =>
        setState({
          business: null,
          loading: false,
          error: err instanceof Error ? err.message : 'Error al cargar negocio.',
        }),
      );
  }, [businessId]);

  return state;
}

// Hook para crear un negocio
export function useCreateBusiness() {
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const submit = useCallback(
    async (
      input: Omit<CreateBusinessInput, 'logo'> & {
        logoFile?: File;
        tempBusinessId: string; // ID temporal para subir el logo antes de crear
      },
    ): Promise<CreateBusinessResult | null> => {
      setLoading(true);
      setError(null);
      setUploadProgress(0);

      try {
        let logoUrl: string | undefined;

        if (input.logoFile) {
          const { urlPromise } = uploadBusinessLogo(
            input.logoFile,
            input.tempBusinessId,
            (p: UploadProgress) => setUploadProgress(p.percent),
          );
          logoUrl = await urlPromise;
        }

        const fn = httpsCallable<CreateBusinessInput, CreateBusinessResult>(
          functions,
          'createBusiness',
        );

        const response = await fn({ ...input, logo: logoUrl });
        const result: CreateBusinessResult = {
          ...response.data,
          createdAt: new Date(response.data.createdAt),
        };

        setLoading(false);
        return result;
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al crear negocio.');
        setLoading(false);
        return null;
      }
    },
    [],
  );

  return { loading, uploadProgress, error, submit };
}