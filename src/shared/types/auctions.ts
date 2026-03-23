import type { PaginatedResponse } from "./properties";

export type AuctionMode = "open" | "closed";

export type AuctionStatus =
  | "draft"
  | "active"
  | "finished"
  | "cancelled"
  | "scheduled";

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

export type AuctionDetailBid = {
  id: number;
  auction_id: number;
  broker_id: number;
  amount: string;
  created_at: string;
};

export type AuctionDetail = Auction & {
  bids: AuctionDetailBid[];
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

// Participants
export type Participant = {
  id: number;
  user_id: number;
  auction_id: number;
  first_name: string;
  last_name: string;
  email: string;
  joined_at: string;
};

export type JoinAuctionResponse = {
  message: string;
};

// Bids
export type Bid = {
  id: number;
  auction_id: number;
  user_id: number;
  amount: string;
  first_name: string;
  last_name: string;
  created_at: string;
  updated_at: string;
};

export type BidCreateRequest = {
  amount: string;
};

export type BidUpdateRequest = {
  amount: string;
};

// Closed flow
export type ShortlistRequest = {
  participant_ids: number[];
};

export type SelectWinnerRequest = {
  bid_id: number;
};

export type { PaginatedResponse };
