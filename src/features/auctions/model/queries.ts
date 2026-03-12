import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { auctionsService } from "@/entities/auctions";
import { useSessionStore } from "@/entities/auth/model/store";
import type { AuctionListParams, AuctionCreateRequest } from "@/shared/types/auctions";

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
  const isDeveloper = useSessionStore((s) => s.user?.role === "developer");

  return useQuery({
    queryKey: auctionKeys.my(params),
    queryFn: () => auctionsService.getMy(params).then((res) => res.data),
    enabled: isDeveloper,
  });
}

export function useAuctions(params?: AuctionListParams) {
  return useQuery({
    queryKey: auctionKeys.list(params),
    queryFn: () => auctionsService.getAll(params).then((res) => res.data),
  });
}

export function useCreateAuction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: AuctionCreateRequest) =>
      auctionsService.create(data).then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: auctionKeys.all });
    },
  });
}
