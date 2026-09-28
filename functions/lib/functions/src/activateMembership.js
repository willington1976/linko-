"use strict";
// functions/src/activateMembership.ts
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
exports.activateMembership = void 0;
const admin = __importStar(require("firebase-admin"));
const https_1 = require("firebase-functions/v2/https");
const membershipRules_1 = require("../../src/domain/rules/membershipRules");
exports.activateMembership = (0, https_1.onCall)({ region: 'us-central1', enforceAppCheck: false }, async (request) => {
    if (!request.auth) {
        throw new https_1.HttpsError('unauthenticated', 'Debes iniciar sesión.');
    }
    const uid = request.auth.uid;
    const { businessId, wompiTransactionId, amountCOP } = request.data;
    if (!businessId || !wompiTransactionId) {
        throw new https_1.HttpsError('invalid-argument', 'businessId y wompiTransactionId son requeridos.');
    }
    if (amountCOP < membershipRules_1.MEMBERSHIP_PRICE_COP) {
        throw new https_1.HttpsError('invalid-argument', `El monto mínimo es ${String(membershipRules_1.MEMBERSHIP_PRICE_COP)} COP.`);
    }
    const db = admin.firestore();
    const bizRef = db.collection('businesses').doc(businessId);
    const bizSnap = await bizRef.get();
    if (!bizSnap.exists) {
        throw new https_1.HttpsError('not-found', 'Negocio no encontrado.');
    }
    const biz = bizSnap.data();
    if (biz['ownerId'] !== uid) {
        throw new https_1.HttpsError('permission-denied', 'No eres el dueño de este negocio.');
    }
    // Evitar doble activación con el mismo transaction ID
    const dupSnap = await db
        .collection('memberships')
        .where('wompiTransactionId', '==', wompiTransactionId)
        .limit(1)
        .get();
    if (!dupSnap.empty) {
        throw new https_1.HttpsError('already-exists', 'Esta transacción ya fue procesada.');
    }
    const now = new Date();
    const periodEnd = (0, membershipRules_1.computeMembershipEnd)(now);
    const membershipRef = db.collection('memberships').doc();
    const batch = db.batch();
    batch.set(membershipRef, {
        businessId,
        status: 'active',
        provider: 'wompi',
        amount: amountCOP,
        currentPeriodStart: admin.firestore.Timestamp.fromDate(now),
        currentPeriodEnd: admin.firestore.Timestamp.fromDate(periodEnd),
        wompiTransactionId,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    batch.update(bizRef, {
        membershipActive: true,
        membershipUntil: admin.firestore.Timestamp.fromDate(periodEnd),
    });
    await batch.commit();
    return {
        membershipId: membershipRef.id,
        membershipUntil: periodEnd.toISOString(),
    };
});
//# sourceMappingURL=activateMembership.js.map