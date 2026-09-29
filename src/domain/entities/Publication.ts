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

export const CASANARE_MUNICIPALITIES = [
  'Aguazul',
  'Chameza',
  'Hato Corozal',
  'La Salina',
  'Mani',
  'Monterrey',
  'Nunchia',
  'Orocue',
  'Paz de Ariporo',
  'Pore',
  'Recetor',
  'Sabanalarga',
  'Sacama',
  'San Luis de Palenque',
  'Tamara',
  'Tauramena',
  'Trinidad',
  'Villanueva',
  'Yopal',
] as const;

export type CasanareMunicipality = typeof CASANARE_MUNICIPALITIES[number];

export interface Publication {
  id: string;
  title: string;
  description: string;
  category: PublicationCategory;
  intent: PublicationIntent;
  price?: number;
  department: string;
  municipality: CasanareMunicipality;

  publicationType: PublicationType;
  photos: string[];
  businessId?: string;

  authorId: string;
  authorName: string;
  authorVerified: boolean;
  authorCompletedCount: number;

  status: PublicationStatus;
  ttlHours: number;
  createdAt: Date;
  expiresAt: Date;
  renewedAt?: Date;
}

export interface PublicationContact {
  contactPhone: string;
}