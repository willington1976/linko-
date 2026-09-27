// src/domain/usecases/CreateBusiness.ts

import type { BusinessCategory } from '../entities/Business';

export interface CreateBusinessInput {
  name: string;
  description: string;
  category: BusinessCategory;
  phone: string;
  address: string;
  location: string;
  logo?: string; // URL ya subida a Storage
}

export interface CreateBusinessResult {
  businessId: string;
  createdAt: Date;
}