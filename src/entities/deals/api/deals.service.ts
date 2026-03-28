import { apiInstance } from "@/shared/api";
import type {
  BrokerDeal,
  DeveloperDeal,
  AdminDeal,
  DealListParams,
  UploadDealDocumentRequest,
  UpdateDealCommentRequest,
  AdminDealActionRequest,
  DeveloperDealActionRequest,
  PaginatedResponse,
} from "@/shared/types/deals";

export const dealsService = {
  // Broker
  getMyDeals: (params?: DealListParams) =>
    apiInstance.get<PaginatedResponse<BrokerDeal>>("/deals/my/", { params }),

  uploadDocument: ({ deal_id, doc_type, file }: UploadDealDocumentRequest) => {
    const formData = new FormData();
    formData.append("doc_type", doc_type);
    formData.append("file", file);
    return apiInstance.post(`/deals/${deal_id}/documents/`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  updateComment: ({ deal_id, comment }: UpdateDealCommentRequest) =>
    apiInstance.patch(`/deals/${deal_id}/comment/`, { comment }),

  // Developer
  getDeveloperDeals: (params?: DealListParams) =>
    apiInstance.get<PaginatedResponse<DeveloperDeal>>("/deals/developer/", { params }),

  developerAction: ({ deal_id, action, reason }: DeveloperDealActionRequest) =>
    apiInstance.post(`/deals/${deal_id}/developer-action/`, { action, reason }),

  // Admin
  getAdminDeals: (params?: DealListParams) =>
    apiInstance.get<PaginatedResponse<AdminDeal>>("/deals/admin/", { params }),

  adminAction: ({ deal_id, action, reason }: AdminDealActionRequest) =>
    apiInstance.post(`/deals/${deal_id}/admin-action/`, { action, reason }),
};
