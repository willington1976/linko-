// src/domain/usecases/CreatePublication.ts

import type { PublicationCategory, PublicationIntent, PublicationType } from '../entities/Publication';

// Solo los campos que el cliente puede enviar — el servidor determina el resto
export interface CreatePublicationInput {
  title: string;
  description: string;
  category: PublicationCategory;
  intent: PublicationIntent;
  location: string;
  price?: number;
  contactPhone: string;
  publicationType: PublicationType;
  photos: string[];        // URLs ya subidas a Storage antes de llamar la CF
  businessId?: string;     // requerido si publicationType === 'business'
}

// Lo que devuelve la Cloud Function al cliente
export interface CreatePublicationResult {
  publicationId: string;
  expiresAt: Date;
  ttlHours: number;
}