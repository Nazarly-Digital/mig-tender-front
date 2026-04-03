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
    apiInstance.get<Payment[]>("/payments/", { params }),

  // Summary (role-scoped on backend — returns different shape per role)
  getSummary: () =>
    apiInstance.get<BrokerPaymentSummary | DeveloperPaymentSummary>("/payments/summary/"),

  // Admin: upload receipt and mark as paid
  uploadReceipt: (paymentId: number, file: File) => {
    const formData = new FormData();
    formData.append("receipt_document", file);
    return apiInstance.post<Payment>(`/payments/${paymentId}/upload-receipt/`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
};
