import { apiInstance } from "@/shared/api";
import type {
  Payment,
  BrokerPaymentSummary,
  DeveloperPaymentSummary,
  PaymentListParams,
  PaginatedResponse,
} from "@/shared/types/payments";

export const paymentsService = {
  // List (role-scoped on backend)
  getAll: (params?: PaymentListParams) =>
    apiInstance.get<PaginatedResponse<Payment>>("/payments/", { params }),

  // Summary (role-scoped on backend — returns different shape per role)
  getSummary: () =>
    apiInstance.get<BrokerPaymentSummary | DeveloperPaymentSummary>("/payments/summary/"),
};
