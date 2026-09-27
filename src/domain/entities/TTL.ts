// src/domain/entities/TTL.ts

export type TTLLabelVariant = 'normal' | 'warning' | 'urgent' | 'expired';

export interface TTLInfo {
  hoursRemaining: number;
  minutesRemaining: number;
  isExpiring: boolean;   // menos de 3 horas
  isUrgent: boolean;     // menos de 1 hora
  isExpired: boolean;
  label: string;
  labelVariant: TTLLabelVariant;
}

export function computeTTL(expiresAt: Date): TTLInfo {
  const now = Date.now();
  const expiresAtMs = expiresAt.getTime();
  const diffMs = expiresAtMs - now;

  if (diffMs <= 0) {
    return {
      hoursRemaining: 0,
      minutesRemaining: 0,
      isExpiring: false,
      isUrgent: false,
      isExpired: true,
      label: 'EXPIRADA',
      labelVariant: 'expired',
    };
  }

  const totalMinutes = Math.floor(diffMs / 60_000);
  const hoursRemaining = Math.floor(totalMinutes / 60);
  const minutesRemaining = totalMinutes % 60;

  const isUrgent = hoursRemaining < 1;
  const isExpiring = hoursRemaining < 3;

  const label = buildLabel(hoursRemaining, minutesRemaining, isUrgent);
  const labelVariant = resolveVariant(isUrgent, isExpiring);

  return {
    hoursRemaining,
    minutesRemaining,
    isExpiring,
    isUrgent,
    isExpired: false,
    label,
    labelVariant,
  };
}

function buildLabel(hours: number, minutes: number, isUrgent: boolean): string {
  const pad = (n: number): string => String(n).padStart(2, '0');

  if (isUrgent) {
    return `EXPIRA EN ${pad(hours)}h ${pad(minutes)}min`;
  }

  if (hours >= 24) {
    const days = Math.floor(hours / 24);
    const remainingHours = hours % 24;
    if (remainingHours === 0) {
      return `expira en ${String(days)}d`;
    }
    return `expira en ${String(days)}d ${String(remainingHours)}h`;
  }

  return `expira en ${String(hours)}h ${String(minutes)}min`;
}

function resolveVariant(
  isUrgent: boolean,
  isExpiring: boolean,
): TTLLabelVariant {
  if (isUrgent) return 'urgent';
  if (isExpiring) return 'warning';
  return 'normal';
}