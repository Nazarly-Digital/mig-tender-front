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
    inn_name?: string;
    inn_url?: string;
    passport_name?: string;
    passport_url?: string;
    verified_at?: string | null;
    rejected_at?: string | null;
  } | null;
  developer: {
    company_name?: string;
  } | null;
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
};

// Login
export type LoginRequest = {
  email: string;
  password: string;
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
  refresh: string;
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

// Register Developer
export type RegisterDeveloperRequest = {
  email: string;
  password: string;
  password_confirm: string;
  first_name?: string;
  last_name?: string;
  company_name: string;
};

// Register Broker
export type RegisterBrokerRequest = {
  email: string;
  password: string;
  password_confirm: string;
  first_name?: string;
  last_name?: string;
  inn_number: string;
  inn: File;
  passport: File;
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

// Broker Documents
export type BrokerDocumentsResponse = {
  is_verified: boolean;
  verification_status: string;
  rejected_at: string | null;
  verified_at: string | null;
  inn_number: string;
  inn_name: string;
  inn_url: string;
  passport_name: string;
  passport_url: string;
};

export type UploadBrokerDocumentsRequest = {
  inn?: File;
  inn_name?: string;
  passport?: File;
  passport_name?: string;
};

export type UpdateDocumentNamesRequest = {
  inn_name?: string;
  passport_name?: string;
};
