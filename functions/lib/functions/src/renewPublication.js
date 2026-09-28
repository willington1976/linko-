"use strict";
// functions/src/renewPublication.ts
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
exports.renewPublication = void 0;
const admin = __importStar(require("firebase-admin"));
const https_1 = require("firebase-functions/v2/https");
const ttlRules_1 = require("../../src/domain/rules/ttlRules");
exports.renewPublication = (0, https_1.onCall)({ region: 'us-central1', enforceAppCheck: false }, async (request) => {
    if (!request.auth) {
        throw new https_1.HttpsError('unauthenticated', 'Debes iniciar sesión.');
    }
    const uid = request.auth.uid;
    const { publicationId } = request.data;
    if (!publicationId) {
        throw new https_1.HttpsError('invalid-argument', 'publicationId es requerido.');
    }
    const db = admin.firestore();
    const pubRef = db.collection('publications').doc(publicationId);
    const pubSnap = await pubRef.get();
    if (!pubSnap.exists) {
        throw new https_1.HttpsError('not-found', 'Publicación no encontrada.');
    }
    const pub = pubSnap.data();
    if (pub['authorId'] !== uid) {
        throw new https_1.HttpsError('permission-denied', 'No eres el autor de esta publicación.');
    }
    if (pub['publicationType'] === 'business') {
        throw new https_1.HttpsError('failed-precondition', 'Las publicaciones de negocio no se renuevan manualmente.');
    }
    const now = new Date();
    const newExpiresAt = (0, ttlRules_1.computeExpiresAt)(now, pub['category']);
    await pubRef.update({
        expiresAt: admin.firestore.Timestamp.fromDate(newExpiresAt),
        renewedAt: admin.firestore.FieldValue.serverTimestamp(),
        status: 'activa',
    });
    return {
        publicationId,
        newExpiresAt: newExpiresAt.toISOString(),
    };
});
//# sourceMappingURL=renewPublication.js.map