// src/infrastructure/repositories/PublicationRepository.ts
import { collection, query, where, orderBy, limit, getDocs, getDoc, doc, onSnapshot, type Unsubscribe, type QueryConstraint } from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig';
import { mapDTOToPublication, type PublicationDTO } from '../dtos/PublicationDTO';
import { DTOValidationError } from '../dtos/DTOValidationError';
import type { Publication, PublicationCategory } from '../../domain/entities/Publication';
const COL = 'publications';
export async function fetchFeed(opts: { category?: PublicationCategory; pageSize?: number } = {}): Promise<Publication[]> {
  const now = new Date();
  const constraints: QueryConstraint[] = [where('expiresAt', '>', now), orderBy('expiresAt', 'asc'), limit(opts.pageSize ?? 30)];
  if (opts.category) constraints.unshift(where('category', '==', opts.category));
  const snap = await getDocs(query(collection(db, COL), ...constraints));
  const results: Publication[] = [];
  for (const d of snap.docs) { try { results.push(mapDTOToPublication(d.id, d.data() as PublicationDTO)); } catch (err) { if (err instanceof DTOValidationError) console.warn(err.message); else throw err; } }
  return results;
}
export async function fetchNuevoHoy(): Promise<Publication[]> {
  const threeHoursAgo = new Date(Date.now() - 1000 * 60 * 60 * 3);
  const now = new Date();
  const snap = await getDocs(query(collection(db, COL), where('publicationType', '==', 'personal'), where('createdAt', '>', threeHoursAgo), where('expiresAt', '>', now), orderBy('createdAt', 'desc'), limit(20)));
  const results: Publication[] = [];
  for (const d of snap.docs) { try { results.push(mapDTOToPublication(d.id, d.data() as PublicationDTO)); } catch (err) { if (err instanceof DTOValidationError) console.warn((err as DTOValidationError).message); else throw err; } }
  return results;
}
export async function fetchPublicationById(id: string): Promise<Publication | null> {
  const snap = await getDoc(doc(db, COL, id));
  if (!snap.exists()) return null;
  try { return mapDTOToPublication(snap.id, snap.data() as PublicationDTO); }
  catch (err) { if (err instanceof DTOValidationError) { console.warn((err as DTOValidationError).message); return null; } throw err; }
}
export async function fetchPublicationsByAuthor(authorId: string): Promise<Publication[]> {
  const snap = await getDocs(query(collection(db, COL), where('authorId', '==', authorId), orderBy('createdAt', 'desc'), limit(50)));
  const results: Publication[] = [];
  for (const d of snap.docs) { try { results.push(mapDTOToPublication(d.id, d.data() as PublicationDTO)); } catch (err) { if (err instanceof DTOValidationError) console.warn((err as DTOValidationError).message); else throw err; } }
  return results;
}
export function subscribeToFeed(onUpdate: (pubs: Publication[]) => void, onError: (err: Error) => void, category?: PublicationCategory): Unsubscribe {
  const now = new Date();
  const constraints: QueryConstraint[] = [where('expiresAt', '>', now), orderBy('expiresAt', 'asc'), limit(30)];
  if (category) constraints.unshift(where('category', '==', category));
  const q = query(collection(db, COL), ...constraints);
  return onSnapshot(q, (snap) => {
    const results: Publication[] = [];
    for (const d of snap.docs) { try { results.push(mapDTOToPublication(d.id, d.data() as PublicationDTO)); } catch (err) { if (err instanceof DTOValidationError) console.warn((err as DTOValidationError).message); } }
    onUpdate(results);
  }, onError);
}
export function titleToKeywords(title: string): string[] {
  return [...new Set(title.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9\s]/g, ' ').split(/\s+/).filter((w) => w.length >= 2))];
}
export async function searchPublications(q: string, category?: PublicationCategory): Promise<Publication[]> {
  if (!q.trim()) return fetchFeed({ category });
  const keyword = q.trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]/g, '').slice(0, 50);
  if (!keyword) return fetchFeed({ category });
  const now = new Date();
  const constraints: QueryConstraint[] = [where('keywords', 'array-contains', keyword), limit(50)];
  if (category) constraints.push(where('category', '==', category));
  const snap = await getDocs(query(collection(db, COL), ...constraints));
  const results: Publication[] = [];
  for (const d of snap.docs) { try { const pub = mapDTOToPublication(d.id, d.data() as PublicationDTO); if (pub.expiresAt > now) results.push(pub); } catch (err) { if (err instanceof DTOValidationError) console.warn((err as DTOValidationError).message); } }
  return results;
}