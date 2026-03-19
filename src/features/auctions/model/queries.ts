import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { auctionsService } from "@/entities/auctions";
import { useSessionStore } from "@/entities/auth/model/store";
import type {
  AuctionListParams,
  AuctionCreateRequest,
  BidCreateRequest,
  BidUpdateRequest,
  ShortlistRequest,
  SelectWinnerRequest,
} from "@/shared/types/auctions";

export const auctionKeys = {
  all: ["auctions"] as const,
  my: (params?: AuctionListParams) =>
    [...auctionKeys.all, "my", params] as const,
  lists: () => [...auctionKeys.all, "list"] as const,
  list: (params?: AuctionListParams) =>
    [...auctionKeys.lists(), params] as const,
  detail: (id: number) => [...auctionKeys.all, "detail", id] as const,
  participants: (id: number) =>
    [...auctionKeys.all, "participants", id] as const,
  sealedBids: (id: number) =>
    [...auctionKeys.all, "sealed-bids", id] as const,
};

// --- Auction CRUD ---

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

export function useAuctionDetail(id: number) {
  return useQuery({
    queryKey: auctionKeys.detail(id),
    queryFn: () => auctionsService.getById(id).then((res) => res.data),
    enabled: id > 0,
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

// --- Participants ---

export function useParticipants(auctionId: number) {
  return useQuery({
    queryKey: auctionKeys.participants(auctionId),
    queryFn: () =>
      auctionsService.getParticipants(auctionId).then((res) => res.data),
    enabled: auctionId > 0,
  });
}

export function useJoinAuction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (auctionId: number) =>
      auctionsService.join(auctionId).then((res) => res.data),
    onSuccess: (_data, auctionId) => {
      queryClient.invalidateQueries({
        queryKey: auctionKeys.participants(auctionId),
      });
      queryClient.invalidateQueries({
        queryKey: auctionKeys.detail(auctionId),
      });
    },
  });
}

// --- Bids ---

export function useSealedBids(auctionId: number, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: auctionKeys.sealedBids(auctionId),
    queryFn: () =>
      auctionsService.getSealedBids(auctionId).then((res) => res.data),
    enabled: (options?.enabled ?? true) && auctionId > 0,
  });
}

export function usePlaceBid() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      auctionId,
      data,
    }: {
      auctionId: number;
      data: BidCreateRequest;
    }) => auctionsService.placeBid(auctionId, data).then((res) => res.data),
    onSuccess: (_data, { auctionId }) => {
      queryClient.invalidateQueries({
        queryKey: auctionKeys.sealedBids(auctionId),
      });
      queryClient.invalidateQueries({
        queryKey: auctionKeys.detail(auctionId),
      });
    },
  });
}

export function useUpdateBid() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      auctionId,
      data,
    }: {
      auctionId: number;
      data: BidUpdateRequest;
    }) => auctionsService.updateBid(auctionId, data).then((res) => res.data),
    onSuccess: (_data, { auctionId }) => {
      queryClient.invalidateQueries({
        queryKey: auctionKeys.sealedBids(auctionId),
      });
      queryClient.invalidateQueries({
        queryKey: auctionKeys.detail(auctionId),
      });
    },
  });
}

// --- Closed flow ---

export function useShortlist() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      auctionId,
      data,
    }: {
      auctionId: number;
      data: ShortlistRequest;
    }) => auctionsService.shortlist(auctionId, data).then((res) => res.data),
    onSuccess: (_data, { auctionId }) => {
      queryClient.invalidateQueries({
        queryKey: auctionKeys.detail(auctionId),
      });
    },
  });
}

export function useSelectWinner() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      auctionId,
      data,
    }: {
      auctionId: number;
      data: SelectWinnerRequest;
    }) =>
      auctionsService.selectWinner(auctionId, data).then((res) => res.data),
    onSuccess: (_data, { auctionId }) => {
      queryClient.invalidateQueries({
        queryKey: auctionKeys.detail(auctionId),
      });
      queryClient.invalidateQueries({ queryKey: auctionKeys.all });
    },
  });
}
