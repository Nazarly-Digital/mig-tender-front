import { apiInstance } from "@/shared/api";
import type {
  Payment,
  BrokerPaymentSummary,
  DeveloperPaymentSummary,
  PaymentListParams,
  Settlement,
  SettlementSummary,
} from "@/shared/types/payments";

export const paymentsService = {
  // List (role-scoped on backend)
  getAll: (params?: PaymentListParams) =>
    apiInstance.get<Payment[]>("/payments/", { params }),

  // Summary (role-scoped on backend — returns different shape per role)
  getSummary: () =>
    apiInstance.get<BrokerPaymentSummary | DeveloperPaymentSummary>("/payments/summary/"),

  // Admin: upload receipt and mark as paid (legacy Payment-based flow)
  uploadReceipt: (paymentId: number, file: File) => {
    const formData = new FormData();
    formData.append("receipt_document", file);
    return apiInstance.post<Payment>(`/payments/${paymentId}/upload-receipt/`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  // ---------- Transit settlements ----------
  getSettlements: () => apiInstance.get<Settlement[]>("/payments/settlements/"),

  getSettlementSummary: () =>
    apiInstance.get<SettlementSummary>("/payments/settlements/summary/"),

  markPaidToBroker: (settlementId: number, file: File) => {
    const formData = new FormData();
    formData.append("broker_payout_receipt", file);
    return apiInstance.post<Settlement>(
      `/payments/settlements/${settlementId}/mark-paid-to-broker/`,
      formData,
      { headers: { "Content-Type": "multipart/form-data" } },
    );
  },

  uploadDeveloperReceipt: (settlementId: number, file: File) => {
    const formData = new FormData();
    formData.append("developer_receipt", file);
    return apiInstance.post<Settlement>(
      `/payments/settlements/${settlementId}/upload-developer-receipt/`,
      formData,
      { headers: { "Content-Type": "multipart/form-data" } },
    );
  },

  confirmDeveloperReceipt: (settlementId: number) =>
    apiInstance.post<Settlement>(
      `/payments/settlements/${settlementId}/confirm-developer-receipt/`,
    ),
};
