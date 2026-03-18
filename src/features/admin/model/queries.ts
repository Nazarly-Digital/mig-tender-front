import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminService } from "@/entities/admin";
import type {
  AdminUserListParams,
  PendingPropertyListParams,
  RejectPropertyRequest,
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
    mutationFn: (id: number) =>
      adminService.blockUser(id).then((res) => res.data),
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

// --- Properties moderation ---

export function usePendingProperties(params?: PendingPropertyListParams) {
  return useQuery({
    queryKey: adminKeys.pendingProperties(params),
    queryFn: () =>
      adminService.getPendingProperties(params).then((res) => res.data),
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
      data?: RejectPropertyRequest;
    }) => adminService.rejectProperty(id, data).then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.all });
    },
  });
}
