import type { PaginatedResponse } from "./properties";

export type AuctionMode = "open" | "closed";

export type AuctionStatus =
  | "draft"
  | "active"
  | "finished"
  | "cancelled"
  | "scheduled"
  | "failed";

export type AuctionOwnerDecision = "pending" | "confirmed" | "rejected";

export type AuctionLotProperty = {
  id: number;
  reference_id: string;
  type: string;
  address: string;
  area: string;
  property_class: string;
  price: string | null;
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
  show_price_to_brokers: boolean;
  min_price: string | null;
  min_bid_increment: string | null;
  start_date: string;
  end_date: string;
  status: AuctionStatus;
  bids_count: number | null;
  current_price: string | null;
  highest_bid_id: number | null;
  winner_bid: {
    id: number;
    broker: { id: number; fullname: string };
    amount: string;
    is_sealed: boolean;
  } | null;
  lot_total_price: string | null;
  deals_created: boolean;
  has_failed_deal: boolean;
  owner_decision: AuctionOwnerDecision | null;
  owner_rejection_reason: string | null;
  owner_decided_at: string | null;
  // Populated by backend after /decline-result/ — IDs of bids that the owner already rejected as winner.
  declined_bids?: number[];
  created_at: string;
  updated_at: string;
};

export type ConfirmResultResponse = {
  auctionId: number;
  ownerDecision: "confirmed";
  createdDealIds: number[];
};

export type RejectResultRequest = {
  reason: string;
};

export type RejectResultResponse = {
  auctionId: number;
  status: "failed";
  ownerDecision: "rejected";
};

// --- Decline result (TZ 8.5) — skip current winner, try next candidate ---
export type DeclineResultRequest = {
  reason: string;
};

export type DeclineResultResponse = {
  auctionId: number;
  status: AuctionStatus;
  ownerDecision: AuctionOwnerDecision;
  auctionFailed: boolean;
  newWinnerBidId: number | null;
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
  show_price_to_brokers?: boolean;
  start_date?: string;
  end_date?: string;
  status?: AuctionStatus;
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

// Bids — first_name/last_name are present for owner/admin views and omitted
// when the backend serialises bids anonymously for brokers.
export type Bid = {
  id: number;
  auction_id: number;
  broker_id: number;
  amount: string;
  first_name?: string;
  last_name?: string;
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
  brokerId: number;
};

export type SelectWinnerResponse = {
  auctionId: number;
  selectedBrokerId: number;
  selectedBidId: number;
};

export type { PaginatedResponse };
