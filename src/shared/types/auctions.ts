import type { PaginatedResponse } from './properties';

export type AuctionMode = 'open' | 'closed';

export type AuctionStatus = 'draft' | 'active' | 'finished' | 'cancelled';

export type Auction = {
  id: number;
  property_id: number;
  owner_id: number;
  mode: AuctionMode;
  min_price: string;
  start_date: string;
  end_date: string;
  status: AuctionStatus;
  bids_count: number;
  current_price: string;
  highest_bid_id: number | null;
  winner_bid_id: number | null;
  created_at: string;
  updated_at: string;
};

export type AuctionDetail = Auction & {
  bids: unknown;
};

export type AuctionCreateRequest = {
  property_id: number;
  mode: AuctionMode;
  min_price: string;
  start_date: string;
  end_date: string;
};

export type AuctionListParams = {
  mode?: AuctionMode;
  status?: AuctionStatus;
  property_id?: number;
  owner_id?: number;
  active?: boolean;
  starts_before?: string;
  starts_after?: string;
  ends_before?: string;
  ends_after?: string;
  ordering?: string;
  page?: number;
  page_size?: number;
};

export type { PaginatedResponse };
