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
  RegisterDeveloperRequest,
  RegisterBrokerRequest,
  RegisterResponse,
  BrokerVerificationRequest,
  MeResponse,
  MeApiResponse,
  BrokerDocumentsResponse,
  UploadBrokerDocumentsRequest,
  UpdateDocumentNamesRequest,
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

  registerDeveloper: (data: RegisterDeveloperRequest) =>
    apiInstance.post<RegisterResponse>("/auth/register/developer/", data),

  registerBroker: (data: RegisterBrokerRequest) => {
    const formData = new FormData();
    formData.append("email", data.email);
    formData.append("password", data.password);
    formData.append("password_confirm", data.password_confirm);
    formData.append("inn_number", data.inn_number);
    formData.append("inn", data.inn);
    formData.append("passport", data.passport);
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

  uploadBrokerDocuments: (data: UploadBrokerDocumentsRequest) => {
    const formData = new FormData();
    if (data.inn) formData.append("inn", data.inn, data.inn.name);
    if (data.inn_name) formData.append("inn_name", data.inn_name);
    if (data.passport) formData.append("passport", data.passport, data.passport.name);
    if (data.passport_name) formData.append("passport_name", data.passport_name);

    return apiInstance.post<BrokerDocumentsResponse>(
      "/auth/broker/upload-documents/",
      formData,
      { headers: { "Content-Type": "multipart/form-data" } },
    );
  },

  updateDocumentNames: (data: UpdateDocumentNamesRequest) =>
    apiInstance.patch<BrokerDocumentsResponse>("/auth/broker/update-document-names/", data),
};
