// src/infrastructure/repositories/PublicationRepository.ts

import {
  collection,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  getDoc,
  doc,
  onSnapshot,
  type Unsubscribe,
  type QueryConstraint,
} from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig';
import { mapDTOToPublication, type PublicationDTO } from '../dtos/PublicationDTO';
import { DTOValidationError } from '../dtos/DTOValidationError';
import type { Publication, PublicationCategory } from '../../domain/entities/Publication';

const COL = 'publications';

// ─── Feed principal (activas, no expiradas) ───────────────────────────────────

export async function fetchFeed(
  opts: {
    category?: PublicationCategory;
    pageSize?: number;
  } = {},
): Promise<Publication[]> {
  const now = new Date();
  const constraints: QueryConstraint[] = [
    where('expiresAt', '>', now),
    orderBy('expiresAt', 'asc'),
    limit(opts.pageSize ?? 30),
  ];

  if (opts.category) {
    constraints.unshift(where('category', '==', opts.category));
  }

  const snap = await getDocs(query(collection(db, COL), ...constraints));
  const results: Publication[] = [];

  for (const d of snap.docs) {
    try {
      results.push(
        mapDTOToPublication({ id: d.id, ...d.data() } as PublicationDTO),
      );
    } catch (err) {
      if (err instanceof DTOValidationError) {
        console.warn(err.message);
      } else {
        throw err;
      }
    }
  }

  return results;
}

// ─── "Nuevo hoy" — publicaciones personales < 3h ─────────────────────────────

export async function fetchNuevoHoy(): Promise<Publication[]> {
  const threeHoursAgo = new Date(Date.now() - 1000 * 60 * 60 * 3);
  const now = new Date();

  const snap = await getDocs(
    query(
      collection(db, COL),
      where('publicationType', '==', 'personal'),
      where('createdAt', '>', threeHoursAgo),
      where('expiresAt', '>', now),
      orderBy('createdAt', 'desc'),
      limit(20),
    ),
  );

  const results: Publication[] = [];
  for (const d of snap.docs) {
    try {
      results.push(
        mapDTOToPublication({ id: d.id, ...d.data() } as PublicationDTO),
      );
    } catch (err) {
      if (err instanceof DTOValidationError) console.warn((err as DTOValidationError).message);
      else throw err;
    }
  }
  return results;
}

// ─── Detalle de una publicación ───────────────────────────────────────────────

export async function fetchPublicationById(
  id: string,
): Promise<Publication | null> {
  const snap = await getDoc(doc(db, COL, id));
  if (!snap.exists()) return null;
  try {
    return mapDTOToPublication({ id: snap.id, ...snap.data() } as PublicationDTO);
  } catch (err) {
    if (err instanceof DTOValidationError) {
      console.warn((err as DTOValidationError).message);
      return null;
    }
    throw err;
  }
}

// ─── Publicaciones de un usuario ──────────────────────────────────────────────

export async function fetchPublicationsByAuthor(
  authorId: string,
): Promise<Publication[]> {
  const snap = await getDocs(
    query(
      collection(db, COL),
      where('authorId', '==', authorId),
      orderBy('createdAt', 'desc'),
      limit(50),
    ),
  );

  const results: Publication[] = [];
  for (const d of snap.docs) {
    try {
      results.push(
        mapDTOToPublication({ id: d.id, ...d.data() } as PublicationDTO),
      );
    } catch (err) {
      if (err instanceof DTOValidationError) console.warn((err as DTOValidationError).message);
      else throw err;
    }
  }
  return results;
}

// ─── Listener en tiempo real para el feed ────────────────────────────────────

export function subscribeToFeed(
  onUpdate: (pubs: Publication[]) => void,
  onError: (err: Error) => void,
): Unsubscribe {
  const now = new Date();
  const q = query(
    collection(db, COL),
    where('expiresAt', '>', now),
    orderBy('expiresAt', 'asc'),
    limit(30),
  );

  return onSnapshot(
    q,
    (snap) => {
      const results: Publication[] = [];
      for (const d of snap.docs) {
        try {
          results.push(
            mapDTOToPublication({ id: d.id, ...d.data() } as PublicationDTO),
          );
        } catch (err) {
          if (err instanceof DTOValidationError) console.warn((err as DTOValidationError).message);
        }
      }
      onUpdate(results);
    },
    onError,
  );
}