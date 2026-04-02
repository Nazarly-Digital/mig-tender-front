import { apiInstance } from "@/shared/api";
import type {
  Auction,
  AuctionDetail,
  AuctionCreateRequest,
  AuctionListParams,
  PaginatedResponse,
  JoinAuctionResponse,
  Bid,
  BidCreateRequest,
  BidUpdateRequest,
  ShortlistRequest,
  ShortlistResponse,
  SelectWinnerRequest,
  SelectWinnerResponse,
  AssignRequest,
  AssignResponse,
  AuctionLotProperty,
} from "@/shared/types/auctions";

export const auctionsService = {
  getMy: (params?: AuctionListParams) =>
    apiInstance.get<PaginatedResponse<Auction>>("/auctions/my/", { params }),

  getAll: (params?: AuctionListParams) =>
    apiInstance.get<PaginatedResponse<Auction>>("/auctions/", { params }),

  getById: (id: number) =>
    apiInstance.get<AuctionDetail>(`/auctions/${id}/`),

  create: (data: AuctionCreateRequest) =>
    apiInstance.post<AuctionDetail>("/auctions/", data),

  cancel: (auctionId: number) =>
    apiInstance.delete(`/auctions/${auctionId}/cancel/`),

  // Participants
  join: (auctionId: number) =>
    apiInstance.post<JoinAuctionResponse>(`/auctions/${auctionId}/join/`),

  getParticipants: (auctionId: number) =>
    apiInstance.get<{ auction_id: number; participants: number[] }>(`/auctions/${auctionId}/participants/`),

  // Bids
  placeBid: (auctionId: number, data: BidCreateRequest) =>
    apiInstance.post<Bid>(`/auctions/${auctionId}/bid/`, data),

  updateBid: (auctionId: number, data: BidUpdateRequest) =>
    apiInstance.patch<Bid>(`/auctions/${auctionId}/bid/update/`, data),

  getSealedBids: (auctionId: number) =>
    apiInstance.get<Bid[]>(`/auctions/${auctionId}/sealed-bids/`),

  // Closed flow
  shortlist: (auctionId: number, data: ShortlistRequest) =>
    apiInstance.post<ShortlistResponse>(`/auctions/${auctionId}/shortlist/`, data),

  selectWinner: (auctionId: number, data: SelectWinnerRequest) =>
    apiInstance.post<SelectWinnerResponse>(`/auctions/${auctionId}/select-winner/`, data),

  assign: (auctionId: number, data: AssignRequest) =>
    apiInstance.post<AssignResponse>(`/auctions/${auctionId}/assign/`, data),

  // Compatible properties for lot
  getCompatibleProperties: (referenceId: number) =>
    apiInstance.get<AuctionLotProperty[]>("/properties/compatible/", {
      params: { reference_id: referenceId },
    }),
};
