// src/domain/validation/businessValidation.ts

import { VALID_BUSINESS_CATEGORIES } from '../entities/Business';
import type { BusinessCategory } from '../entities/Business';

export const BUSINESS_LIMITS = {
  name:        { min: 2,  max: 100 },
  description: { min: 10, max: 500 },
  phone:       { min: 7,  max: 20 },
  address:     { min: 5,  max: 200 },
  location:    { min: 2,  max: 100 },
} as const;

export interface BusinessValidationInput {
  name: string;
  description: string;
  category: string;
  phone: string;
  address: string;
  location: string;
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
}

export interface ValidationError {
  field: string;
  message: string;
}

export function validateBusinessInput(
  input: BusinessValidationInput,
): ValidationResult {
  const errors: ValidationError[] = [];

  const name = input.name.trim();
  if (name.length < BUSINESS_LIMITS.name.min) {
    errors.push({ field: 'name', message: 'El nombre del negocio es requerido.' });
  } else if (name.length > BUSINESS_LIMITS.name.max) {
    errors.push({ field: 'name', message: `El nombre no puede superar ${String(BUSINESS_LIMITS.name.max)} caracteres.` });
  }

  const description = input.description.trim();
  if (description.length < BUSINESS_LIMITS.description.min) {
    errors.push({ field: 'description', message: `La descripción debe tener al menos ${String(BUSINESS_LIMITS.description.min)} caracteres.` });
  } else if (description.length > BUSINESS_LIMITS.description.max) {
    errors.push({ field: 'description', message: `La descripción no puede superar ${String(BUSINESS_LIMITS.description.max)} caracteres.` });
  }

  if (!VALID_BUSINESS_CATEGORIES.includes(input.category as BusinessCategory)) {
    errors.push({ field: 'category', message: 'Categoría de negocio no válida.' });
  }

  const phone = input.phone.trim();
  if (phone.length < BUSINESS_LIMITS.phone.min || phone.length > BUSINESS_LIMITS.phone.max) {
    errors.push({ field: 'phone', message: 'Número de teléfono inválido.' });
  }

  const address = input.address.trim();
  if (address.length < BUSINESS_LIMITS.address.min) {
    errors.push({ field: 'address', message: 'La dirección es requerida.' });
  } else if (address.length > BUSINESS_LIMITS.address.max) {
    errors.push({ field: 'address', message: `La dirección no puede superar ${String(BUSINESS_LIMITS.address.max)} caracteres.` });
  }

  const location = input.location.trim();
  if (location.length < BUSINESS_LIMITS.location.min) {
    errors.push({ field: 'location', message: 'La ciudad/barrio es requerida.' });
  } else if (location.length > BUSINESS_LIMITS.location.max) {
    errors.push({ field: 'location', message: `La ubicación no puede superar ${String(BUSINESS_LIMITS.location.max)} caracteres.` });
  }

  return { valid: errors.length === 0, errors };
}

export function getFieldError(
  errors: ValidationError[],
  field: string,
): string | undefined {
  return errors.find((e) => e.field === field)?.message;
}