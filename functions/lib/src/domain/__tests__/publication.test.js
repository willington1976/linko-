"use strict";
// src/domain/__tests__/publication.test.ts
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const TTL_1 = require("../entities/TTL");
const ttlRules_1 = require("../rules/ttlRules");
const publicationValidation_1 = require("../validation/publicationValidation");
const membershipRules_1 = require("../rules/membershipRules");
// â”€â”€â”€ TTL RULES â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
(0, vitest_1.describe)('TTL_HOURS_BY_CATEGORY', () => {
    (0, vitest_1.it)('empleo = 72h', () => (0, vitest_1.expect)(ttlRules_1.TTL_HOURS_BY_CATEGORY.empleo).toBe(72));
    (0, vitest_1.it)('inmuebles = 48h', () => (0, vitest_1.expect)(ttlRules_1.TTL_HOURS_BY_CATEGORY.inmuebles).toBe(48));
    (0, vitest_1.it)('articulos = 24h', () => (0, vitest_1.expect)(ttlRules_1.TTL_HOURS_BY_CATEGORY.articulos).toBe(24));
    (0, vitest_1.it)('servicios = 36h', () => (0, vitest_1.expect)(ttlRules_1.TTL_HOURS_BY_CATEGORY.servicios).toBe(36));
    (0, vitest_1.it)('urgente = 6h', () => (0, vitest_1.expect)(ttlRules_1.TTL_HOURS_BY_CATEGORY.urgente).toBe(6));
});
(0, vitest_1.describe)('getTTLHours', () => {
    (0, vitest_1.it)('retorna horas correctas por categorÃ­a', () => {
        (0, vitest_1.expect)((0, ttlRules_1.getTTLHours)('empleo')).toBe(72);
        (0, vitest_1.expect)((0, ttlRules_1.getTTLHours)('urgente')).toBe(6);
    });
});
(0, vitest_1.describe)('computeExpiresAt', () => {
    (0, vitest_1.it)('suma el TTL exacto a createdAt', () => {
        const created = new Date('2025-01-01T10:00:00Z');
        const expires = (0, ttlRules_1.computeExpiresAt)(created, 'articulos'); // 24h
        const diffHours = (expires.getTime() - created.getTime()) / (1000 * 60 * 60);
        (0, vitest_1.expect)(diffHours).toBe(24);
    });
    (0, vitest_1.it)('urgente expira en 6 horas', () => {
        const created = new Date('2025-01-01T10:00:00Z');
        const expires = (0, ttlRules_1.computeExpiresAt)(created, 'urgente');
        const diffHours = (expires.getTime() - created.getTime()) / (1000 * 60 * 60);
        (0, vitest_1.expect)(diffHours).toBe(6);
    });
});
// â”€â”€â”€ computeTTL â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
(0, vitest_1.describe)('computeTTL', () => {
    (0, vitest_1.it)('retorna isExpired=true si expiresAt estÃ¡ en el pasado', () => {
        const past = new Date(Date.now() - 1000 * 60 * 60);
        const info = (0, TTL_1.computeTTL)(past);
        (0, vitest_1.expect)(info.isExpired).toBe(true);
        (0, vitest_1.expect)(info.labelVariant).toBe('expired');
    });
    (0, vitest_1.it)('retorna isUrgent=true si queda menos de 1h', () => {
        const soon = new Date(Date.now() + 1000 * 60 * 30); // 30 min
        const info = (0, TTL_1.computeTTL)(soon);
        (0, vitest_1.expect)(info.isUrgent).toBe(true);
        (0, vitest_1.expect)(info.labelVariant).toBe('urgent');
    });
    (0, vitest_1.it)('retorna isExpiring=true si queda menos de 3h', () => {
        const twoHours = new Date(Date.now() + 1000 * 60 * 60 * 2);
        const info = (0, TTL_1.computeTTL)(twoHours);
        (0, vitest_1.expect)(info.isExpiring).toBe(true);
        (0, vitest_1.expect)(info.labelVariant).toBe('warning');
    });
    (0, vitest_1.it)('retorna labelVariant=normal si queda mÃ¡s de 3h', () => {
        const future = new Date(Date.now() + 1000 * 60 * 60 * 10);
        const info = (0, TTL_1.computeTTL)(future);
        (0, vitest_1.expect)(info.isExpired).toBe(false);
        (0, vitest_1.expect)(info.isExpiring).toBe(false);
        (0, vitest_1.expect)(info.labelVariant).toBe('normal');
    });
});
// â”€â”€â”€ VALIDACIÃ“N PUBLICACIÃ“N â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
(0, vitest_1.describe)('validatePublicationInput', () => {
    const base = {
        title: 'Se vende moto',
        description: 'Moto en buen estado, negociable.',
        category: 'articulos',
        intent: 'ofrezco',
        department: 'casanare', municipality: 'Yopal',
        contactPhone: '3101234567',
    };
    (0, vitest_1.it)('valida input correcto', () => {
        (0, vitest_1.expect)((0, publicationValidation_1.validatePublicationInput)(base).valid).toBe(true);
    });
    (0, vitest_1.it)('falla si title estÃ¡ vacÃ­o', () => {
        const result = (0, publicationValidation_1.validatePublicationInput)({ ...base, title: '' });
        (0, vitest_1.expect)(result.valid).toBe(false);
        (0, vitest_1.expect)(result.errors.some((e) => e.field === 'title')).toBe(true);
    });
    (0, vitest_1.it)('falla con categorÃ­a invÃ¡lida', () => {
        const result = (0, publicationValidation_1.validatePublicationInput)({ ...base, category: 'moda' });
        (0, vitest_1.expect)(result.valid).toBe(false);
        (0, vitest_1.expect)(result.errors.some((e) => e.field === 'category')).toBe(true);
    });
    (0, vitest_1.it)('falla con intent invÃ¡lido', () => {
        const result = (0, publicationValidation_1.validatePublicationInput)({ ...base, intent: 'regalo' });
        (0, vitest_1.expect)(result.valid).toBe(false);
        (0, vitest_1.expect)(result.errors.some((e) => e.field === 'intent')).toBe(true);
    });
    (0, vitest_1.it)('falla con telÃ©fono muy corto', () => {
        const result = (0, publicationValidation_1.validatePublicationInput)({ ...base, contactPhone: '123' });
        (0, vitest_1.expect)(result.valid).toBe(false);
        (0, vitest_1.expect)(result.errors.some((e) => e.field === 'contactPhone')).toBe(true);
    });
    (0, vitest_1.it)('acepta precio 0', () => {
        (0, vitest_1.expect)((0, publicationValidation_1.validatePublicationInput)({ ...base, price: 0 }).valid).toBe(true);
    });
    (0, vitest_1.it)('falla con precio negativo', () => {
        const result = (0, publicationValidation_1.validatePublicationInput)({ ...base, price: -1 });
        (0, vitest_1.expect)(result.valid).toBe(false);
    });
});
// â”€â”€â”€ MEMBERSHIP RULES â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
(0, vitest_1.describe)('isMembershipActive', () => {
    (0, vitest_1.it)('retorna false si membershipUntil es null', () => {
        (0, vitest_1.expect)((0, membershipRules_1.isMembershipActive)(null)).toBe(false);
    });
    (0, vitest_1.it)('retorna false si fecha ya pasÃ³', () => {
        const past = new Date(Date.now() - 1000);
        (0, vitest_1.expect)((0, membershipRules_1.isMembershipActive)(past)).toBe(false);
    });
    (0, vitest_1.it)('retorna true si fecha es futura', () => {
        const future = new Date(Date.now() + 1000 * 60 * 60 * 24);
        (0, vitest_1.expect)((0, membershipRules_1.isMembershipActive)(future)).toBe(true);
    });
});
(0, vitest_1.describe)('computeMembershipEnd', () => {
    (0, vitest_1.it)(`agrega exactamente ${String(membershipRules_1.MEMBERSHIP_DURATION_DAYS)} dÃ­as`, () => {
        const start = new Date('2025-01-01T00:00:00Z');
        const end = (0, membershipRules_1.computeMembershipEnd)(start);
        const diffDays = (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24);
        (0, vitest_1.expect)(diffDays).toBe(membershipRules_1.MEMBERSHIP_DURATION_DAYS);
    });
});
//# sourceMappingURL=publication.test.js.map