import type { PaginatedResponse } from "./properties";

// Deal obligation status
export type ObligationStatus = "active" | "fulfilled" | "overdue";

// Deal status — matches backend Deal.Status
export type DealStatus =
  | "pending_documents"
  | "admin_review"
  | "developer_confirm"
  | "confirmed";

// Deal log entry
export type DealLogEntry = {
  id: number;
  action: string;
  actor_id: number | null;
  actor_email: string | null;
  detail: string;
  created_at: string;
};

// Unified Deal type — backend returns same shape for all roles
export type Deal = {
  id: number;
  auction_id: number;
  real_property_id: number;
  broker_id: number;
  developer_id: number;
  broker_name: string;
  developer_name: string;
  property_address: string;
  auction_mode: "open" | "closed";
  amount: string;
  status: DealStatus;
  obligation_status: ObligationStatus;
  document_deadline: string;
  created_at: string;
  updated_at: string;
};

// Deal detail — extended with documents, comments, logs
export type DealDetail = Deal & {
  ddu_document: string | null;
  payment_proof_document: string | null;
  broker_comment: string;
  admin_rejection_reason: string;
  developer_rejection_reason: string;
  commission_rate: string | null;
  property_price: string;
  logs: DealLogEntry[];
};

// List params
export type DealListParams = {
  status?: DealStatus;
  obligation_status?: ObligationStatus;
  auction_id?: number;
  page?: number;
  page_size?: number;
};

// Mutations
export type UploadDDURequest = {
  deal_id: number;
  ddu_document: File;
};

export type UploadPaymentProofRequest = {
  deal_id: number;
  payment_proof_document: File;
};

export type UpdateDealCommentRequest = {
  deal_id: number;
  comment: string;
};

export type RejectReasonRequest = {
  deal_id: number;
  reason: string;
};

export type { PaginatedResponse };
