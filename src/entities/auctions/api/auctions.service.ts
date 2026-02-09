import { apiInstance } from "@/shared/api";
import type {
  Auction,
  AuctionListParams,
  PaginatedResponse,
} from "@/shared/types/auctions";

export const auctionsService = {
  getMy: (params?: AuctionListParams) =>
    apiInstance.get<PaginatedResponse<Auction>>("/auctions/my/", { params }),

  getAll: (params?: AuctionListParams) =>
    apiInstance.get<PaginatedResponse<Auction>>("/auctions/", { params }),

  getById: (id: number) =>
    apiInstance.get<Auction>(`/auctions/${id}/`),
};
