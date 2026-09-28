"use strict";
// src/domain/validation/publicationValidation.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.PUBLICATION_LIMITS = void 0;
exports.validatePublicationInput = validatePublicationInput;
exports.getFieldError = getFieldError;
const Publication_1 = require("../entities/Publication");
exports.PUBLICATION_LIMITS = {
    title: { min: 1, max: 200 },
    description: { min: 1, max: 2000 },
    location: { min: 1, max: 100 },
    price: { min: 0, max: 999999999 },
    contactPhone: { min: 7, max: 20 },
};
function validatePublicationInput(input) {
    const errors = [];
    const title = input.title.trim();
    if (title.length < exports.PUBLICATION_LIMITS.title.min) {
        errors.push({ field: 'title', message: 'El título es requerido.' });
    }
    else if (title.length > exports.PUBLICATION_LIMITS.title.max) {
        errors.push({ field: 'title', message: `El título no puede superar ${String(exports.PUBLICATION_LIMITS.title.max)} caracteres.` });
    }
    const description = input.description.trim();
    if (description.length < exports.PUBLICATION_LIMITS.description.min) {
        errors.push({ field: 'description', message: 'La descripción es requerida.' });
    }
    else if (description.length > exports.PUBLICATION_LIMITS.description.max) {
        errors.push({ field: 'description', message: `La descripción no puede superar ${String(exports.PUBLICATION_LIMITS.description.max)} caracteres.` });
    }
    if (!Publication_1.VALID_CATEGORIES.includes(input.category)) {
        errors.push({ field: 'category', message: 'Categoría no válida.' });
    }
    if (!Publication_1.VALID_INTENTS.includes(input.intent)) {
        errors.push({ field: 'intent', message: 'Intención no válida. Usa "busco" u "ofrezco".' });
    }
    const location = input.location.trim();
    if (location.length < exports.PUBLICATION_LIMITS.location.min) {
        errors.push({ field: 'location', message: 'La ubicación es requerida.' });
    }
    else if (location.length > exports.PUBLICATION_LIMITS.location.max) {
        errors.push({ field: 'location', message: `La ubicación no puede superar ${String(exports.PUBLICATION_LIMITS.location.max)} caracteres.` });
    }
    if (input.price !== undefined) {
        if (input.price < exports.PUBLICATION_LIMITS.price.min || input.price > exports.PUBLICATION_LIMITS.price.max) {
            errors.push({ field: 'price', message: `El precio debe estar entre ${String(exports.PUBLICATION_LIMITS.price.min)} y ${String(exports.PUBLICATION_LIMITS.price.max)}.` });
        }
    }
    const phone = input.contactPhone.trim();
    if (phone.length < exports.PUBLICATION_LIMITS.contactPhone.min || phone.length > exports.PUBLICATION_LIMITS.contactPhone.max) {
        errors.push({ field: 'contactPhone', message: 'Número de contacto inválido.' });
    }
    return { valid: errors.length === 0, errors };
}
function getFieldError(errors, field) {
    return errors.find((e) => e.field === field)?.message;
}
//# sourceMappingURL=publicationValidation.js.map