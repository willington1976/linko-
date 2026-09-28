"use strict";
// functions/src/createBusiness.ts
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
exports.createBusiness = void 0;
const admin = __importStar(require("firebase-admin"));
const https_1 = require("firebase-functions/v2/https");
const businessValidation_1 = require("../../src/domain/validation/businessValidation");
exports.createBusiness = (0, https_1.onCall)({ region: 'us-central1', enforceAppCheck: false }, async (request) => {
    if (!request.auth) {
        throw new https_1.HttpsError('unauthenticated', 'Debes iniciar sesión.');
    }
    const uid = request.auth.uid;
    const data = request.data;
    const validation = (0, businessValidation_1.validateBusinessInput)({
        name: data.name,
        description: data.description,
        category: data.category,
        phone: data.phone,
        address: data.address,
        location: data.location,
    });
    if (!validation.valid) {
        throw new https_1.HttpsError('invalid-argument', validation.errors.map((e) => e.message).join(' | '));
    }
    const db = admin.firestore();
    // Un usuario solo puede tener un negocio
    const existing = await db
        .collection('businesses')
        .where('ownerId', '==', uid)
        .limit(1)
        .get();
    if (!existing.empty) {
        throw new https_1.HttpsError('already-exists', 'Ya tienes un negocio registrado.');
    }
    const bizRef = db.collection('businesses').doc();
    const batch = db.batch();
    batch.set(bizRef, {
        name: data.name.trim(),
        description: data.description.trim(),
        category: data.category,
        phone: data.phone.trim(),
        address: data.address.trim(),
        location: data.location.trim(),
        logo: data.logo ?? null,
        ownerId: uid,
        membershipActive: false,
        membershipUntil: null,
        verified: false,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    // Actualizar rol del usuario a 'business'
    batch.update(db.collection('users').doc(uid), {
        role: 'business',
        businessId: bizRef.id,
    });
    await batch.commit();
    return {
        businessId: bizRef.id,
        createdAt: new Date().toISOString(),
    };
});
//# sourceMappingURL=createBusiness.js.map