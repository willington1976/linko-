// src/domain/__tests__/publication.test.ts

import { describe, it, expect } from 'vitest';
import { computeTTL } from '../entities/TTL';
import { computeExpiresAt, getTTLHours, TTL_HOURS_BY_CATEGORY } from '../rules/ttlRules';
import { validatePublicationInput } from '../validation/publicationValidation';
import { isMembershipActive, computeMembershipEnd, MEMBERSHIP_DURATION_DAYS } from '../rules/membershipRules';

// ─── TTL RULES ────────────────────────────────────────────────────────────────

describe('TTL_HOURS_BY_CATEGORY', () => {
  it('empleo = 72h', () => expect(TTL_HOURS_BY_CATEGORY.empleo).toBe(72));
  it('inmuebles = 48h', () => expect(TTL_HOURS_BY_CATEGORY.inmuebles).toBe(48));
  it('articulos = 24h', () => expect(TTL_HOURS_BY_CATEGORY.articulos).toBe(24));
  it('servicios = 36h', () => expect(TTL_HOURS_BY_CATEGORY.servicios).toBe(36));
  it('urgente = 6h', () => expect(TTL_HOURS_BY_CATEGORY.urgente).toBe(6));
});

describe('getTTLHours', () => {
  it('retorna horas correctas por categoría', () => {
    expect(getTTLHours('empleo')).toBe(72);
    expect(getTTLHours('urgente')).toBe(6);
  });
});

describe('computeExpiresAt', () => {
  it('suma el TTL exacto a createdAt', () => {
    const created = new Date('2025-01-01T10:00:00Z');
    const expires = computeExpiresAt(created, 'articulos'); // 24h
    const diffHours = (expires.getTime() - created.getTime()) / (1000 * 60 * 60);
    expect(diffHours).toBe(24);
  });

  it('urgente expira en 6 horas', () => {
    const created = new Date('2025-01-01T10:00:00Z');
    const expires = computeExpiresAt(created, 'urgente');
    const diffHours = (expires.getTime() - created.getTime()) / (1000 * 60 * 60);
    expect(diffHours).toBe(6);
  });
});

// ─── computeTTL ───────────────────────────────────────────────────────────────

describe('computeTTL', () => {
  it('retorna isExpired=true si expiresAt está en el pasado', () => {
    const past = new Date(Date.now() - 1000 * 60 * 60);
    const info = computeTTL(past);
    expect(info.isExpired).toBe(true);
    expect(info.labelVariant).toBe('expired');
  });

  it('retorna isUrgent=true si queda menos de 1h', () => {
    const soon = new Date(Date.now() + 1000 * 60 * 30); // 30 min
    const info = computeTTL(soon);
    expect(info.isUrgent).toBe(true);
    expect(info.labelVariant).toBe('urgent');
  });

  it('retorna isExpiring=true si queda menos de 3h', () => {
    const twoHours = new Date(Date.now() + 1000 * 60 * 60 * 2);
    const info = computeTTL(twoHours);
    expect(info.isExpiring).toBe(true);
    expect(info.labelVariant).toBe('warning');
  });

  it('retorna labelVariant=normal si queda más de 3h', () => {
    const future = new Date(Date.now() + 1000 * 60 * 60 * 10);
    const info = computeTTL(future);
    expect(info.isExpired).toBe(false);
    expect(info.isExpiring).toBe(false);
    expect(info.labelVariant).toBe('normal');
  });
});

// ─── VALIDACIÓN PUBLICACIÓN ───────────────────────────────────────────────────

describe('validatePublicationInput', () => {
  const base = {
    title: 'Se vende moto',
    description: 'Moto en buen estado, negociable.',
    category: 'articulos' as const,
    intent: 'ofrezco' as const,
    location: 'Yopal',
    contactPhone: '3101234567',
  };

  it('valida input correcto', () => {
    expect(validatePublicationInput(base).valid).toBe(true);
  });

  it('falla si title está vacío', () => {
    const result = validatePublicationInput({ ...base, title: '' });
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.field === 'title')).toBe(true);
  });

  it('falla con categoría inválida', () => {
    const result = validatePublicationInput({ ...base, category: 'moda' as never });
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.field === 'category')).toBe(true);
  });

  it('falla con intent inválido', () => {
    const result = validatePublicationInput({ ...base, intent: 'regalo' as never });
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.field === 'intent')).toBe(true);
  });

  it('falla con teléfono muy corto', () => {
    const result = validatePublicationInput({ ...base, contactPhone: '123' });
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.field === 'contactPhone')).toBe(true);
  });

  it('acepta precio 0', () => {
    expect(validatePublicationInput({ ...base, price: 0 }).valid).toBe(true);
  });

  it('falla con precio negativo', () => {
    const result = validatePublicationInput({ ...base, price: -1 });
    expect(result.valid).toBe(false);
  });
});

// ─── MEMBERSHIP RULES ─────────────────────────────────────────────────────────

describe('isMembershipActive', () => {
  it('retorna false si membershipUntil es null', () => {
    expect(isMembershipActive(null)).toBe(false);
  });

  it('retorna false si fecha ya pasó', () => {
    const past = new Date(Date.now() - 1000);
    expect(isMembershipActive(past)).toBe(false);
  });

  it('retorna true si fecha es futura', () => {
    const future = new Date(Date.now() + 1000 * 60 * 60 * 24);
    expect(isMembershipActive(future)).toBe(true);
  });
});

describe('computeMembershipEnd', () => {
  it(`agrega exactamente ${String(MEMBERSHIP_DURATION_DAYS)} días`, () => {
    const start = new Date('2025-01-01T00:00:00Z');
    const end = computeMembershipEnd(start);
    const diffDays = (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24);
    expect(diffDays).toBe(MEMBERSHIP_DURATION_DAYS);
  });
});