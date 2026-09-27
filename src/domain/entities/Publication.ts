// src/domain/entities/Publication.ts

export type PublicationCategory =
  | 'empleo'
  | 'inmuebles'
  | 'articulos'
  | 'servicios'
  | 'urgente';

export type PublicationIntent = 'busco' | 'ofrezco';

export type PublicationStatus =
  | 'activa'
  | 'expirando'
  | 'expirada'
  | 'pausada'
  | 'vendida'
  | 'conseguida';

export type PublicationType = 'personal' | 'business';

export const VALID_CATEGORIES: PublicationCategory[] = [
  'empleo',
  'inmuebles',
  'articulos',
  'servicios',
  'urgente',
];

export const VALID_INTENTS: PublicationIntent[] = ['busco', 'ofrezco'];

export const VALID_STATUSES: PublicationStatus[] = [
  'activa',
  'expirando',
  'expirada',
  'pausada',
  'vendida',
  'conseguida',
];

export interface Publication {
  id: string;
  title: string;
  description: string;
  category: PublicationCategory;
  intent: PublicationIntent;
  price?: number;
  location: string;
  distanceKm?: number;

  // Tipo y fotos
  publicationType: PublicationType;
  photos: string[];        // [] para personal (máx 1), hasta 5 para business
  businessId?: string;     // solo si publicationType === 'business'

  // Autor
  authorId: string;
  authorName: string;
  authorVerified: boolean;
  authorCompletedCount: number;

  // Estado y tiempo
  status: PublicationStatus;
  ttlHours: number;
  createdAt: Date;
  expiresAt: Date;
  renewedAt?: Date;
}

export interface PublicationContact {
  contactPhone: string;
}