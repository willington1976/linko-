// src/domain/entities/User.ts

export type UserRole = 'user' | 'business' | 'admin';

export interface User {
  uid: string;
  displayName: string;
  email: string;
  phone?: string;
  role: UserRole;
  verified: boolean;
  completedCount: number;
  businessId?: string;     // solo si role === 'business'
  createdAt: Date;
}