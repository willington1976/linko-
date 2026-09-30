// src/infrastructure/firebase/businessService.ts

import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { db } from './firebaseConfig';
import type { Business, BusinessMembership } from '../../domain/entities/Business';
import { DEFAULT_MEMBERSHIP } from '../../domain/entities/Business';

function toDate(val: unknown): Date | null {
  if (!val) return null;
  if (val instanceof Timestamp) return val.toDate();
  if (val instanceof Date) return val;
  return null;
}

function fromFirestore(data: Record<string, unknown>, id: string): Business {
  const mem = (data['membership'] as Record<string, unknown>) ?? {};
  const membership: BusinessMembership = {
    status:         (mem['status'] as BusinessMembership['status']) ?? 'inactive',
    plan:           (mem['plan']   as BusinessMembership['plan'])   ?? 'monthly',
    price:          (mem['price']  as number)                       ?? 10000,
    startDate:      toDate(mem['startDate']),
    expiresAt:      toDate(mem['expiresAt']),
    wompiPaymentId: (mem['wompiPaymentId'] as string | null)        ?? null,
  };

  return {
    businessId:   id,
    ownerId:      (data['ownerId']      as string) ?? '',
    businessName: (data['businessName'] as string) ?? '',
    category:     (data['category']    as Business['category']) ?? 'otro',
    contactPhone: (data['contactPhone'] as string) ?? '',
    logoURL:      (data['logoURL']      as string) ?? '',
    description:  (data['description'] as string) ?? '',
    municipality: (data['municipality'] as string) ?? '',
    department:   (data['department']  as string) ?? 'casanare',
    createdAt:    toDate(data['createdAt']) ?? new Date(),
    membership,
  };
}

export async function getBusiness(userId: string): Promise<Business | null> {
  const ref = doc(db, 'businesses', userId);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  return fromFirestore(snap.data() as Record<string, unknown>, snap.id);
}

export async function createBusiness(
  userId: string,
  data: Omit<Business, 'businessId' | 'createdAt' | 'membership'>
): Promise<void> {
  const ref = doc(db, 'businesses', userId);
  await setDoc(ref, {
    ...data,
    businessId: userId,
    createdAt: serverTimestamp(),
    membership: {
      ...DEFAULT_MEMBERSHIP,
      startDate:      null,
      expiresAt:      null,
      wompiPaymentId: null,
    },
  });
}

export async function updateBusinessMembership(
  userId: string,
  membership: Partial<BusinessMembership>
): Promise<void> {
  const ref = doc(db, 'businesses', userId);
  await updateDoc(ref, { membership });
}

export async function updateBusinessProfile(
  userId: string,
  data: Partial<Pick<Business, 'businessName' | 'category' | 'contactPhone' | 'description' | 'municipality' | 'logoURL'>>
): Promise<void> {
  const ref = doc(db, 'businesses', userId);
  await updateDoc(ref, data as Record<string, unknown>);
}