import type { PaginatedResponse } from "./properties";

// Payment status
export type PaymentStatus = "pending" | "paid";

// Payment type
export type PaymentType = "developer_commission" | "platform_commission";

// Unified Payment — backend returns same shape
export type Payment = {
  id: number;
  deal_id: number;
  property_name: string;
  auction_id: number;
  broker_id: number;
  developer_id: number;
  type: PaymentType;
  amount: string;
  rate: string;
  status: PaymentStatus;
  receipt_document: string | null;
  created_at: string;
  updated_at: string;
};

// Broker payment summary (from /payments/summary/ for broker)
export type BrokerPaymentSummary = {
  total: string;
  from_developers: string;
  from_platform: string;
  pending: string;
  paid: string;
};

// Developer payment summary (from /payments/summary/ for developer)
export type DeveloperPaymentSummary = {
  total_to_pay: string;
  paid: string;
  pending: string;
};

// List params
export type PaymentListParams = {
  status?: PaymentStatus;
  type?: PaymentType;
  page?: number;
  page_size?: number;
};

export type { PaginatedResponse };
