// src/application/hooks/useMembership.ts

import { useState, useCallback } from 'react';
import { httpsCallable } from 'firebase/functions';
import { functions } from '../../infrastructure/firebase/firebaseConfig';
import type {
  ActivateMembershipInput,
  ActivateMembershipResult,
  CancelMembershipInput,
  CancelMembershipResult,
} from '../../domain/usecases/ManageMembership';

export function useMembership() {
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState<string | null>(null);

  const activate = useCallback(
    async (input: ActivateMembershipInput): Promise<ActivateMembershipResult | null> => {
      setLoading(true);
      setError(null);
      try {
        const fn = httpsCallable<ActivateMembershipInput, { membershipId: string; membershipUntil: string }>(
          functions,
          'activateMembership',
        );
        const res = await fn(input);
        setLoading(false);
        return {
          membershipId:    res.data.membershipId,
          membershipUntil: new Date(res.data.membershipUntil),
        };
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al activar membresía.');
        setLoading(false);
        return null;
      }
    },
    [],
  );

  const cancel = useCallback(
    async (input: CancelMembershipInput): Promise<CancelMembershipResult | null> => {
      setLoading(true);
      setError(null);
      try {
        const fn = httpsCallable<CancelMembershipInput, { cancelledAt: string }>(
          functions,
          'cancelMembership',
        );
        const res = await fn(input);
        setLoading(false);
        return { cancelledAt: new Date(res.data.cancelledAt) };
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al cancelar membresía.');
        setLoading(false);
        return null;
      }
    },
    [],
  );

  return { loading, error, activate, cancel };
}