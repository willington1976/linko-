// functions/src/createPublication.ts

import * as admin from 'firebase-admin';
import { HttpsError, onCall, type CallableRequest } from 'firebase-functions/v2/https';
import { TTL_HOURS_BY_CATEGORY, computeExpiresAt } from '../../src/domain/rules/ttlRules';
import { validatePublicationInput } from '../../src/domain/validation/publicationValidation';
import { isMembershipActive, MAX_PHOTOS_BUSINESS, MAX_PHOTOS_PERSONAL } from '../../src/domain/rules/membershipRules';
import type { PublicationCategory, PublicationIntent, PublicationType } from '../../src/domain/entities/Publication';

interface CreatePublicationPayload {
  title: string;
  description: string;
  category: PublicationCategory;
  intent: PublicationIntent;
  location: string;
  price?: number;
  contactPhone: string;
  publicationType: PublicationType;
  photos: string[];
  businessId?: string;
}

export const createPublication = onCall(
  { region: 'us-central1', enforceAppCheck: false },
  async (request: CallableRequest<CreatePublicationPayload>) => {
    if (!request.auth) {
      throw new HttpsError('unauthenticated', 'Debes iniciar sesión.');
    }

    const uid = request.auth.uid;
    const data = request.data;

    // Validación de campos
    const validation = validatePublicationInput({
      title:        data.title,
      description:  data.description,
      category:     data.category,
      intent:       data.intent,
      location:     data.location,
      price:        data.price,
      contactPhone: data.contactPhone,
    });

    if (!validation.valid) {
      throw new HttpsError(
        'invalid-argument',
        validation.errors.map((e) => e.message).join(' | '),
      );
    }

    const db = admin.firestore();

    // Validación de tipo y membresía
    if (data.publicationType === 'business') {
      if (!data.businessId) {
        throw new HttpsError('invalid-argument', 'businessId es requerido para publicaciones de negocio.');
      }
      const bizSnap = await db.collection('businesses').doc(data.businessId).get();
      if (!bizSnap.exists) {
        throw new HttpsError('not-found', 'Negocio no encontrado.');
      }
      const biz = bizSnap.data()!;
      if (biz['ownerId'] !== uid) {
        throw new HttpsError('permission-denied', 'No eres el dueño de este negocio.');
      }
      const membershipUntil: admin.firestore.Timestamp | null = biz['membershipUntil'] ?? null;
      if (!isMembershipActive(membershipUntil?.toDate() ?? null)) {
        throw new HttpsError('failed-precondition', 'El negocio no tiene membresía activa.');
      }
      if (data.photos.length > MAX_PHOTOS_BUSINESS) {
        throw new HttpsError('invalid-argument', `Máximo ${String(MAX_PHOTOS_BUSINESS)} fotos para negocios.`);
      }
    } else {
      if (data.photos.length > MAX_PHOTOS_PERSONAL) {
        throw new HttpsError('invalid-argument', `Máximo ${String(MAX_PHOTOS_PERSONAL)} foto para publicaciones personales.`);
      }
    }

    // Obtener datos del autor
    const userSnap = await db.collection('users').doc(uid).get();
    if (!userSnap.exists) {
      throw new HttpsError('not-found', 'Usuario no encontrado.');
    }
    const userData = userSnap.data()!;

    const now = new Date();
    const ttlHours = TTL_HOURS_BY_CATEGORY[data.category];
    // Publicaciones de negocio no expiran (TTL altísimo simulado con 87600h = 10 años)
    const expiresAt =
      data.publicationType === 'business'
        ? new Date(now.getTime() + 1000 * 60 * 60 * 87600)
        : computeExpiresAt(now, data.category);

    const pubRef = db.collection('publications').doc();

    const batch = db.batch();

    // Documento principal
    batch.set(pubRef, {
      title:                data.title.trim(),
      description:          data.description.trim(),
      category:             data.category,
      intent:               data.intent,
      price:                data.price ?? null,
      location:             data.location.trim(),
      publicationType:      data.publicationType,
      photos:               data.photos,
      businessId:           data.businessId ?? null,
      authorId:             uid,
      authorName:           userData['displayName'] ?? '',
      authorVerified:       userData['verified'] ?? false,
      authorCompletedCount: userData['completedCount'] ?? 0,
      status:               'activa',
      ttlHours,
      createdAt:            admin.firestore.FieldValue.serverTimestamp(),
      expiresAt:            admin.firestore.Timestamp.fromDate(expiresAt),
    });

    // Subcollección privada con teléfono
    const privateRef = pubRef.collection('private').doc('contact');
    batch.set(privateRef, { contactPhone: data.contactPhone.trim() });

    await batch.commit();

    return {
      publicationId: pubRef.id,
      expiresAt:     expiresAt.toISOString(),
      ttlHours,
    };
  },
);