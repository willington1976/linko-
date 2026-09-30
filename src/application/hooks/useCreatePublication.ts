// src/application/hooks/useCreatePublication.ts

import { useState, useCallback } from 'react';
import { httpsCallable } from 'firebase/functions';
import { functions } from '../../infrastructure/firebase/firebaseConfig';
import {
  uploadPublicationPhoto,
  type UploadProgress,
} from '../../infrastructure/services/StorageService';
import { validatePublicationInput } from '../../domain/validation/publicationValidation';
import type { CreatePublicationInput, CreatePublicationResult } from '../../domain/usecases/CreatePublication';

interface UseCreatePublicationState {
  loading:        boolean;
  uploadProgress: number;
  error:          string | null;
  result:         CreatePublicationResult | null;
}

export function useCreatePublication(authorId: string) {
  const [state, setState] = useState<UseCreatePublicationState>({
    loading:        false,
    uploadProgress: 0,
    error:          null,
    result:         null,
  });

  const submit = useCallback(
    async (input: Omit<CreatePublicationInput, 'photos'> & { photoFiles: File[] }) => {
      setState({ loading: true, uploadProgress: 0, error: null, result: null });

      const validation = validatePublicationInput({
        title:        input.title,
        description:  input.description,
        category:     input.category,
        intent:       input.intent,
        department:   input.department,
        municipality: input.municipality,
        price:        input.price,
        contactPhone: input.contactPhone,
      });

      if (!validation.valid) {
        setState((prev) => ({
          ...prev,
          loading: false,
          error: validation.errors[0]?.message ?? 'Error de validacion.',
        }));
        return null;
      }

      try {
        const photoUrls: string[] = [];
        for (let i = 0; i < input.photoFiles.length; i++) {
          const file = input.photoFiles[i]!;
          const { urlPromise } = uploadPublicationPhoto(
            file,
            authorId,
            (p: UploadProgress) => {
              const base = (i / input.photoFiles.length) * 100;
              const step = (p.percent / input.photoFiles.length);
              setState((prev) => ({ ...prev, uploadProgress: base + step }));
            },
          );
          const url = await urlPromise;
          photoUrls.push(url);
        }

        const location = `${input.department}, ${input.municipality}`;

        const fn = httpsCallable<CreatePublicationInput, CreatePublicationResult>(
          functions,
          'createPublication',
        );

        const response = await fn({
          ...input,
          location,
          municipality: input.municipality,
          photos: photoUrls,
          // Si es publicacion de negocio, businessId = authorId (doc en businesses/{authorId})
          ...(input.publicationType === 'business' && { businessId: authorId }),
        });

        const result: CreatePublicationResult = {
          ...response.data,
          expiresAt: new Date(response.data.expiresAt),
        };

        setState({ loading: false, uploadProgress: 100, error: null, result });
        return result;
      } catch (err) {
        setState((prev) => ({
          ...prev,
          loading: false,
          error: err instanceof Error ? err.message : 'Error al publicar.',
        }));
        return null;
      }
    },
    [authorId],
  );

  const reset = useCallback(() => {
    setState({ loading: false, uploadProgress: 0, error: null, result: null });
  }, []);

  return { ...state, submit, reset };
}