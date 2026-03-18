import { useMutation, useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { authService } from "@/entities/auth/api/auth.service";
import { useSessionStore } from "@/entities/auth/model/store";
import type {
  LoginRequest,
  GetCodeRequest,
  VerifyEmailRequest,
  ResendCodeRequest,
  RegisterDeveloperRequest,
  RegisterBrokerRequest,
  BrokerVerificationRequest,
} from "@/shared/types/auth";

export const authKeys = {
  me: ["auth", "me"] as const,
};

export function useMe() {
  const { isAuthenticated, setUser } = useSessionStore();

  const query = useQuery({
    queryKey: authKeys.me,
    queryFn: async () => {
      const res = await authService.getMe();
      setUser(res.data);
      return res.data;
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

export function useRegisterDeveloper() {
  const { setTokens, setUser } = useSessionStore();

  return useMutation({
    mutationFn: (data: RegisterDeveloperRequest) =>
      authService.registerDeveloper(data).then((res) => res.data),
    onSuccess: (data) => {
      setTokens(data.access, data.refresh);
      setUser(data.user);
    },
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
      router.push("/login");
    },
  });
}
