import type { PaginatedResponse } from './properties';

export type AdminUser = {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  is_active: boolean;
  is_blocked: boolean;
  is_verified: boolean;
  created_at: string;
};

export type AdminUserListParams = {
  role?: string;
  is_blocked?: boolean;
  ordering?: string;
  page?: number;
  page_size?: number;
};

export type BlockUserResponse = {
  message: string;
};

export type VerifyBrokerResponse = {
  message: string;
};

export type PendingProperty = {
  id: number;
  developer: number;
  developer_name: string;
  type: string;
  address: string;
  area: string;
  property_class: string;
  price: string;
  currency: string;
  status: string;
  created_at: string;
};

export type PendingPropertyListParams = {
  ordering?: string;
  page?: number;
  page_size?: number;
};

export type PropertyActionResponse = {
  message: string;
};

export type RejectPropertyRequest = {
  reason?: string;
};

export type { PaginatedResponse };
