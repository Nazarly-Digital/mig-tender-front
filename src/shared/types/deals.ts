import type { PaginatedResponse } from "./properties";

// Deal obligation status
export type ObligationStatus = "active" | "fulfilled" | "overdue";

// Deal status (progress steps)
export type DealStatus =
  | "awaiting_documents"
  | "admin_review"
  | "developer_review"
  | "confirmed"
  | "overdue";

// Deal document
export type DealDocument = {
  id: number;
  filename: string;
  url: string;
  size: number;
  uploaded_at: string;
};

// Broker's deal (from broker perspective)
export type BrokerDeal = {
  id: number;
  property_name: string;
  developer_company: string;
  auction_id: number;
  auction_mode: "open" | "closed";
  bid_amount: string;
  obligation_status: ObligationStatus;
  status: DealStatus;
  deadline: string | null;
  uploaded_at: string | null;
  closed_at: string | null;
  documents: DealDocument[];
  comment: string | null;
};

// Developer's deal (from developer perspective)
export type DeveloperDeal = {
  id: number;
  property_name: string;
  auction_id: number;
  auction_mode: "open" | "closed";
  finished_at: string;
  property_price: string;
  broker_bid: string;
  commission_rate: string;
  admin_reviewed: boolean;
  admin_reviewed_at: string | null;
  status: DealStatus;
  closed_at: string | null;
  broker: {
    id: number;
    first_name: string;
    last_name: string;
    company_name: string;
    is_verified: boolean;
    initials: string;
  };
  documents: DealDocument[];
};

// Admin's deal (from admin perspective)
export type AdminDeal = {
  id: number;
  property_name: string;
  auction_id: number;
  auction_mode: "open" | "closed";
  property_price: string;
  broker_bid: string;
  developer_commission: string;
  platform_commission: string;
  obligation_status: ObligationStatus;
  status: DealStatus;
  closed_at: string | null;
  reviewed_at: string | null;
  broker: {
    id: number;
    first_name: string;
    last_name: string;
    company_name: string;
    initials: string;
  };
  developer: {
    id: number;
    company_name: string;
    initials: string;
  };
  documents: DealDocument[];
  broker_comment: string | null;
};

// List params
export type DealListParams = {
  status?: DealStatus;
  page?: number;
  page_size?: number;
};

// Mutations
export type UploadDealDocumentRequest = {
  deal_id: number;
  doc_type: "ddu" | "payment_confirmation";
  file: File;
};

export type UpdateDealCommentRequest = {
  deal_id: number;
  comment: string;
};

export type AdminDealActionRequest = {
  deal_id: number;
  action: "approve" | "reject";
  reason?: string;
};

export type DeveloperDealActionRequest = {
  deal_id: number;
  action: "confirm" | "reject";
  reason?: string;
};

export type { PaginatedResponse };
