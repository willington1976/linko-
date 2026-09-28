"use strict";
// src/domain/rules/ttlRules.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.TTL_HOURS_BY_CATEGORY = void 0;
exports.getTTLHours = getTTLHours;
exports.computeExpiresAt = computeExpiresAt;
exports.TTL_HOURS_BY_CATEGORY = {
    empleo: 72,
    inmuebles: 48,
    articulos: 24,
    servicios: 36,
    urgente: 6,
};
function getTTLHours(category) {
    return exports.TTL_HOURS_BY_CATEGORY[category];
}
function computeExpiresAt(createdAt, category) {
    const ttlMs = getTTLHours(category) * 60 * 60 * 1000;
    return new Date(createdAt.getTime() + ttlMs);
}
//# sourceMappingURL=ttlRules.js.map