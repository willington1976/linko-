"use strict";
// src/domain/entities/TTL.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.computeTTL = computeTTL;
function computeTTL(expiresAt) {
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
    const totalMinutes = Math.floor(diffMs / 60000);
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
function buildLabel(hours, minutes, isUrgent) {
    const pad = (n) => String(n).padStart(2, '0');
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
function resolveVariant(isUrgent, isExpiring) {
    if (isUrgent)
        return 'urgent';
    if (isExpiring)
        return 'warning';
    return 'normal';
}
//# sourceMappingURL=TTL.js.map