import { apiInstance } from "@/shared/api";
import type {
  DocumentRequest,
  CreateDocumentRequestPayload,
  UploadDocumentResponsePayload,
} from "@/shared/types/document-requests";

export const documentRequestsService = {
  listByAuction: (auctionId: number) =>
    apiInstance.get<DocumentRequest[]>(
      `/auctions/${auctionId}/document-requests/`,
    ),

  create: (auctionId: number, data: CreateDocumentRequestPayload) =>
    apiInstance.post<DocumentRequest>(
      `/auctions/${auctionId}/request-documents/`,
      data,
    ),

  uploadResponse: (
    requestId: number,
    data: UploadDocumentResponsePayload,
  ) => {
    const formData = new FormData();
    for (const file of data.files) {
      formData.append("files", file, file.name);
    }
    if (data.broker_comment) {
      formData.append("broker_comment", data.broker_comment);
    }
    return apiInstance.post<DocumentRequest>(
      `/auctions/document-requests/${requestId}/upload/`,
      formData,
      { headers: { "Content-Type": "multipart/form-data" } },
    );
  },
};
