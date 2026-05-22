import type { PaginatedResponse, PropertyImage } from './properties';
import type { UserDocument, TokenUser } from './auth';

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
    phone_number?: string;
    verified_at?: string | null;
    rejected_at?: string | null;
    rejection_reason?: string | null;
  } | null;
  developer: {
    company_name?: string;
    phone_number?: string;
    inn_number?: string;
    ddu_template_url?: string | null;
    has_ddu_template?: boolean;
    // ТЗ от 2026-05-14 — developer тоже проходит верификацию.
    is_verified?: boolean;
    verification_status?: string;
    verified_at?: string | null;
    rejected_at?: string | null;
    rejection_reason?: string | null;
  } | null;
  documents: UserDocument[];
  is_active?: boolean;
  // Backend uses Django's standard `date_joined` (auto-populated by
  // the User model with `default=timezone.now`). `created_at` is kept
  // for backward compat in case any older code path reads it.
  date_joined?: string;
  created_at?: string;
};

export type AdminUserListParams = {
  role?: string;
  is_active?: boolean;
  verification_status?: string;
  search?: string;
  date_from?: string;
  date_to?: string;
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

// Admin developer management
export type AdminCreateDeveloperRequest = {
  email: string;
  password: string;
  password_confirm: string;
  company_name: string;
  first_name: string;
  last_name: string;
  inn_number: string;
  phone_number: string;
  inn?: File;
  passport?: File;
  ddu_template?: File;
};

export type AdminUpdateDeveloperRequest = {
  email?: string;
  first_name?: string;
  last_name?: string;
  company_name?: string;
  inn_number?: string;
  phone_number?: string;
  ddu_template?: File;
};

export type AdminDeveloperResponse = {
  message: string;
  user: TokenUser;
};

// Admin broker management (edit via PATCH /admin/users/<id>/)
export type AdminUpdateBrokerRequest = {
  email?: string;
  first_name?: string;
  last_name?: string;
  inn_number?: string;
  phone_number?: string;
};

export type AdminUpdateBrokerResponse = {
  message: string;
  user: TokenUser;
};

export type PendingProperty = {
  id: number;
  // Backend renamed `developer` → `owner_id` in the response, kept the
  // existing field for back-compat with older callers.
  developer?: number;
  owner_id?: number;
  developer_name: string;
  developer_email?: string;
  type: string;
  address: string;
  area: string;
  property_class: string;
  price: string;
  currency: string;
  status: string;
  moderation_status?: 'pending' | 'approved' | 'rejected';
  moderation_rejection_reason?: string | null;
  images?: PropertyImage[];
  created_at: string;
};

export type PendingPropertyListParams = {
  address?: string;
  area_min?: number;
  area_max?: number;
  currency?: string;
  deadline?: string;
  ordering?: string;
  page?: number;
  page_size?: number;
  price_min?: number;
  price_max?: number;
  property_class?: string;
  status?: string;
  type?: string;
  moderation_status?: 'pending' | 'approved' | 'rejected';
};

export type PropertyActionResponse = {
  message: string;
};

export type RejectPropertyRequest = {
  reason: string;
};

export type { PaginatedResponse };
