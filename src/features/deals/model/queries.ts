import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { dealsService } from "@/entities/deals";
import { useSessionStore } from "@/entities/auth/model/store";
import type {
  DealListParams,
  UploadDealDocumentRequest,
  UpdateDealCommentRequest,
  AdminDealActionRequest,
  DeveloperDealActionRequest,
} from "@/shared/types/deals";

export const dealKeys = {
  all: ["deals"] as const,
  myDeals: (params?: DealListParams) => [...dealKeys.all, "my", params] as const,
  developerDeals: (params?: DealListParams) => [...dealKeys.all, "developer", params] as const,
  adminDeals: (params?: DealListParams) => [...dealKeys.all, "admin", params] as const,
};

// --- Broker ---

export function useMyDeals(params?: DealListParams) {
  return useQuery({
    queryKey: dealKeys.myDeals(params),
    queryFn: () => dealsService.getMyDeals(params).then((res) => res.data),
  });
}

export function useUploadDealDocument() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: UploadDealDocumentRequest) =>
      dealsService.uploadDocument(data).then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: dealKeys.all });
    },
  });
}

export function useUpdateDealComment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateDealCommentRequest) =>
      dealsService.updateComment(data).then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: dealKeys.all });
    },
  });
}

// --- Developer ---

export function useDeveloperDeals(params?: DealListParams) {
  return useQuery({
    queryKey: dealKeys.developerDeals(params),
    queryFn: () => dealsService.getDeveloperDeals(params).then((res) => res.data),
  });
}

export function useDeveloperDealAction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: DeveloperDealActionRequest) =>
      dealsService.developerAction(data).then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: dealKeys.all });
    },
  });
}

// --- Admin ---

export function useAdminDeals(params?: DealListParams) {
  return useQuery({
    queryKey: dealKeys.adminDeals(params),
    queryFn: () => dealsService.getAdminDeals(params).then((res) => res.data),
  });
}

export function useAdminDealAction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: AdminDealActionRequest) =>
      dealsService.adminAction(data).then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: dealKeys.all });
    },
  });
}
