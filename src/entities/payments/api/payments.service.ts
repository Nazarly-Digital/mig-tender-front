import { apiInstance } from "@/shared/api";
import type {
  BrokerPayment,
  BrokerPaymentSummary,
  DeveloperPayment,
  DeveloperPaymentSummary,
  PaymentListParams,
  PaginatedResponse,
} from "@/shared/types/payments";

export const paymentsService = {
  // Broker
  getBrokerPayments: (params?: PaymentListParams) =>
    apiInstance.get<PaginatedResponse<BrokerPayment>>("/payments/my/", { params }),

  getBrokerSummary: () =>
    apiInstance.get<BrokerPaymentSummary>("/payments/my/summary/"),

  // Developer
  getDeveloperPayments: (params?: PaymentListParams) =>
    apiInstance.get<PaginatedResponse<DeveloperPayment>>("/payments/developer/", { params }),

  getDeveloperSummary: () =>
    apiInstance.get<DeveloperPaymentSummary>("/payments/developer/summary/"),
};
