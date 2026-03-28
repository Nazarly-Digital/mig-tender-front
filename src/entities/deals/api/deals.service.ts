import { apiInstance } from "@/shared/api";
import type {
  Deal,
  DealDetail,
  DealListParams,
  DealLogEntry,
  UploadDDURequest,
  UploadPaymentProofRequest,
  UpdateDealCommentRequest,
  RejectReasonRequest,
  PaginatedResponse,
} from "@/shared/types/deals";

export const dealsService = {
  // List (role-scoped on backend)
  getAll: (params?: DealListParams) =>
    apiInstance.get<PaginatedResponse<Deal>>("/deals/", { params }),

  getById: (id: number) =>
    apiInstance.get<DealDetail>(`/deals/${id}/`),

  // Broker: upload documents
  uploadDDU: ({ deal_id, ddu_document }: UploadDDURequest) => {
    const formData = new FormData();
    formData.append("ddu_document", ddu_document);
    return apiInstance.post(`/deals/${deal_id}/upload-ddu/`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  uploadPaymentProof: ({ deal_id, payment_proof_document }: UploadPaymentProofRequest) => {
    const formData = new FormData();
    formData.append("payment_proof_document", payment_proof_document);
    return apiInstance.post(`/deals/${deal_id}/upload-payment-proof/`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  updateComment: ({ deal_id, comment }: UpdateDealCommentRequest) =>
    apiInstance.patch(`/deals/${deal_id}/comment/`, { comment }),

  // Admin actions
  adminApprove: (deal_id: number) =>
    apiInstance.post(`/deals/${deal_id}/admin-approve/`),

  adminReject: ({ deal_id, reason }: RejectReasonRequest) =>
    apiInstance.post(`/deals/${deal_id}/admin-reject/`, { reason }),

  // Developer actions
  developerConfirm: (deal_id: number) =>
    apiInstance.post(`/deals/${deal_id}/developer-confirm/`),

  developerReject: ({ deal_id, reason }: RejectReasonRequest) =>
    apiInstance.post(`/deals/${deal_id}/developer-reject/`, { reason }),

  // Logs
  getLogs: (deal_id: number) =>
    apiInstance.get<DealLogEntry[]>(`/deals/${deal_id}/logs/`),
};
