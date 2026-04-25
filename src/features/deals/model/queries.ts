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
  confirmedTotal: () => [...dealKeys.all, "confirmed-total"] as const,
};

// --- List & Detail ---

export function useDeals(
  params?: DealListParams,
  options?: { enabled?: boolean },
) {
  return useQuery({
    queryKey: dealKeys.list(params),
    queryFn: () => dealsService.getAll(params).then((res) => res.data),
    enabled: options?.enabled ?? true,
  });
}

// Sum of `amount` across ALL confirmed deals visible to the caller (backend
// scopes /deals/ by role). Walks the paginated endpoint so the total is correct
// regardless of page_size limits.
export function useConfirmedDealsTotal(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: dealKeys.confirmedTotal(),
    enabled: options?.enabled ?? true,
    queryFn: async () => {
      const PAGE_SIZE = 100;
      const first = await dealsService
        .getAll({ status: "confirmed", page_size: PAGE_SIZE })
        .then((r) => r.data);

      let results = first.results;
      const totalPages = Math.ceil(first.count / PAGE_SIZE);

      if (totalPages > 1) {
        const rest = await Promise.all(
          Array.from({ length: totalPages - 1 }, (_, i) =>
            dealsService
              .getAll({ status: "confirmed", page_size: PAGE_SIZE, page: i + 2 })
              .then((r) => r.data.results),
          ),
        );
        results = results.concat(...rest);
      }

      const totalAmount = results.reduce(
        (acc, d) => acc + parseFloat(d.amount || "0"),
        0,
      );
      return { totalAmount, count: first.count };
    },
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

export function useSubmitForReview() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (deal_id: number) =>
      dealsService.submitForReview(deal_id).then((res) => res.data),
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
