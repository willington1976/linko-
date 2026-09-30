// src/infrastructure/dtos/BusinessDTO.ts

import type { Timestamp } from 'firebase/firestore';
import type { BusinessCategory, Business } from '../../domain/entities/Business';
import { VALID_BUSINESS_CATEGORIES, DEFAULT_MEMBERSHIP } from '../../domain/entities/Business';
import { DTOValidationError } from './DTOValidationError';

export interface BusinessDTO {
  businessId: string;
  businessName: string;
  description: string;
  category: string;
  contactPhone: string;
  logoURL: string;
  municipality: string;
  department: string;
  ownerId: string;
  membership: {
    status: string;
    plan: string;
    price: number;
    startDate: Timestamp | null;
    expiresAt: Timestamp | null;
    wompiPaymentId: string | null;
  };
  createdAt: Timestamp;
}

export function mapDTOToBusiness(dto: BusinessDTO): Business {
  const id = dto.businessId;

  const category = dto.category;
  if (!VALID_BUSINESS_CATEGORIES.includes(category as BusinessCategory)) {
    throw new DTOValidationError(id, 'category', `valor invalido: ${category}`);
  }

  if (
    dto.createdAt == null ||
    typeof (dto.createdAt as { toDate?: unknown }).toDate !== 'function'
  ) {
    throw new DTOValidationError(id, 'createdAt', 'debe ser Firestore Timestamp');
  }

  const mem = dto.membership ?? {};

  return {
    businessId:   id,
    businessName: dto.businessName ?? '',
    description:  dto.description ?? '',
    category:     category as BusinessCategory,
    contactPhone: dto.contactPhone ?? '',
    logoURL:      dto.logoURL ?? '',
    municipality: dto.municipality ?? '',
    department:   dto.department ?? 'casanare',
    ownerId:      dto.ownerId ?? '',
    createdAt:    dto.createdAt.toDate(),
    membership: {
      ...DEFAULT_MEMBERSHIP,
      status:         (mem.status as Business['membership']['status']) ?? 'inactive',
      plan:           (mem.plan   as Business['membership']['plan'])   ?? 'monthly',
      price:          mem.price ?? 10000,
      startDate:      mem.startDate ? mem.startDate.toDate() : null,
      expiresAt:      mem.expiresAt ? mem.expiresAt.toDate() : null,
      wompiPaymentId: mem.wompiPaymentId ?? null,
    },
  };
}