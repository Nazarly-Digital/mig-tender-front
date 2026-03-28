import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { dealsService } from "@/entities/deals";
import type {
  DealListParams,
  UploadDDURequest,
  UploadPaymentProofRequest,
  UpdateDealCommentRequest,
  RejectReasonRequest,
} from "@/shared/types/deals";

export const dealKeys = {
  all: ["deals"] as const,
  list: (params?: DealListParams) => [...dealKeys.all, "list", params] as const,
  detail: (id: number) => [...dealKeys.all, "detail", id] as const,
  logs: (id: number) => [...dealKeys.all, "logs", id] as const,
};

// --- List & Detail ---

export function useDeals(params?: DealListParams) {
  return useQuery({
    queryKey: dealKeys.list(params),
    queryFn: () => dealsService.getAll(params).then((res) => res.data),
  });
}

export function useDealDetail(id: number) {
  return useQuery({
    queryKey: dealKeys.detail(id),
    queryFn: () => dealsService.getById(id).then((res) => res.data),
    enabled: id > 0,
  });
}

export function useDealLogs(id: number) {
  return useQuery({
    queryKey: dealKeys.logs(id),
    queryFn: () => dealsService.getLogs(id).then((res) => res.data),
    enabled: id > 0,
  });
}

// --- Broker mutations ---

export function useUploadDDU() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: UploadDDURequest) =>
      dealsService.uploadDDU(data).then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: dealKeys.all });
    },
  });
}

export function useUploadPaymentProof() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: UploadPaymentProofRequest) =>
      dealsService.uploadPaymentProof(data).then((res) => res.data),
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

// --- Admin mutations ---

export function useAdminApproveDeal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (deal_id: number) =>
      dealsService.adminApprove(deal_id).then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: dealKeys.all });
    },
  });
}

export function useAdminRejectDeal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: RejectReasonRequest) =>
      dealsService.adminReject(data).then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: dealKeys.all });
    },
  });
}

// --- Developer mutations ---

export function useDeveloperConfirmDeal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (deal_id: number) =>
      dealsService.developerConfirm(deal_id).then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: dealKeys.all });
    },
  });
}

export function useDeveloperRejectDeal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: RejectReasonRequest) =>
      dealsService.developerReject(data).then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: dealKeys.all });
    },
  });
}
