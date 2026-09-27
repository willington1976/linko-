// src/domain/rules/ttlRules.ts

import type { PublicationCategory } from '../entities/Publication';

export const TTL_HOURS_BY_CATEGORY: Record<PublicationCategory, number> = {
  empleo:    72,
  inmuebles: 48,
  articulos: 24,
  servicios: 36,
  urgente:   6,
};

export function getTTLHours(category: PublicationCategory): number {
  return TTL_HOURS_BY_CATEGORY[category];
}

export function computeExpiresAt(createdAt: Date, category: PublicationCategory): Date {
  const ttlMs = getTTLHours(category) * 60 * 60 * 1000;
  return new Date(createdAt.getTime() + ttlMs);
}