// functions/src/index.ts

import * as admin from 'firebase-admin';

// Inicializar Admin SDK una sola vez
if (admin.apps.length === 0) {
  admin.initializeApp();
}

export { createPublication }  from './createPublication';
export { renewPublication }   from './renewPublication';
export { createBusiness }     from './createBusiness';
export { activateMembership } from './activateMembership';
export { cancelMembership }   from './cancelMembership';
export { checkMembershipStatus } from './checkMembershipStatus';