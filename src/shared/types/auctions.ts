import type { PropertyType, PropertyClass, PaginatedResponse } from './properties';

export type AuctionStatus = 'active' | 'completed';

export type Auction = {
  id: number;
  property: {
    id: number;
    address: string;
    type: PropertyType;
    property_class: PropertyClass;
    area: string;
    rooms: number | null;
  };
  status: AuctionStatus;
  min_price: string;
  current_max_bid: string | null;
  bids_count: number;
  currency: string;
  end_date: string;
  created_at: string;
  updated_at: string;
};

export type AuctionListParams = {
  status?: AuctionStatus;
  ordering?: string;
  page?: number;
  page_size?: number;
};

export type { PaginatedResponse };
