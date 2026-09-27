// functions/src/cancelMembership.ts

import * as admin from 'firebase-admin';
import { HttpsError, onCall, type CallableRequest } from 'firebase-functions/v2/https';

interface CancelMembershipPayload {
  businessId: string;
  membershipId: string;
}

export const cancelMembership = onCall(
  { region: 'us-central1', enforceAppCheck: false },
  async (request: CallableRequest<CancelMembershipPayload>) => {
    if (!request.auth) {
      throw new HttpsError('unauthenticated', 'Debes iniciar sesión.');
    }

    const uid = request.auth.uid;
    const { businessId, membershipId } = request.data;

    if (!businessId || !membershipId) {
      throw new HttpsError('invalid-argument', 'businessId y membershipId son requeridos.');
    }

    const db = admin.firestore();

    const bizSnap = await db.collection('businesses').doc(businessId).get();
    if (!bizSnap.exists) {
      throw new HttpsError('not-found', 'Negocio no encontrado.');
    }
    if (bizSnap.data()!['ownerId'] !== uid) {
      throw new HttpsError('permission-denied', 'No eres el dueño de este negocio.');
    }

    const memRef = db.collection('memberships').doc(membershipId);
    const memSnap = await memRef.get();
    if (!memSnap.exists) {
      throw new HttpsError('not-found', 'Membresía no encontrada.');
    }
    if (memSnap.data()!['businessId'] !== businessId) {
      throw new HttpsError('permission-denied', 'La membresía no pertenece a este negocio.');
    }
    if (memSnap.data()!['status'] !== 'active') {
      throw new HttpsError('failed-precondition', 'La membresía no está activa.');
    }

    const now = new Date();
    const batch = db.batch();

    batch.update(memRef, {
      status:      'cancelled',
      cancelledAt: admin.firestore.Timestamp.fromDate(now),
    });

    // La membresía cancela al final del período actual — no se corta inmediatamente
    // Solo marcamos membershipActive=false cuando checkMembershipStatus detecte expiración
    // Pero si el dueño cancela, sí cortamos inmediatamente para simplicidad MVP
    batch.update(db.collection('businesses').doc(businessId), {
      membershipActive: false,
      membershipUntil:  null,
    });

    await batch.commit();

    return { cancelledAt: now.toISOString() };
  },
);