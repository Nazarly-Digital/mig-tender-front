import { useQuery } from "@tanstack/react-query";
import { paymentsService } from "@/entities/payments";
import type { PaymentListParams } from "@/shared/types/payments";

export const paymentKeys = {
  all: ["payments"] as const,
  list: (params?: PaymentListParams) => [...paymentKeys.all, "list", params] as const,
  summary: () => [...paymentKeys.all, "summary"] as const,
};

export function usePayments(params?: PaymentListParams) {
  return useQuery({
    queryKey: paymentKeys.list(params),
    queryFn: () => paymentsService.getAll(params).then((res) => res.data),
  });
}

export function usePaymentSummary() {
  return useQuery({
    queryKey: paymentKeys.summary(),
    queryFn: () => paymentsService.getSummary().then((res) => res.data),
  });
}
