import { apiInstance } from "@/shared/api";
import type {
  Auction,
  AuctionDetail,
  AuctionCreateRequest,
  AuctionListParams,
  PaginatedResponse,
  Bid,
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

  join: (id: number) =>
    apiInstance.post(`/auctions/${id}/join/`),

  getParticipants: (id: number) =>
    apiInstance.get<number[]>(`/auctions/${id}/participants/`),

  placeBid: (id: number, amount: string) =>
    apiInstance.post<Bid>(`/auctions/${id}/bid/`, { amount }),

  updateBid: (id: number, amount: string) =>
    apiInstance.patch<Bid>(`/auctions/${id}/bid/update/`, { amount }),

  getSealedBids: (id: number) =>
    apiInstance.get<Bid[]>(`/auctions/${id}/sealed-bids/`),

  setShortlist: (id: number, bidIds: number[]) =>
    apiInstance.post(`/auctions/${id}/shortlist/`, { bid_ids: bidIds }),

  selectWinner: (id: number, bidId: number) =>
    apiInstance.post(`/auctions/${id}/select-winner/`, { bid_id: bidId }),

  cancel: (id: number) =>
    apiInstance.delete(`/auctions/${id}/cancel/`),
};
