// src/domain/validation/publicationValidation.ts

import { VALID_CATEGORIES, VALID_INTENTS } from '../entities/Publication';
import type { PublicationCategory, PublicationIntent } from '../entities/Publication';

export const PUBLICATION_LIMITS = {
  title:        { min: 1,  max: 200 },
  description:  { min: 1,  max: 2000 },
  location:     { min: 1,  max: 100 },
  price:        { min: 0,  max: 999_999_999 },
  contactPhone: { min: 7,  max: 20 },
} as const;

export interface PublicationValidationInput {
  title: string;
  description: string;
  category: string;
  intent: string;
  location: string;
  price?: number;
  contactPhone: string;
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
}

export interface ValidationError {
  field: string;
  message: string;
}

export function validatePublicationInput(
  input: PublicationValidationInput,
): ValidationResult {
  const errors: ValidationError[] = [];

  const title = input.title.trim();
  if (title.length < PUBLICATION_LIMITS.title.min) {
    errors.push({ field: 'title', message: 'El título es requerido.' });
  } else if (title.length > PUBLICATION_LIMITS.title.max) {
    errors.push({ field: 'title', message: `El título no puede superar ${String(PUBLICATION_LIMITS.title.max)} caracteres.` });
  }

  const description = input.description.trim();
  if (description.length < PUBLICATION_LIMITS.description.min) {
    errors.push({ field: 'description', message: 'La descripción es requerida.' });
  } else if (description.length > PUBLICATION_LIMITS.description.max) {
    errors.push({ field: 'description', message: `La descripción no puede superar ${String(PUBLICATION_LIMITS.description.max)} caracteres.` });
  }

  if (!VALID_CATEGORIES.includes(input.category as PublicationCategory)) {
    errors.push({ field: 'category', message: 'Categoría no válida.' });
  }

  if (!VALID_INTENTS.includes(input.intent as PublicationIntent)) {
    errors.push({ field: 'intent', message: 'Intención no válida. Usa "busco" u "ofrezco".' });
  }

  const location = input.location.trim();
  if (location.length < PUBLICATION_LIMITS.location.min) {
    errors.push({ field: 'location', message: 'La ubicación es requerida.' });
  } else if (location.length > PUBLICATION_LIMITS.location.max) {
    errors.push({ field: 'location', message: `La ubicación no puede superar ${String(PUBLICATION_LIMITS.location.max)} caracteres.` });
  }

  if (input.price !== undefined) {
    if (input.price < PUBLICATION_LIMITS.price.min || input.price > PUBLICATION_LIMITS.price.max) {
      errors.push({ field: 'price', message: `El precio debe estar entre ${String(PUBLICATION_LIMITS.price.min)} y ${String(PUBLICATION_LIMITS.price.max)}.` });
    }
  }

  const phone = input.contactPhone.trim();
  if (phone.length < PUBLICATION_LIMITS.contactPhone.min || phone.length > PUBLICATION_LIMITS.contactPhone.max) {
    errors.push({ field: 'contactPhone', message: 'Número de contacto inválido.' });
  }

  return { valid: errors.length === 0, errors };
}

export function getFieldError(
  errors: ValidationError[],
  field: string,
): string | undefined {
  return errors.find((e) => e.field === field)?.message;
}