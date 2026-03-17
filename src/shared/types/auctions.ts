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

export type Bid = {
  id: number;
  auction: number;
  broker: number;
  amount: string;
  created_at: string;
};

export type AuctionDetail = Auction & {
  bids: Bid[];
};

// WebSocket message types
export type WsAuctionSnapshot = {
  type: 'auction_snapshot';
  auction: {
    id: number;
    mode: AuctionMode;
    status: AuctionStatus;
    min_price: string;
    start_date: string;
    end_date: string;
    bids_count: number;
    current_price: string;
    highest_bid_id: number | null;
    owner_id: number;
    updated_at: string;
  };
  bids: Bid[];
};

export type WsParticipantsSnapshot = {
  type: 'participants_snapshot';
  participants: number[];
};

export type WsBidCreated = {
  type: 'bid_created';
  auction: {
    id: number;
    bids_count: number;
    current_price: string;
    highest_bid_id: number;
    updated_at: string;
  };
  bid: Bid;
};

export type WsParticipantJoined = {
  type: 'participant_joined';
  auction_id: number;
  user_id: number;
  participants_count: number;
};

export type WsAuctionUpdated = {
  type: 'auction_updated';
  status?: AuctionStatus;
  winner_bid_id?: number;
  [key: string]: unknown;
};

export type WsError = {
  type: 'error';
  detail: string | { detail: string };
};

export type WsMessage =
  | WsAuctionSnapshot
  | WsParticipantsSnapshot
  | WsBidCreated
  | WsParticipantJoined
  | WsAuctionUpdated
  | WsError;

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
