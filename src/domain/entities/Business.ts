// src/domain/entities/Business.ts

export type BusinessCategory =
  | 'restaurante'
  | 'tienda'
  | 'taller'
  | 'salud'
  | 'educacion'
  | 'servicios'
  | 'construccion'
  | 'otro';

export const VALID_BUSINESS_CATEGORIES: BusinessCategory[] = [
  'restaurante',
  'tienda',
  'taller',
  'salud',
  'educacion',
  'servicios',
  'construccion',
  'otro',
];

export interface Business {
  id: string;
  name: string;
  description: string;
  category: BusinessCategory;
  phone: string;
  address: string;
  location: string;        // ciudad/barrio legible
  logo?: string;           // URL Firebase Storage
  ownerId: string;         // uid Firebase Auth
  membershipActive: boolean;
  membershipUntil: Date | null;
  verified: boolean;
  createdAt: Date;
}