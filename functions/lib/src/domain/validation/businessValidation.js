"use strict";
// src/domain/validation/businessValidation.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.BUSINESS_LIMITS = void 0;
exports.validateBusinessInput = validateBusinessInput;
exports.getFieldError = getFieldError;
const Business_1 = require("../entities/Business");
exports.BUSINESS_LIMITS = {
    name: { min: 2, max: 100 },
    description: { min: 10, max: 500 },
    phone: { min: 7, max: 20 },
    address: { min: 5, max: 200 },
    location: { min: 2, max: 100 },
};
function validateBusinessInput(input) {
    const errors = [];
    const name = input.name.trim();
    if (name.length < exports.BUSINESS_LIMITS.name.min) {
        errors.push({ field: 'name', message: 'El nombre del negocio es requerido.' });
    }
    else if (name.length > exports.BUSINESS_LIMITS.name.max) {
        errors.push({ field: 'name', message: `El nombre no puede superar ${String(exports.BUSINESS_LIMITS.name.max)} caracteres.` });
    }
    const description = input.description.trim();
    if (description.length < exports.BUSINESS_LIMITS.description.min) {
        errors.push({ field: 'description', message: `La descripción debe tener al menos ${String(exports.BUSINESS_LIMITS.description.min)} caracteres.` });
    }
    else if (description.length > exports.BUSINESS_LIMITS.description.max) {
        errors.push({ field: 'description', message: `La descripción no puede superar ${String(exports.BUSINESS_LIMITS.description.max)} caracteres.` });
    }
    if (!Business_1.VALID_BUSINESS_CATEGORIES.includes(input.category)) {
        errors.push({ field: 'category', message: 'Categoría de negocio no válida.' });
    }
    const phone = input.phone.trim();
    if (phone.length < exports.BUSINESS_LIMITS.phone.min || phone.length > exports.BUSINESS_LIMITS.phone.max) {
        errors.push({ field: 'phone', message: 'Número de teléfono inválido.' });
    }
    const address = input.address.trim();
    if (address.length < exports.BUSINESS_LIMITS.address.min) {
        errors.push({ field: 'address', message: 'La dirección es requerida.' });
    }
    else if (address.length > exports.BUSINESS_LIMITS.address.max) {
        errors.push({ field: 'address', message: `La dirección no puede superar ${String(exports.BUSINESS_LIMITS.address.max)} caracteres.` });
    }
    const location = input.location.trim();
    if (location.length < exports.BUSINESS_LIMITS.location.min) {
        errors.push({ field: 'location', message: 'La ciudad/barrio es requerida.' });
    }
    else if (location.length > exports.BUSINESS_LIMITS.location.max) {
        errors.push({ field: 'location', message: `La ubicación no puede superar ${String(exports.BUSINESS_LIMITS.location.max)} caracteres.` });
    }
    return { valid: errors.length === 0, errors };
}
function getFieldError(errors, field) {
    return errors.find((e) => e.field === field)?.message;
}
//# sourceMappingURL=businessValidation.js.map