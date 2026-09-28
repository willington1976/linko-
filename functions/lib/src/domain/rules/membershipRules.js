"use strict";
// src/domain/rules/membershipRules.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.MAX_PHOTOS_PERSONAL = exports.MAX_PHOTOS_BUSINESS = exports.MEMBERSHIP_DURATION_DAYS = exports.MEMBERSHIP_PRICE_COP = void 0;
exports.computeMembershipEnd = computeMembershipEnd;
exports.isMembershipActive = isMembershipActive;
exports.MEMBERSHIP_PRICE_COP = 120000;
exports.MEMBERSHIP_DURATION_DAYS = 30;
exports.MAX_PHOTOS_BUSINESS = 5;
exports.MAX_PHOTOS_PERSONAL = 1;
function computeMembershipEnd(startDate) {
    const end = new Date(startDate);
    end.setDate(end.getDate() + exports.MEMBERSHIP_DURATION_DAYS);
    return end;
}
function isMembershipActive(membershipUntil) {
    if (!membershipUntil)
        return false;
    return membershipUntil.getTime() > Date.now();
}
//# sourceMappingURL=membershipRules.js.map