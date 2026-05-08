import { apiInstance } from "@/shared/api";
import type {
  LoginRequest,
  LoginResponse,
  RefreshRequest,
  RefreshResponse,
  GetCodeRequest,
  GetCodeResponse,
  VerifyEmailRequest,
  VerifyEmailResponse,
  ResendCodeRequest,
  RegisterBrokerRequest,
  RegisterResponse,
  BrokerVerificationRequest,
  MeResponse,
  MeApiResponse,
  UploadDocumentRequest,
  UploadDocumentResponse,
  UpdateDocumentNameRequest,
  UpdateDocumentNameResponse,
  UnifiedDocument,
  ChangePasswordRequest,
  ChangePasswordResponse,
  PasswordResetRequestRequest,
  PasswordResetRequestResponse,
  PasswordResetVerifyRequest,
  PasswordResetVerifyResponse,
  PasswordResetConfirmRequest,
  PasswordResetConfirmResponse,
  DeveloperDDUTemplateUploadResponse,
} from "@/shared/types/auth";

export const authService = {
  getCode: (data: GetCodeRequest) =>
    apiInstance.post<GetCodeResponse>("/auth/get-code/", data),

  verifyEmail: (data: VerifyEmailRequest) =>
    apiInstance.post<VerifyEmailResponse>("/auth/verify-email/", data),

  resendCode: (data: ResendCodeRequest) =>
    apiInstance.post<GetCodeResponse>("/auth/resend-code/", data),

  login: (data: LoginRequest) =>
    apiInstance.post<LoginResponse>("/auth/login/", data),

  refresh: (data: RefreshRequest) =>
    apiInstance.post<RefreshResponse>("/auth/refresh/", data),

  registerBroker: (data: RegisterBrokerRequest) => {
    const formData = new FormData();
    formData.append("email", data.email);
    formData.append("password", data.password);
    formData.append("password_confirm", data.password_confirm);
    formData.append("inn_number", data.inn_number);
    formData.append("phone_number", data.phone_number);
    formData.append("inn", data.inn);
    formData.append("passport", data.passport);
    formData.append(
      "auction_obligation_accepted",
      data.auction_obligation_accepted ? "true" : "false",
    );
    if (data.first_name) formData.append("first_name", data.first_name);
    if (data.last_name) formData.append("last_name", data.last_name);

    return apiInstance.post<RegisterResponse>(
      "/auth/register/broker/",
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      },
    );
  },

  verifyBroker: (data: BrokerVerificationRequest) =>
    apiInstance.post("/auth/verification/broker/", data),

  getMe: () =>
    apiInstance.get<MeApiResponse>("/auth/me/"),

  uploadDocument: (data: UploadDocumentRequest) => {
    const formData = new FormData();
    formData.append("doc_type", data.doc_type);
    formData.append("document", data.document, data.document.name);
    if (data.document_name) formData.append("document_name", data.document_name);

    return apiInstance.post<UploadDocumentResponse>(
      "/auth/documents/upload/",
      formData,
      { headers: { "Content-Type": "multipart/form-data" } },
    );
  },

  updateDocumentName: (data: UpdateDocumentNameRequest) =>
    apiInstance.patch<UpdateDocumentNameResponse>("/auth/documents/update-name/", data),

  deleteDocument: (documentId: number) =>
    apiInstance.delete<{ message: string }>(`/auth/documents/${documentId}/`),

  getAllDocuments: () =>
    apiInstance.get<UnifiedDocument[]>("/auth/documents/all/"),

  changePassword: (data: ChangePasswordRequest) =>
    apiInstance.post<ChangePasswordResponse>("/auth/change-password/", data),

  passwordResetRequest: (data: PasswordResetRequestRequest) =>
    apiInstance.post<PasswordResetRequestResponse>(
      "/auth/password-reset/request/",
      data,
    ),

  passwordResetVerify: (data: PasswordResetVerifyRequest) =>
    apiInstance.post<PasswordResetVerifyResponse>(
      "/auth/password-reset/verify/",
      data,
    ),

  passwordResetConfirm: (data: PasswordResetConfirmRequest) =>
    apiInstance.post<PasswordResetConfirmResponse>(
      "/auth/password-reset/confirm/",
      data,
    ),

  uploadDeveloperDDUTemplate: (file: File) => {
    const formData = new FormData();
    formData.append("ddu_template", file, file.name);
    return apiInstance.put<DeveloperDDUTemplateUploadResponse>(
      "/auth/developer/ddu-template/",
      formData,
      { headers: { "Content-Type": "multipart/form-data" } },
    );
  },
};
