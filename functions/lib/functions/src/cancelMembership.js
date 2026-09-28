"use strict";
// functions/src/cancelMembership.ts
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
exports.cancelMembership = void 0;
const admin = __importStar(require("firebase-admin"));
const https_1 = require("firebase-functions/v2/https");
exports.cancelMembership = (0, https_1.onCall)({ region: 'us-central1', enforceAppCheck: false }, async (request) => {
    if (!request.auth) {
        throw new https_1.HttpsError('unauthenticated', 'Debes iniciar sesión.');
    }
    const uid = request.auth.uid;
    const { businessId, membershipId } = request.data;
    if (!businessId || !membershipId) {
        throw new https_1.HttpsError('invalid-argument', 'businessId y membershipId son requeridos.');
    }
    const db = admin.firestore();
    const bizSnap = await db.collection('businesses').doc(businessId).get();
    if (!bizSnap.exists) {
        throw new https_1.HttpsError('not-found', 'Negocio no encontrado.');
    }
    if (bizSnap.data()['ownerId'] !== uid) {
        throw new https_1.HttpsError('permission-denied', 'No eres el dueño de este negocio.');
    }
    const memRef = db.collection('memberships').doc(membershipId);
    const memSnap = await memRef.get();
    if (!memSnap.exists) {
        throw new https_1.HttpsError('not-found', 'Membresía no encontrada.');
    }
    if (memSnap.data()['businessId'] !== businessId) {
        throw new https_1.HttpsError('permission-denied', 'La membresía no pertenece a este negocio.');
    }
    if (memSnap.data()['status'] !== 'active') {
        throw new https_1.HttpsError('failed-precondition', 'La membresía no está activa.');
    }
    const now = new Date();
    const batch = db.batch();
    batch.update(memRef, {
        status: 'cancelled',
        cancelledAt: admin.firestore.Timestamp.fromDate(now),
    });
    // La membresía cancela al final del período actual — no se corta inmediatamente
    // Solo marcamos membershipActive=false cuando checkMembershipStatus detecte expiración
    // Pero si el dueño cancela, sí cortamos inmediatamente para simplicidad MVP
    batch.update(db.collection('businesses').doc(businessId), {
        membershipActive: false,
        membershipUntil: null,
    });
    await batch.commit();
    return { cancelledAt: now.toISOString() };
});
//# sourceMappingURL=cancelMembership.js.map