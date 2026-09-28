"use strict";
// functions/src/index.ts
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
exports.checkMembershipStatus = exports.cancelMembership = exports.activateMembership = exports.createBusiness = exports.renewPublication = exports.createPublication = void 0;
const admin = __importStar(require("firebase-admin"));
// Inicializar Admin SDK una sola vez
if (admin.apps.length === 0) {
    admin.initializeApp();
}
var createPublication_1 = require("./createPublication");
Object.defineProperty(exports, "createPublication", { enumerable: true, get: function () { return createPublication_1.createPublication; } });
var renewPublication_1 = require("./renewPublication");
Object.defineProperty(exports, "renewPublication", { enumerable: true, get: function () { return renewPublication_1.renewPublication; } });
var createBusiness_1 = require("./createBusiness");
Object.defineProperty(exports, "createBusiness", { enumerable: true, get: function () { return createBusiness_1.createBusiness; } });
var activateMembership_1 = require("./activateMembership");
Object.defineProperty(exports, "activateMembership", { enumerable: true, get: function () { return activateMembership_1.activateMembership; } });
var cancelMembership_1 = require("./cancelMembership");
Object.defineProperty(exports, "cancelMembership", { enumerable: true, get: function () { return cancelMembership_1.cancelMembership; } });
var checkMembershipStatus_1 = require("./checkMembershipStatus");
Object.defineProperty(exports, "checkMembershipStatus", { enumerable: true, get: function () { return checkMembershipStatus_1.checkMembershipStatus; } });
//# sourceMappingURL=index.js.map