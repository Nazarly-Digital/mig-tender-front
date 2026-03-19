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
};
