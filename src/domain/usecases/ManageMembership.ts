// src/domain/usecases/ManageMembership.ts

export interface ActivateMembershipInput {
  businessId: string;
  wompiTransactionId: string;
  amountCOP: number;
}

export interface ActivateMembershipResult {
  membershipId: string;
  membershipUntil: Date;
}

export interface CancelMembershipInput {
  businessId: string;
  membershipId: string;
}

export interface CancelMembershipResult {
  cancelledAt: Date;
}