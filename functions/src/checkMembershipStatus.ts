// functions/src/checkMembershipStatus.ts
// Cron: se ejecuta cada hora — revisa membresías vencidas y desactiva negocios

import * as admin from 'firebase-admin';
import { onSchedule } from 'firebase-functions/v2/scheduler';

export const checkMembershipStatus = onSchedule(
  { schedule: 'every 60 minutes', region: 'us-central1' },
  async () => {
    const db = admin.firestore();
    const now = admin.firestore.Timestamp.now();

    // Buscar negocios con membershipActive=true pero membershipUntil ya pasado
    const expiredSnap = await db
      .collection('businesses')
      .where('membershipActive', '==', true)
      .where('membershipUntil', '<=', now)
      .get();

    if (expiredSnap.empty) {
      console.log('checkMembershipStatus: sin vencimientos.');
      return;
    }

    const batch = db.batch();
    const membershipUpdates: Promise<admin.firestore.QuerySnapshot>[] = [];

    for (const bizDoc of expiredSnap.docs) {
      // Desactivar negocio
      batch.update(bizDoc.ref, {
        membershipActive: false,
      });

      // Marcar membresías activas de ese negocio como expiradas
      membershipUpdates.push(
        db
          .collection('memberships')
          .where('businessId', '==', bizDoc.id)
          .where('status', '==', 'active')
          .get(),
      );
    }

    const memSnaps = await Promise.all(membershipUpdates);
    for (const snap of memSnaps) {
      for (const memDoc of snap.docs) {
        batch.update(memDoc.ref, { status: 'expired' });
      }
    }

    await batch.commit();
    console.log(`checkMembershipStatus: ${String(expiredSnap.size)} negocios desactivados.`);
  },
);