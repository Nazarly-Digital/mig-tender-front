import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminService } from "@/entities/admin";
import type {
  AdminUserListParams,
  PendingPropertyListParams,
  RejectPropertyRequest,
  AdminCreateDeveloperRequest,
  AdminUpdateDeveloperRequest,
  AdminUpdateBrokerRequest,
} from "@/shared/types/admin";

export const adminKeys = {
  all: ["admin"] as const,
  users: (params?: AdminUserListParams) =>
    [...adminKeys.all, "users", params] as const,
  pendingProperties: (params?: PendingPropertyListParams) =>
    [...adminKeys.all, "pending-properties", params] as const,
};

// --- Users ---

export function useAdminUsers(params?: AdminUserListParams) {
  return useQuery({
    queryKey: adminKeys.users(params),
    queryFn: () => adminService.getUsers(params).then((res) => res.data),
  });
}

export function useBlockUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, isActive }: { id: number; isActive: boolean }) =>
      adminService.blockUser(id, isActive).then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.all });
    },
  });
}

export function useAdminVerifyBroker() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) =>
      adminService.verifyBroker(id).then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.all });
    },
  });
}

export function useAdminRejectBroker() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: number; reason: string }) =>
      adminService.rejectBroker(id, reason).then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.all });
    },
  });
}

// --- Developer management ---

export function useAdminCreateDeveloper() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: AdminCreateDeveloperRequest) =>
      adminService.createDeveloper(data).then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.all });
    },
  });
}

export function useAdminUpdateDeveloper() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: AdminUpdateDeveloperRequest }) =>
      adminService.updateDeveloper(id, data).then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.all });
    },
  });
}

// Запрос кода подтверждения на новый email девелопера (фидбек 2026-05-22).
export function useAdminRequestDeveloperEmailCode() {
  return useMutation({
    mutationFn: ({ id, email }: { id: number; email: string }) =>
      adminService.requestDeveloperEmailCode(id, email).then((res) => res.data),
  });
}

// --- Broker management ---

export function useAdminUpdateBroker() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: AdminUpdateBrokerRequest }) =>
      adminService.updateBroker(id, data).then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.all });
    },
  });
}

// --- Properties moderation ---

export function usePendingProperties(params?: PendingPropertyListParams, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: adminKeys.pendingProperties(params),
    queryFn: () =>
      adminService.getPendingProperties(params).then((res) => res.data),
    enabled: options?.enabled,
  });
}

export function useApproveProperty() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) =>
      adminService.approveProperty(id).then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.all });
    },
  });
}

export function useRejectProperty() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number;
      data: RejectPropertyRequest;
    }) => adminService.rejectProperty(id, data).then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.all });
    },
  });
}
