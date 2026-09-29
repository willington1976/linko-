// src/infrastructure/dtos/PublicationDTO.ts

import type { Timestamp } from 'firebase/firestore';
import type {
  PublicationCategory,
  PublicationIntent,
  PublicationStatus,
  PublicationType,
  Publication,
  CasanareMunicipality,
} from '../../domain/entities/Publication';
import {
  VALID_CATEGORIES,
  VALID_INTENTS,
  VALID_STATUSES,
  CASANARE_MUNICIPALITIES,
} from '../../domain/entities/Publication';
import { DTOValidationError } from './DTOValidationError';

export interface PublicationDTO {
  title:                string;
  description:          string;
  category:             string;
  intent:               string;
  price?:               number;
  department:           string;
  municipality:         string;
  publicationType:      string;
  photos:               string[];
  businessId?:          string;
  authorId:             string;
  authorName:           string;
  authorVerified:       boolean;
  authorCompletedCount: number;
  status:               string;
  ttlHours:             number;
  createdAt:            Timestamp;
  expiresAt:            Timestamp;
  renewedAt?:           Timestamp;
}

export function mapDTOToPublication(id: string, dto: PublicationDTO): Publication {
  if (!dto.title || typeof dto.title !== 'string') {
    throw new DTOValidationError(id, 'title', 'requerido');
  }
  if (!VALID_CATEGORIES.includes(dto.category as PublicationCategory)) {
    throw new DTOValidationError(id, 'category', `valor invalido: ${dto.category}`);
  }
  if (!VALID_INTENTS.includes(dto.intent as PublicationIntent)) {
    throw new DTOValidationError(id, 'intent', `valor invalido: ${dto.intent}`);
  }
  if (!VALID_STATUSES.includes(dto.status as PublicationStatus)) {
    throw new DTOValidationError(id, 'status', `valor invalido: ${dto.status}`);
  }
  if (!(CASANARE_MUNICIPALITIES as readonly string[]).includes(dto.municipality)) {
    throw new DTOValidationError(id, 'municipality', `valor invalido: ${dto.municipality}`);
  }
  if (
    dto.createdAt == null ||
    typeof (dto.createdAt as { toDate?: unknown }).toDate !== 'function'
  ) {
    throw new DTOValidationError(id, 'createdAt', 'debe ser Firestore Timestamp');
  }
  if (
    dto.expiresAt == null ||
    typeof (dto.expiresAt as { toDate?: unknown }).toDate !== 'function'
  ) {
    throw new DTOValidationError(id, 'expiresAt', 'debe ser Firestore Timestamp');
  }

  return {
    id,
    title:                dto.title,
    description:          dto.description ?? '',
    category:             dto.category as PublicationCategory,
    intent:               dto.intent as PublicationIntent,
    price:                dto.price,
    department:           dto.department ?? 'casanare',
    municipality:         dto.municipality as CasanareMunicipality,
    publicationType:      dto.publicationType as PublicationType,
    photos:               Array.isArray(dto.photos) ? dto.photos : [],
    businessId:           dto.businessId,
    authorId:             dto.authorId,
    authorName:           dto.authorName ?? '',
    authorVerified:       dto.authorVerified ?? false,
    authorCompletedCount: dto.authorCompletedCount ?? 0,
    status:               dto.status as PublicationStatus,
    ttlHours:             dto.ttlHours,
    createdAt:            dto.createdAt.toDate(),
    expiresAt:            dto.expiresAt.toDate(),
    renewedAt:            dto.renewedAt?.toDate(),
  };
}