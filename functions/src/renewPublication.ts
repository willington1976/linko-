// functions/src/renewPublication.ts

import * as admin from 'firebase-admin';
import { HttpsError, onCall, type CallableRequest } from 'firebase-functions/v2/https';
import { computeExpiresAt } from '../../src/domain/rules/ttlRules';
import type { PublicationCategory } from '../../src/domain/entities/Publication';

interface RenewPublicationPayload {
  publicationId: string;
}

export const renewPublication = onCall(
  { region: 'us-central1', enforceAppCheck: false },
  async (request: CallableRequest<RenewPublicationPayload>) => {
    if (!request.auth) {
      throw new HttpsError('unauthenticated', 'Debes iniciar sesión.');
    }

    const uid = request.auth.uid;
    const { publicationId } = request.data;

    if (!publicationId) {
      throw new HttpsError('invalid-argument', 'publicationId es requerido.');
    }

    const db = admin.firestore();
    const pubRef = db.collection('publications').doc(publicationId);
    const pubSnap = await pubRef.get();

    if (!pubSnap.exists) {
      throw new HttpsError('not-found', 'Publicación no encontrada.');
    }

    const pub = pubSnap.data()!;

    if (pub['authorId'] !== uid) {
      throw new HttpsError('permission-denied', 'No eres el autor de esta publicación.');
    }

    if (pub['publicationType'] === 'business') {
      throw new HttpsError('failed-precondition', 'Las publicaciones de negocio no se renuevan manualmente.');
    }

    const now = new Date();
    const newExpiresAt = computeExpiresAt(now, pub['category'] as PublicationCategory);

    await pubRef.update({
      expiresAt: admin.firestore.Timestamp.fromDate(newExpiresAt),
      renewedAt: admin.firestore.FieldValue.serverTimestamp(),
      status:    'activa',
    });

    return {
      publicationId,
      newExpiresAt: newExpiresAt.toISOString(),
    };
  },
);