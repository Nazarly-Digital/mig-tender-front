import type { PaginatedResponse } from "./properties";

// Deal obligation status
export type ObligationStatus = "active" | "fulfilled" | "overdue";

// Deal status — matches backend Deal.Status
export type DealStatus =
  | "pending_documents"
  | "admin_review"
  | "developer_confirm"
  | "confirmed"
  | "failed"
  | "declined";

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
  // Все объекты сделки. Для одиночной = 1 элемент (== real_property),
  // для multi-property после consolidation/distribute — N элементов
  // с адресами всех объектов, забранных этим брокером.
  // Поля area/floor/house_number/land_number/rooms/type — дискриминаторы
  // для случая, когда несколько объектов в лоте имеют одинаковый
  // address (один комплекс, разные квартиры/секции).
  properties: Array<{
    id: number;
    address: string;
    price: string | null;
    area: string | null;
    floor: number | null;
    house_number: string | null;
    land_number: string | null;
    type: string | null;
    rooms: number | null;
  }>;
  auction_mode: "open" | "closed";
  amount: string;
  status: DealStatus;
  obligation_status: ObligationStatus;
  has_ddu: boolean;
  has_payment_proof: boolean;
  ddu_document: string | null;
  payment_proof_document: string | null;
  developer_ddu_template_url: string | null;
  broker_commission_rate: string | null;
  broker_commission_amount: string | null;
  platform_commission_rate: string | null;
  platform_commission_amount: string | null;
  document_deadline: string;
  created_at: string;
  updated_at: string;
  broker_comment?: string;
  admin_rejection_reason?: string;
  developer_rejection_reason?: string;
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
  broker_id?: number;
  developer_id?: number;
  // Free-text search against broker / developer (email + name + company).
  // Backend handles via DealFilter.filter_broker_search /
  // filter_developer_search, so the page doesn't have to fetch every
  // deal client-side.
  broker_search?: string;
  developer_search?: string;
  // Date-only bounds — backend extracts `created_at::date` for the
  // comparison, so passing the same value in both fields returns the
  // entire day.
  date_from?: string;
  date_to?: string;
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
