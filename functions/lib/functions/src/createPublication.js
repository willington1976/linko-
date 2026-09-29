"use strict";
// functions/src/createPublication.ts
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.createPublication = void 0;
const admin = __importStar(require("firebase-admin"));
const https_1 = require("firebase-functions/v2/https");
const ttlRules_1 = require("../../src/domain/rules/ttlRules");
const publicationValidation_1 = require("../../src/domain/validation/publicationValidation");
const membershipRules_1 = require("../../src/domain/rules/membershipRules");
function titleToKeywords(title) {
    return [...new Set(title.toLowerCase().normalize('NFD')
            .replace(/[̀-ͯ]/g, '')
            .replace(/[^a-z0-9\s]/g, ' ')
            .split(/\s+/)
            .filter((w) => w.length >= 2))];
}
exports.createPublication = (0, https_1.onCall)({ region: 'us-central1', enforceAppCheck: false }, async (request) => {
    if (!request.auth) {
        throw new https_1.HttpsError('unauthenticated', 'Debes iniciar sesión.');
    }
    const uid = request.auth.uid;
    const data = request.data;
    // Extraer municipio del location o usar el campo directo
    const municipality = data.municipality ?? data.location?.split(',')[1]?.trim() ?? '';
    // Validación de campos
    const validation = (0, publicationValidation_1.validatePublicationInput)({
        title: data.title,
        description: data.description,
        category: data.category,
        intent: data.intent,
        department: 'casanare',
        municipality,
        price: data.price,
        contactPhone: data.contactPhone,
    });
    if (!validation.valid) {
        throw new https_1.HttpsError('invalid-argument', validation.errors.map((e) => e.message).join(' | '));
    }
    const db = admin.firestore();
    // Validación de tipo y membresía
    if (data.publicationType === 'business') {
        if (!data.businessId) {
            throw new https_1.HttpsError('invalid-argument', 'businessId es requerido para publicaciones de negocio.');
        }
        const bizSnap = await db.collection('businesses').doc(data.businessId).get();
        if (!bizSnap.exists) {
            throw new https_1.HttpsError('not-found', 'Negocio no encontrado.');
        }
        const biz = bizSnap.data();
        if (biz['ownerId'] !== uid) {
            throw new https_1.HttpsError('permission-denied', 'No eres el dueño de este negocio.');
        }
        const membershipUntil = biz['membershipUntil'] ?? null;
        if (!(0, membershipRules_1.isMembershipActive)(membershipUntil?.toDate() ?? null)) {
            throw new https_1.HttpsError('failed-precondition', 'El negocio no tiene membresía activa.');
        }
        if (data.photos.length > membershipRules_1.MAX_PHOTOS_BUSINESS) {
            throw new https_1.HttpsError('invalid-argument', `Máximo ${String(membershipRules_1.MAX_PHOTOS_BUSINESS)} fotos para negocios.`);
        }
    }
    else {
        if (data.photos.length > membershipRules_1.MAX_PHOTOS_PERSONAL) {
            throw new https_1.HttpsError('invalid-argument', `Máximo ${String(membershipRules_1.MAX_PHOTOS_PERSONAL)} foto para publicaciones personales.`);
        }
    }
    // Obtener datos del autor — primero Firestore, fallback a Firebase Auth
    let authorName = '';
    let authorVerified = false;
    let authorCompletedCount = 0;
    const userSnap = await db.collection('users').doc(uid).get();
    if (userSnap.exists) {
        const userData = userSnap.data();
        authorName = userData['displayName'] ?? '';
        authorVerified = userData['verified'] ?? false;
        authorCompletedCount = userData['completedCount'] ?? 0;
    }
    else {
        // Fallback: leer desde Firebase Auth
        const authUser = await admin.auth().getUser(uid);
        authorName = authUser.displayName ?? authUser.email ?? '';
    }
    const now = new Date();
    const ttlHours = ttlRules_1.TTL_HOURS_BY_CATEGORY[data.category];
    const expiresAt = data.publicationType === 'business'
        ? new Date(now.getTime() + 1000 * 60 * 60 * 87600)
        : (0, ttlRules_1.computeExpiresAt)(now, data.category);
    // Extraer municipio del location o usar el campo directo
    const pubRef = db.collection('publications').doc();
    const batch = db.batch();
    batch.set(pubRef, {
        title: data.title.trim(),
        titleLower: data.title.trim().toLowerCase(),
        keywords: titleToKeywords(data.title.trim()),
        description: data.description.trim(),
        category: data.category,
        intent: data.intent,
        price: data.price ?? null,
        location: data.location.trim(),
        municipality,
        publicationType: data.publicationType,
        photos: data.photos,
        businessId: data.businessId ?? null,
        authorId: uid,
        authorName,
        authorVerified,
        authorCompletedCount,
        status: 'activa',
        ttlHours,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        expiresAt: admin.firestore.Timestamp.fromDate(expiresAt),
    });
    // Subcollección privada con teléfono
    const privateRef = pubRef.collection('private').doc('contact');
    batch.set(privateRef, { contactPhone: data.contactPhone.trim() });
    await batch.commit();
    return {
        publicationId: pubRef.id,
        expiresAt: expiresAt.toISOString(),
        ttlHours,
    };
});
//# sourceMappingURL=createPublication.js.map