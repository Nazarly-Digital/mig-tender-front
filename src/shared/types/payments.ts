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

// ---------- Transit settlement (new model) ----------

export type Settlement = {
  id: number;
  deal_id: number;
  property_name: string;
  auction_id: number;
  broker_id: number;
  broker_name: string;
  developer_id: number;
  developer_name: string;
  deal_amount: string;
  deal_status: string;

  broker_amount: string;
  broker_rate: string;
  platform_amount: string;
  platform_rate: string;
  total_from_developer: string;

  paid_to_broker: boolean;
  paid_to_broker_at: string | null;
  broker_payout_receipt: string | null;
  broker_payout_deadline: string;
  broker_payout_overdue: boolean;

  received_from_developer: boolean;
  received_from_developer_at: string | null;
  developer_receipt: string | null;
  developer_receipt_uploaded_at: string | null;
  developer_payment_deadline: string;
  developer_payment_overdue: boolean;

  is_financially_closed: boolean;
  created_at: string;
  updated_at: string;
};

export type SettlementSummary = {
  total_settlements: number;
  closed: number;
  awaiting_broker_payout: number;
  awaiting_developer_payment: number;
  total_owed_by_developers: string;
  total_paid_to_brokers: string;
  total_received_from_developers: string;
};

export type { PaginatedResponse };
