// src/infrastructure/dtos/MembershipDTO.ts

import type { Timestamp } from 'firebase/firestore';
import type { MembershipStatus, MembershipProvider } from '../../domain/entities/Membership';
import type { Membership } from '../../domain/entities/Membership';
import { DTOValidationError } from './DTOValidationError';

const VALID_STATUSES: MembershipStatus[] = ['active', 'expired', 'cancelled', 'pending'];
const VALID_PROVIDERS: MembershipProvider[] = ['wompi', 'manual'];

export interface MembershipDTO {
  id: string;
  businessId: string;
  status: string;
  provider: string;
  amount: number;
  currentPeriodStart: Timestamp;
  currentPeriodEnd: Timestamp;
  wompiTransactionId?: string;
  cancelledAt?: Timestamp;
  createdAt: Timestamp;
}

export function mapDTOToMembership(dto: MembershipDTO): Membership {
  const id = dto.id;

  if (!VALID_STATUSES.includes(dto.status as MembershipStatus)) {
    throw new DTOValidationError(id, 'status', `valor inválido: ${dto.status}`);
  }

  if (!VALID_PROVIDERS.includes(dto.provider as MembershipProvider)) {
    throw new DTOValidationError(id, 'provider', `valor inválido: ${dto.provider}`);
  }

  const assertTs = (field: string, v: unknown): Timestamp => {
    if (v == null || typeof (v as Record<string, unknown>).toDate !== 'function') {
      throw new DTOValidationError(id, field, 'debe ser Firestore Timestamp');
    }
    return v as Timestamp;
  };

  return {
    id,
    businessId:          dto.businessId,
    status:              dto.status as MembershipStatus,
    provider:            dto.provider as MembershipProvider,
    amount:              dto.amount,
    currentPeriodStart:  assertTs('currentPeriodStart', dto.currentPeriodStart).toDate(),
    currentPeriodEnd:    assertTs('currentPeriodEnd', dto.currentPeriodEnd).toDate(),
    wompiTransactionId:  dto.wompiTransactionId,
    cancelledAt:         dto.cancelledAt ? dto.cancelledAt.toDate() : undefined,
    createdAt:           assertTs('createdAt', dto.createdAt).toDate(),
  };
}