// src/domain/usecases/CreatePublication.ts

import type { PublicationCategory, PublicationIntent, PublicationType } from '../entities/Publication';

// Solo los campos que el cliente puede enviar — el servidor determina el resto
export interface CreatePublicationInput {
  title: string;
  description: string;
  category: PublicationCategory;
  intent: PublicationIntent;
  department: string;
  municipality: string;
  location?: string;
  price?: number;
  contactPhone: string;
  publicationType: PublicationType;
  photos: string[];
  businessId?: string;
}

// Lo que devuelve la Cloud Function al cliente
export interface CreatePublicationResult {
  publicationId: string;
  expiresAt: Date;
  ttlHours: number;
}
