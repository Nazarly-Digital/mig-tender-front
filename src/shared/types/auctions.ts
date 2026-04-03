import type { PaginatedResponse } from "./properties";

export type AuctionMode = "open" | "closed";

export type AuctionStatus =
  | "draft"
  | "active"
  | "finished"
  | "cancelled"
  | "scheduled";

export type AuctionLotProperty = {
  id: number;
  reference_id: string;
  type: string;
  address: string;
  area: string;
  property_class: string;
  price: string;
  commission_rate: string;
  deadline: string;
  status: string;
  moderation_status: string;
};

export type Auction = {
  id: number;
  real_property: {
    id: number;
    address: string;
  };
  properties: AuctionLotProperty[];
  owner_id: number;
  mode: AuctionMode;
  min_price: string;
  min_bid_increment: string | null;
  start_date: string;
  end_date: string;
  status: AuctionStatus;
  bids_count: number;
  current_price: string;
  highest_bid_id: number | null;
  winner_bid: {
    id: number;
    broker: { id: number; fullname: string };
    amount: string;
    is_sealed: boolean;
  } | null;
  lot_total_price: string | null;
  deals_created: boolean;
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
  myBid: AuctionDetailBid | null;
};

export type AuctionCreateRequest = {
  propertyIds: number[];
  mode: AuctionMode;
  min_price: string;
  min_bid_increment?: string;
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
  broker_id: number;
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
  bid_ids: number[];
};

export type ShortlistResponse = {
  shortlistedBidIds: number[];
};

export type SelectWinnerRequest = {
  brokerIds: number[];
};

export type SelectWinnerResponse = {
  auctionId: number;
  selectedBrokerIds: number[];
  selectedBidIds: number[];
};

export type AssignmentItem = {
  brokerId: number;
  propertyIds: number[];
};

export type AssignRequest = {
  assignments: AssignmentItem[];
};

export type AssignResponse = {
  auctionId: number;
  dealsCount: number;
  dealIds: number[];
};

export type { PaginatedResponse };
