import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { authService } from "@/entities/auth/api/auth.service";
import { useSessionStore } from "@/entities/auth/model/store";
import type {
  LoginRequest,
  GetCodeRequest,
  VerifyEmailRequest,
  ResendCodeRequest,
  RegisterBrokerRequest,
  BrokerVerificationRequest,
  UploadDocumentRequest,
  UpdateDocumentNameRequest,
  ChangePasswordRequest,
  PasswordResetRequestRequest,
  PasswordResetVerifyRequest,
  PasswordResetConfirmRequest,
} from "@/shared/types/auth";

export const authKeys = {
  me: ["auth", "me"] as const,
  allDocuments: ["auth", "allDocuments"] as const,
};

export function useMe() {
  const { isAuthenticated, setUser } = useSessionStore();

  const query = useQuery({
    queryKey: authKeys.me,
    queryFn: async () => {
      const res = await authService.getMe();
      const me = res.data;
      // Map /auth/me/ response to TokenUser shape
      const role = me.is_admin ? 'admin' : me.is_developer ? 'developer' : 'broker';
      setUser({
        id: me.id,
        email: me.email,
        first_name: me.first_name,
        last_name: me.last_name,
        role,
        is_broker: me.is_broker,
        is_developer: me.is_developer,
        is_admin: me.is_admin,
        is_active: me.is_active,
        date_joined: me.date_joined,
        broker: me.broker,
        developer: me.developer,
        documents: me.documents ?? [],
      });
      return me;
    },
    enabled: isAuthenticated,
  });

  return query;
}

export function useLogin() {
  const { setTokens, setUser } = useSessionStore();

  return useMutation({
    mutationFn: (data: LoginRequest) =>
      authService.login(data).then((res) => res.data),
    onSuccess: (data) => {
      setTokens(data.access, data.refresh);
      setUser(data.user);
    },
  });
}

export function useGetCode() {
  return useMutation({
    mutationFn: (data: GetCodeRequest) =>
      authService.getCode(data).then((res) => res.data),
  });
}

export function useVerifyEmail() {
  return useMutation({
    mutationFn: (data: VerifyEmailRequest) =>
      authService.verifyEmail(data).then((res) => res.data),
  });
}

export function useResendCode() {
  return useMutation({
    mutationFn: (data: ResendCodeRequest) =>
      authService.resendCode(data).then((res) => res.data),
  });
}

export function useRegisterBroker() {
  const { setTokens, setUser } = useSessionStore();

  return useMutation({
    mutationFn: (data: RegisterBrokerRequest) =>
      authService.registerBroker(data).then((res) => res.data),
    onSuccess: (data) => {
      setTokens(data.access, data.refresh);
      setUser(data.user);
    },
  });
}

export function useVerifyBroker() {
  return useMutation({
    mutationFn: (data: BrokerVerificationRequest) =>
      authService.verifyBroker(data).then((res) => res.data),
  });
}

export function useLogout() {
  const { logout } = useSessionStore();
  const router = useRouter();

  return useMutation({
    mutationFn: async () => {
      logout();
    },
    onSuccess: () => {
      router.replace("/login");
    },
  });
}

export function useUploadDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UploadDocumentRequest) =>
      authService.uploadDocument(data).then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: authKeys.me });
      queryClient.invalidateQueries({ queryKey: authKeys.allDocuments });
    },
  });
}

export function useUpdateDocumentName() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateDocumentNameRequest) =>
      authService.updateDocumentName(data).then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: authKeys.me });
    },
  });
}

export function useDeleteDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (documentId: number) =>
      authService.deleteDocument(documentId).then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: authKeys.me });
      queryClient.invalidateQueries({ queryKey: authKeys.allDocuments });
    },
  });
}

export function useAllDocuments() {
  const { isAuthenticated } = useSessionStore();

  return useQuery({
    queryKey: authKeys.allDocuments,
    queryFn: () => authService.getAllDocuments().then((res) => res.data),
    enabled: isAuthenticated,
  });
}

export function useChangePassword() {
  return useMutation({
    mutationFn: (data: ChangePasswordRequest) =>
      authService.changePassword(data).then((res) => res.data),
  });
}

export function usePasswordResetRequest() {
  return useMutation({
    mutationFn: (data: PasswordResetRequestRequest) =>
      authService.passwordResetRequest(data).then((res) => res.data),
  });
}

export function usePasswordResetVerify() {
  return useMutation({
    mutationFn: (data: PasswordResetVerifyRequest) =>
      authService.passwordResetVerify(data).then((res) => res.data),
  });
}

export function usePasswordResetConfirm() {
  return useMutation({
    mutationFn: (data: PasswordResetConfirmRequest) =>
      authService.passwordResetConfirm(data).then((res) => res.data),
  });
}
