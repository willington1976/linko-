// src/infrastructure/dtos/BusinessDTO.ts

import type { Timestamp } from 'firebase/firestore';
import type { BusinessCategory } from '../../domain/entities/Business';
import { VALID_BUSINESS_CATEGORIES } from '../../domain/entities/Business';
import type { Business } from '../../domain/entities/Business';
import { DTOValidationError } from './DTOValidationError';

export interface BusinessDTO {
  id: string;
  name: string;
  description: string;
  category: string;
  phone: string;
  address: string;
  location: string;
  logo?: string;
  ownerId: string;
  membershipActive: boolean;
  membershipUntil: Timestamp | null;
  verified: boolean;
  createdAt: Timestamp;
}

export function mapDTOToBusiness(dto: BusinessDTO): Business {
  const id = dto.id;

  const category = dto.category;
  if (!VALID_BUSINESS_CATEGORIES.includes(category as BusinessCategory)) {
    throw new DTOValidationError(id, 'category', `valor inválido: ${category}`);
  }

  if (typeof dto.membershipActive !== 'boolean') {
    throw new DTOValidationError(id, 'membershipActive', 'debe ser boolean');
  }

  if (
    dto.createdAt == null ||
    typeof (dto.createdAt as Record<string, unknown>).toDate !== 'function'
  ) {
    throw new DTOValidationError(id, 'createdAt', 'debe ser Firestore Timestamp');
  }

  return {
    id,
    name:             dto.name,
    description:      dto.description,
    category:         category as BusinessCategory,
    phone:            dto.phone,
    address:          dto.address,
    location:         dto.location,
    logo:             dto.logo,
    ownerId:          dto.ownerId,
    membershipActive: dto.membershipActive,
    membershipUntil:  dto.membershipUntil ? dto.membershipUntil.toDate() : null,
    verified:         typeof dto.verified === 'boolean' ? dto.verified : false,
    createdAt:        dto.createdAt.toDate(),
  };
}