"use strict";
// functions/src/checkMembershipStatus.ts
// Cron: se ejecuta cada hora — revisa membresías vencidas y desactiva negocios
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
exports.checkMembershipStatus = void 0;
const admin = __importStar(require("firebase-admin"));
const scheduler_1 = require("firebase-functions/v2/scheduler");
exports.checkMembershipStatus = (0, scheduler_1.onSchedule)({ schedule: 'every 60 minutes', region: 'us-central1' }, async () => {
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
    const membershipUpdates = [];
    for (const bizDoc of expiredSnap.docs) {
        // Desactivar negocio
        batch.update(bizDoc.ref, {
            membershipActive: false,
        });
        // Marcar membresías activas de ese negocio como expiradas
        membershipUpdates.push(db
            .collection('memberships')
            .where('businessId', '==', bizDoc.id)
            .where('status', '==', 'active')
            .get());
    }
    const memSnaps = await Promise.all(membershipUpdates);
    for (const snap of memSnaps) {
        for (const memDoc of snap.docs) {
            batch.update(memDoc.ref, { status: 'expired' });
        }
    }
    await batch.commit();
    console.log(`checkMembershipStatus: ${String(expiredSnap.size)} negocios desactivados.`);
});
//# sourceMappingURL=checkMembershipStatus.js.map