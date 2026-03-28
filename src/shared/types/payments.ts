import type { PaginatedResponse } from "./properties";

// Payment status
export type PaymentStatus = "pending" | "confirmed" | "paid";

// Commission source
export type CommissionInfo = {
  rate: string;
  amount: string;
  status: PaymentStatus;
  receipt_url: string | null;
};

// Broker's payment
export type BrokerPayment = {
  id: number;
  property_name: string;
  auction_id: number;
  property_price: string;
  status: PaymentStatus;
  developer_commission: CommissionInfo;
  platform_commission: CommissionInfo;
  total: string;
};

// Broker payment summary
export type BrokerPaymentSummary = {
  total_accrued: string;
  from_developers: string;
  from_platform: string;
  pending: string;
};

// Developer's payment
export type DeveloperPayment = {
  id: number;
  property_name: string;
  auction_id: number;
  deal_confirmed_at: string;
  status: PaymentStatus;
  broker: {
    id: number;
    first_name: string;
    last_name: string;
    company_name: string;
    initials: string;
  };
  property_price: string;
  commission_rate: string;
  payment_amount: string;
  paid_at: string | null;
};

// Developer payment summary
export type DeveloperPaymentSummary = {
  total_to_pay: string;
  paid: string;
  pending: string;
};

// List params
export type PaymentListParams = {
  status?: PaymentStatus;
  page?: number;
  page_size?: number;
};

export type { PaginatedResponse };
