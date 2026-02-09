import { useQuery } from "@tanstack/react-query";
import { auctionsService } from "@/entities/auctions";
import type { AuctionListParams } from "@/shared/types/auctions";

export const auctionKeys = {
  all: ["auctions"] as const,
  my: (params?: AuctionListParams) =>
    [...auctionKeys.all, "my", params] as const,
  lists: () => [...auctionKeys.all, "list"] as const,
  list: (params?: AuctionListParams) =>
    [...auctionKeys.lists(), params] as const,
  detail: (id: number) => [...auctionKeys.all, "detail", id] as const,
};

export function useMyAuctions(params?: AuctionListParams) {
  return useQuery({
    queryKey: auctionKeys.my(params),
    queryFn: () => auctionsService.getMy(params).then((res) => res.data),
  });
}

export function useAuctions(params?: AuctionListParams) {
  return useQuery({
    queryKey: auctionKeys.list(params),
    queryFn: () => auctionsService.getAll(params).then((res) => res.data),
  });
}
