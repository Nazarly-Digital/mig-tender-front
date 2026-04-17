export type DocumentRequestStatus = "pending" | "answered" | "cancelled";

export type DocumentRequestFile = {
  id: number;
  file: string;
  uploaded_at: string;
};

export type DocumentRequest = {
  id: number;
  auction: number;
  broker: number;
  broker_email: string;
  requested_by: number;
  requested_by_email: string;
  description: string;
  broker_comment: string;
  status: DocumentRequestStatus;
  response_documents: DocumentRequestFile[];
  created_at: string;
  updated_at: string;
  answered_at: string | null;
};

export type CreateDocumentRequestPayload = {
  broker_id: number;
  description: string;
};

export type UploadDocumentResponsePayload = {
  files: File[];
  broker_comment?: string;
};
