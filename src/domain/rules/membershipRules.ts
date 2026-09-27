// src/domain/rules/membershipRules.ts

export const MEMBERSHIP_PRICE_COP = 120_000;
export const MEMBERSHIP_DURATION_DAYS = 30;
export const MAX_PHOTOS_BUSINESS = 5;
export const MAX_PHOTOS_PERSONAL = 1;

export function computeMembershipEnd(startDate: Date): Date {
  const end = new Date(startDate);
  end.setDate(end.getDate() + MEMBERSHIP_DURATION_DAYS);
  return end;
}

export function isMembershipActive(membershipUntil: Date | null): boolean {
  if (!membershipUntil) return false;
  return membershipUntil.getTime() > Date.now();
}