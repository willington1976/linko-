// src/infrastructure/repositories/BusinessRepository.ts

import {
  collection,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  getDoc,
  doc,
} from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig';
import { mapDTOToBusiness, type BusinessDTO } from '../dtos/BusinessDTO';
import { DTOValidationError } from '../dtos/DTOValidationError';
import type { Business } from '../../domain/entities/Business';

const COL = 'businesses';

// Negocios con membresia activa (vitrina)

export async function fetchActiveBusinesses(pageSize = 20): Promise<Business[]> {
  const now = new Date();
  const snap = await getDocs(
    query(
      collection(db, COL),
      where('membership.status', '==', 'active'),
      where('membership.expiresAt', '>', now),
      orderBy('membership.expiresAt', 'desc'),
      limit(pageSize),
    ),
  );

  const results: Business[] = [];
  for (const d of snap.docs) {
    try {
      results.push(mapDTOToBusiness({ businessId: d.id, ...d.data() } as BusinessDTO));
    } catch (err) {
      if (err instanceof DTOValidationError) console.warn((err as DTOValidationError).message);
      else throw err;
    }
  }
  return results;
}

// Detalle de un negocio

export async function fetchBusinessById(id: string): Promise<Business | null> {
  const snap = await getDoc(doc(db, COL, id));
  if (!snap.exists()) return null;
  try {
    return mapDTOToBusiness({ businessId: snap.id, ...snap.data() } as BusinessDTO);
  } catch (err) {
    if (err instanceof DTOValidationError) {
      console.warn((err as DTOValidationError).message);
      return null;
    }
    throw err;
  }
}

// Negocio del usuario autenticado

export async function fetchBusinessByOwner(
  ownerId: string,
): Promise<Business | null> {
  const snap = await getDocs(
    query(
      collection(db, COL),
      where('ownerId', '==', ownerId),
      limit(1),
    ),
  );
  if (snap.empty) return null;
  const d = snap.docs[0]!;
  try {
    return mapDTOToBusiness({ businessId: d.id, ...d.data() } as BusinessDTO);
  } catch (err) {
    if (err instanceof DTOValidationError) {
      console.warn((err as DTOValidationError).message);
      return null;
    }
    throw err;
  }
}