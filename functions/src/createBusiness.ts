// functions/src/createBusiness.ts

import * as admin from 'firebase-admin';
import { HttpsError, onCall, type CallableRequest } from 'firebase-functions/v2/https';
import { validateBusinessInput } from '../../src/domain/validation/businessValidation';
import type { BusinessCategory } from '../../src/domain/entities/Business';

interface CreateBusinessPayload {
  name: string;
  description: string;
  category: BusinessCategory;
  phone: string;
  address: string;
  location: string;
  logo?: string;
}

export const createBusiness = onCall(
  { region: 'us-central1', enforceAppCheck: false },
  async (request: CallableRequest<CreateBusinessPayload>) => {
    if (!request.auth) {
      throw new HttpsError('unauthenticated', 'Debes iniciar sesión.');
    }

    const uid = request.auth.uid;
    const data = request.data;

    const validation = validateBusinessInput({
      name:        data.name,
      description: data.description,
      category:    data.category,
      phone:       data.phone,
      address:     data.address,
      location:    data.location,
    });

    if (!validation.valid) {
      throw new HttpsError(
        'invalid-argument',
        validation.errors.map((e) => e.message).join(' | '),
      );
    }

    const db = admin.firestore();

    // Un usuario solo puede tener un negocio
    const existing = await db
      .collection('businesses')
      .where('ownerId', '==', uid)
      .limit(1)
      .get();

    if (!existing.empty) {
      throw new HttpsError('already-exists', 'Ya tienes un negocio registrado.');
    }

    const bizRef = db.collection('businesses').doc();

    const batch = db.batch();

    batch.set(bizRef, {
      name:             data.name.trim(),
      description:      data.description.trim(),
      category:         data.category,
      phone:            data.phone.trim(),
      address:          data.address.trim(),
      location:         data.location.trim(),
      logo:             data.logo ?? null,
      ownerId:          uid,
      membershipActive: false,
      membershipUntil:  null,
      verified:         false,
      createdAt:        admin.firestore.FieldValue.serverTimestamp(),
    });

    // Actualizar rol del usuario a 'business'
    batch.update(db.collection('users').doc(uid), {
      role:       'business',
      businessId: bizRef.id,
    });

    await batch.commit();

    return {
      businessId: bizRef.id,
      createdAt:  new Date().toISOString(),
    };
  },
);