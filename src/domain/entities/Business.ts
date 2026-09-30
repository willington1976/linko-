// src/domain/entities/Business.ts

export type MembershipStatus = 'inactive' | 'active' | 'expired';
export type MembershipPlan = 'monthly';
export type BusinessCategory =
  | 'restaurante'
  | 'transporte'
  | 'construccion'
  | 'salud'
  | 'educacion'
  | 'tecnologia'
  | 'comercio'
  | 'servicios'
  | 'agropecuario'
  | 'otro';

export interface BusinessMembership {
  status: MembershipStatus;
  plan: MembershipPlan;
  price: number;
  startDate: Date | null;
  expiresAt: Date | null;
  wompiPaymentId: string | null;
}

export interface Business {
  businessId: string;
  ownerId: string;
  businessName: string;
  category: BusinessCategory;
  contactPhone: string;
  logoURL: string;
  description: string;
  municipality: string;
  department: string;
  createdAt: Date;
  membership: BusinessMembership;
}

export const DEFAULT_MEMBERSHIP: BusinessMembership = {
  status: 'inactive',
  plan: 'monthly',
  price: 10000,
  startDate: null,
  expiresAt: null,
  wompiPaymentId: null,
};

export const BUSINESS_CATEGORIES: { value: BusinessCategory; label: string }[] = [
  { value: 'restaurante',  label: 'Restaurante / Alimentacion' },
  { value: 'transporte',   label: 'Transporte' },
  { value: 'construccion', label: 'Construccion' },
  { value: 'salud',        label: 'Salud y Bienestar' },
  { value: 'educacion',    label: 'Educacion' },
  { value: 'tecnologia',   label: 'Tecnologia' },
  { value: 'comercio',     label: 'Comercio / Tienda' },
  { value: 'servicios',    label: 'Servicios Generales' },
  { value: 'agropecuario', label: 'Agropecuario' },
  { value: 'otro',         label: 'Otro' },
];

// Alias para compatibilidad con archivos existentes
export const VALID_BUSINESS_CATEGORIES: BusinessCategory[] = BUSINESS_CATEGORIES.map((c) => c.value);