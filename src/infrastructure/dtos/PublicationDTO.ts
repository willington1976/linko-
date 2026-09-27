// src/infrastructure/dtos/PublicationDTO.ts

import type { Timestamp } from 'firebase/firestore';
import type {
  PublicationCategory,
  PublicationIntent,
  PublicationStatus,
  PublicationType,
} from '../../domain/entities/Publication';
import {
  VALID_CATEGORIES,
  VALID_INTENTS,
  VALID_STATUSES,
} from '../../domain/entities/Publication';
import type { Publication } from '../../domain/entities/Publication';
import { DTOValidationError } from './DTOValidationError';

export interface PublicationDTO {
  id: string;
  title: string;
  description: string;
  category: string;
  intent: string;
  price?: number;
  location: string;
  distanceKm?: number;
  publicationType: string;
  photos: string[];
  businessId?: string;
  authorId: string;
  authorName: string;
  authorVerified: boolean;
  authorCompletedCount: number;
  status: string;
  ttlHours: number;
  createdAt: Timestamp;
  expiresAt: Timestamp;
  renewedAt?: Timestamp;
}

function assertString(docId: string, field: string, value: unknown): string {
  if (typeof value !== 'string' || value.trim() === '') {
    throw new DTOValidationError(docId, field, 'debe ser string no vacío');
  }
  return value;
}

function assertNumber(docId: string, field: string, value: unknown): number {
  if (typeof value !== 'number' || !isFinite(value)) {
    throw new DTOValidationError(docId, field, 'debe ser número finito');
  }
  return value;
}

function assertBoolean(docId: string, field: string, value: unknown): boolean {
  if (typeof value !== 'boolean') {
    throw new DTOValidationError(docId, field, 'debe ser boolean');
  }
  return value;
}

function assertTimestamp(docId: string, field: string, value: unknown): Timestamp {
  if (
    value == null ||
    typeof (value as Record<string, unknown>).toDate !== 'function'
  ) {
    throw new DTOValidationError(docId, field, 'debe ser Firestore Timestamp');
  }
  return value as Timestamp;
}

export function mapDTOToPublication(dto: PublicationDTO): Publication {
  const id = dto.id;

  const category = assertString(id, 'category', dto.category);
  if (!VALID_CATEGORIES.includes(category as PublicationCategory)) {
    throw new DTOValidationError(id, 'category', `valor inválido: ${category}`);
  }

  const intent = assertString(id, 'intent', dto.intent);
  if (!VALID_INTENTS.includes(intent as PublicationIntent)) {
    throw new DTOValidationError(id, 'intent', `valor inválido: ${intent}`);
  }

  const status = assertString(id, 'status', dto.status);
  if (!VALID_STATUSES.includes(status as PublicationStatus)) {
    throw new DTOValidationError(id, 'status', `valor inválido: ${status}`);
  }

  const publicationType = assertString(id, 'publicationType', dto.publicationType);
  if (publicationType !== 'personal' && publicationType !== 'business') {
    throw new DTOValidationError(id, 'publicationType', `valor inválido: ${publicationType}`);
  }

  return {
    id,
    title:                assertString(id, 'title', dto.title),
    description:          assertString(id, 'description', dto.description),
    category:             category as PublicationCategory,
    intent:               intent as PublicationIntent,
    price:                dto.price,
    location:             assertString(id, 'location', dto.location),
    distanceKm:           dto.distanceKm,
    publicationType:      publicationType as PublicationType,
    photos:               Array.isArray(dto.photos) ? dto.photos : [],
    businessId:           dto.businessId,
    authorId:             assertString(id, 'authorId', dto.authorId),
    authorName:           assertString(id, 'authorName', dto.authorName),
    authorVerified:       assertBoolean(id, 'authorVerified', dto.authorVerified),
    authorCompletedCount: assertNumber(id, 'authorCompletedCount', dto.authorCompletedCount),
    status:               status as PublicationStatus,
    ttlHours:             assertNumber(id, 'ttlHours', dto.ttlHours),
    createdAt:            assertTimestamp(id, 'createdAt', dto.createdAt).toDate(),
    expiresAt:            assertTimestamp(id, 'expiresAt', dto.expiresAt).toDate(),
    renewedAt:            dto.renewedAt ? dto.renewedAt.toDate() : undefined,
  };
}