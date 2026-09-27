// src/application/hooks/useTTL.ts

import { useState, useEffect, useRef } from 'react';
import { computeTTL, type TTLInfo } from '../../domain/entities/TTL';

const TICK_MS = 60_000; // recalcula cada minuto

export function useTTL(expiresAt: Date): TTLInfo {
  const [info, setInfo] = useState<TTLInfo>(() => computeTTL(expiresAt));
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const recalculate = () => setInfo(computeTTL(expiresAt));

  useEffect(() => {
    recalculate();
    intervalRef.current = setInterval(recalculate, TICK_MS);

    // Page Visibility API: recalcula cuando el usuario vuelve a la pestaña
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') recalculate();
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  // expiresAt.getTime() como dep evita el problema del objeto referencia
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [expiresAt.getTime()]);

  return info;
}