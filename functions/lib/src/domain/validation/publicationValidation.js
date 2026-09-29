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
    price: { min: 0, max: 999999999 },
    contactPhone: { min: 7, max: 20 },
};
function validatePublicationInput(input) {
    const errors = [];
    const title = input.title.trim();
    if (title.length < exports.PUBLICATION_LIMITS.title.min) {
        errors.push({ field: 'title', message: 'El titulo es requerido.' });
    }
    else if (title.length > exports.PUBLICATION_LIMITS.title.max) {
        errors.push({ field: 'title', message: `El titulo no puede superar ${String(exports.PUBLICATION_LIMITS.title.max)} caracteres.` });
    }
    const description = input.description.trim();
    if (description.length < exports.PUBLICATION_LIMITS.description.min) {
        errors.push({ field: 'description', message: 'La descripcion es requerida.' });
    }
    else if (description.length > exports.PUBLICATION_LIMITS.description.max) {
        errors.push({ field: 'description', message: `La descripcion no puede superar ${String(exports.PUBLICATION_LIMITS.description.max)} caracteres.` });
    }
    if (!Publication_1.VALID_CATEGORIES.includes(input.category)) {
        errors.push({ field: 'category', message: 'Categoria no valida.' });
    }
    if (!Publication_1.VALID_INTENTS.includes(input.intent)) {
        errors.push({ field: 'intent', message: 'Intencion no valida.' });
    }
    if (!Publication_1.CASANARE_MUNICIPALITIES.includes(input.municipality)) {
        errors.push({ field: 'municipality', message: 'Municipio no valido.' });
    }
    if (input.price !== undefined) {
        if (input.price < exports.PUBLICATION_LIMITS.price.min || input.price > exports.PUBLICATION_LIMITS.price.max) {
            errors.push({ field: 'price', message: `El precio debe estar entre ${String(exports.PUBLICATION_LIMITS.price.min)} y ${String(exports.PUBLICATION_LIMITS.price.max)}.` });
        }
    }
    const phone = input.contactPhone.trim();
    if (phone.length < exports.PUBLICATION_LIMITS.contactPhone.min || phone.length > exports.PUBLICATION_LIMITS.contactPhone.max) {
        errors.push({ field: 'contactPhone', message: 'Numero de contacto invalido.' });
    }
    return { valid: errors.length === 0, errors };
}
function getFieldError(errors, field) {
    return errors.find((e) => e.field === field)?.message;
}
//# sourceMappingURL=publicationValidation.js.map