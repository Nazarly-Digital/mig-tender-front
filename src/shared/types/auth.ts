export type UserDocument = {
  id: number;
  doc_type: 'inn' | 'passport' | 'others';
  document_name: string;
  url: string;
  filename: string;
  extension: string;
  created_at: string;
  updated_at: string;
};

export type UnifiedDocument = {
  id: number;
  source: 'user' | 'deal';
  doc_type: string;
  document_name: string;
  url: string;
  filename: string;
  extension: string;
  created_at: string;
  deal_id: number | null;
  deal_status: string | null;
  property_address: string | null;
};

export type TokenUser = {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  is_broker?: boolean;
  is_developer?: boolean;
  is_admin?: boolean;
  is_active?: boolean;
  date_joined?: string;
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
    // ТЗ от 2026-05-14 — developer теперь тоже проходит верификацию.
    // Возвращается бэком только если поля присутствуют (для legacy
    // developer'ов до миграции 0013 — отсутствуют).
    is_verified?: boolean;
    verification_status?: string;
    verified_at?: string | null;
    rejected_at?: string | null;
    rejection_reason?: string | null;
  } | null;
  documents: UserDocument[];
};

// /auth/me/ response (different shape from login response)
export type MeApiResponse = {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  is_active: boolean;
  date_joined: string;
  is_broker: boolean;
  is_developer: boolean;
  is_admin: boolean;
  broker: TokenUser['broker'];
  developer: TokenUser['developer'];
  documents: UserDocument[];
};

// Login
export type LoginRequest = {
  email: string;
  password: string;
  // ТЗ от 2026-05-15 — селект на форме «Я вхожу как: Брокер / Девелопер».
  // Бэк проверяет совпадение с user.role и кидает 401 если роль не та.
  role?: "broker" | "developer";
};

export type LoginResponse = {
  refresh: string;
  access: string;
  user: TokenUser;
};

// Refresh
export type RefreshRequest = {
  refresh: string;
};

export type RefreshResponse = {
  access: string;
  // SimpleJWT only includes a new `refresh` here when ROTATE_REFRESH_TOKENS
  // is enabled on the backend. Today rotation is OFF, so the response is
  // `{access}` only — keep this field optional so the interceptor can
  // detect rotation-off mode and preserve the existing refresh token.
  refresh?: string;
};

// Change password
export type ChangePasswordRequest = {
  old_password: string;
  new_password: string;
  new_password_confirm: string;
};

export type ChangePasswordResponse = {
  message: string;
};

// Password reset (forgot password)
export type PasswordResetRequestRequest = {
  email: string;
};

export type PasswordResetRequestResponse = {
  message: string;
  email: string;
};

export type PasswordResetVerifyRequest = {
  email: string;
  code: string;
};

export type PasswordResetVerifyResponse = {
  message: string;
  email: string;
};

export type PasswordResetConfirmRequest = {
  email: string;
  new_password: string;
  new_password_confirm: string;
};

export type PasswordResetConfirmResponse = {
  message: string;
};

// Developer DDU template (self-upload)
export type DeveloperDDUTemplateUploadResponse = {
  message: string;
  ddu_template_url: string | null;
};

// Get Code
export type GetCodeRequest = {
  email: string;
};

export type GetCodeResponse = {
  message: string;
  email: string;
};

export type GetCodeError429 = {
  error: string;
  remaining_time: number;
  code: string;
};

// Verify Email
export type VerifyEmailRequest = {
  email: string;
  code: string;
};

export type VerifyEmailResponse = {
  message: string;
  email: string;
};

// Resend Code
export type ResendCodeRequest = {
  email: string;
};

// Register Broker (legacy multi-step с email-кодом)
export type RegisterBrokerRequest = {
  email: string;
  password: string;
  password_confirm: string;
  first_name?: string;
  last_name?: string;
  inn_number: string;
  phone_number: string;
  inn: File;
  passport: File;
  auction_obligation_accepted: boolean;
};

// Simple register (ТЗ от 2026-05-14, переработан 2026-05-15):
// 3-шаговый флоу — email + OTP + данные. На шаге 3 шлём всё включая
// email (он уже подтверждён через /verify-email/). role опционален,
// дефолт broker (developer создаётся через админку).
export type SimpleRegisterRequest = {
  email: string;
  first_name: string;
  phone_number: string;
  password: string;
  password_confirm: string;
  role?: "broker" | "developer";
  offer_accepted: boolean;
  obligation_accepted: boolean;
};

export type RegisterResponse = {
  message: string;
  refresh: string;
  access: string;
  user: TokenUser;
};

// Broker Verification
export type BrokerVerificationRequest = {
  id: number;
  action: "accept" | "reject";
};

// Me (current user profile) — kept for backward compat
export type MeResponse = TokenUser;

// User Documents
export type UploadDocumentRequest = {
  doc_type: 'inn' | 'passport' | 'others';
  document: File;
  document_name?: string;
};

export type UploadDocumentResponse = {
  message: string;
  document: UserDocument;
};

export type UpdateDocumentNameRequest = {
  document_id: number;
  document_name: string;
};

export type UpdateDocumentNameResponse = {
  message: string;
  document: UserDocument;
};
