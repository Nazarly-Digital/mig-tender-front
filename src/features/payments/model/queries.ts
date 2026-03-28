import { useQuery } from "@tanstack/react-query";
import { paymentsService } from "@/entities/payments";
import type { PaymentListParams } from "@/shared/types/payments";

export const paymentKeys = {
  all: ["payments"] as const,
  brokerPayments: (params?: PaymentListParams) => [...paymentKeys.all, "broker", params] as const,
  brokerSummary: () => [...paymentKeys.all, "broker-summary"] as const,
  developerPayments: (params?: PaymentListParams) => [...paymentKeys.all, "developer", params] as const,
  developerSummary: () => [...paymentKeys.all, "developer-summary"] as const,
};

// --- Broker ---

export function useBrokerPayments(params?: PaymentListParams) {
  return useQuery({
    queryKey: paymentKeys.brokerPayments(params),
    queryFn: () => paymentsService.getBrokerPayments(params).then((res) => res.data),
  });
}

export function useBrokerPaymentSummary() {
  return useQuery({
    queryKey: paymentKeys.brokerSummary(),
    queryFn: () => paymentsService.getBrokerSummary().then((res) => res.data),
  });
}

// --- Developer ---

export function useDeveloperPayments(params?: PaymentListParams) {
  return useQuery({
    queryKey: paymentKeys.developerPayments(params),
    queryFn: () => paymentsService.getDeveloperPayments(params).then((res) => res.data),
  });
}

export function useDeveloperPaymentSummary() {
  return useQuery({
    queryKey: paymentKeys.developerSummary(),
    queryFn: () => paymentsService.getDeveloperSummary().then((res) => res.data),
  });
}
