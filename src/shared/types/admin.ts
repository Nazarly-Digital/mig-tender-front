import type { PaginatedResponse } from './properties';

export type AdminUser = {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  broker: {
    is_verified: boolean;
    verification_status: string;
    inn_number?: string;
    inn_url?: string;
    passport_url?: string;
    verified_at?: string | null;
    rejected_at?: string | null;
  } | null;
  developer: { company_name?: string } | null;
  is_active?: boolean;
  created_at?: string;
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
