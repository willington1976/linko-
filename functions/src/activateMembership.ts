// functions/src/activateMembership.ts

import * as admin from 'firebase-admin';
import { HttpsError, onCall, type CallableRequest } from 'firebase-functions/v2/https';
import { computeMembershipEnd, MEMBERSHIP_PRICE_COP } from '../../src/domain/rules/membershipRules';

interface ActivateMembershipPayload {
  businessId: string;
  wompiTransactionId: string;
  amountCOP: number;
}

export const activateMembership = onCall(
  { region: 'us-central1', enforceAppCheck: false },
  async (request: CallableRequest<ActivateMembershipPayload>) => {
    if (!request.auth) {
      throw new HttpsError('unauthenticated', 'Debes iniciar sesión.');
    }

    const uid = request.auth.uid;
    const { businessId, wompiTransactionId, amountCOP } = request.data;

    if (!businessId || !wompiTransactionId) {
      throw new HttpsError('invalid-argument', 'businessId y wompiTransactionId son requeridos.');
    }

    if (amountCOP < MEMBERSHIP_PRICE_COP) {
      throw new HttpsError(
        'invalid-argument',
        `El monto mínimo es ${String(MEMBERSHIP_PRICE_COP)} COP.`,
      );
    }

    const db = admin.firestore();
    const bizRef = db.collection('businesses').doc(businessId);
    const bizSnap = await bizRef.get();

    if (!bizSnap.exists) {
      throw new HttpsError('not-found', 'Negocio no encontrado.');
    }

    const biz = bizSnap.data()!;
    if (biz['ownerId'] !== uid) {
      throw new HttpsError('permission-denied', 'No eres el dueño de este negocio.');
    }

    // Evitar doble activación con el mismo transaction ID
    const dupSnap = await db
      .collection('memberships')
      .where('wompiTransactionId', '==', wompiTransactionId)
      .limit(1)
      .get();

    if (!dupSnap.empty) {
      throw new HttpsError('already-exists', 'Esta transacción ya fue procesada.');
    }

    const now = new Date();
    const periodEnd = computeMembershipEnd(now);
    const membershipRef = db.collection('memberships').doc();

    const batch = db.batch();

    batch.set(membershipRef, {
      businessId,
      status:              'active',
      provider:            'wompi',
      amount:              amountCOP,
      currentPeriodStart:  admin.firestore.Timestamp.fromDate(now),
      currentPeriodEnd:    admin.firestore.Timestamp.fromDate(periodEnd),
      wompiTransactionId,
      createdAt:           admin.firestore.FieldValue.serverTimestamp(),
    });

    batch.update(bizRef, {
      membershipActive: true,
      membershipUntil:  admin.firestore.Timestamp.fromDate(periodEnd),
    });

    await batch.commit();

    return {
      membershipId:    membershipRef.id,
      membershipUntil: periodEnd.toISOString(),
    };
  },
);