// src/domain/entities/Membership.ts

export type MembershipStatus =
  | 'active'
  | 'expired'
  | 'cancelled'
  | 'pending';

export type MembershipProvider = 'wompi' | 'manual';

export interface Membership {
  id: string;
  businessId: string;
  status: MembershipStatus;
  provider: MembershipProvider;
  amount: number;           // en pesos colombianos
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  wompiTransactionId?: string;
  cancelledAt?: Date;
  createdAt: Date;
}