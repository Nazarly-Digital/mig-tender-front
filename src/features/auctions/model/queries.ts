import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { auctionsService } from "@/entities/auctions";
import { propertyKeys } from "@/features/properties";
import { dealKeys } from "@/features/deals";
import { useSessionStore, isUserBroker } from "@/entities/auth/model/store";
import type {
  AuctionListParams,
  AuctionCreateRequest,
  AuctionPublishRequest,
  BidCreateRequest,
  BidUpdateRequest,
  ShortlistRequest,
  SelectWinnerRequest,
  RejectResultRequest,
  DeclineResultRequest,
  DistributeLotRequest,
} from "@/shared/types/auctions";

export const auctionKeys = {
  all: ["auctions"] as const,
  my: (params?: AuctionListParams) =>
    [...auctionKeys.all, "my", params] as const,
  participated: (params?: AuctionListParams) =>
    [...auctionKeys.all, "participated", params] as const,
  lists: () => [...auctionKeys.all, "list"] as const,
  list: (params?: AuctionListParams) =>
    [...auctionKeys.lists(), params] as const,
  detail: (id: number) => [...auctionKeys.all, "detail", id] as const,
  participants: (id: number) =>
    [...auctionKeys.all, "participants", id] as const,
  sealedBids: (id: number) =>
    [...auctionKeys.all, "sealed-bids", id] as const,
  compatibleProperties: (referenceId: string) =>
    [...auctionKeys.all, "compatible-properties", referenceId] as const,
};

// --- Auction CRUD ---

// Status transitions (scheduled → active → finished) happen on the backend
// via Celery beat. List endpoints don't push WebSocket events for that, so
// without polling the cards stay frozen on "Запланирован" / "Активный"
// past the actual state. Refetch every 30s while the tab is focused —
// cheap, gives near-real-time card status, no need to wire WS per card.
const AUCTION_LIST_POLL_MS = 30_000;

export function useMyAuctions(params?: AuctionListParams) {
  const isDeveloper = useSessionStore((s) => s.user?.role === "developer");

  return useQuery({
    queryKey: auctionKeys.my(params),
    queryFn: () => auctionsService.getMy(params).then((res) => res.data),
    enabled: isDeveloper,
    refetchInterval: AUCTION_LIST_POLL_MS,
    refetchIntervalInBackground: false,
  });
}

export function useAuctions(
  params?: AuctionListParams,
  options?: { enabled?: boolean },
) {
  return useQuery({
    queryKey: auctionKeys.list(params),
    queryFn: () => auctionsService.getAll(params).then((res) => res.data),
    enabled: options?.enabled ?? true,
    refetchInterval: AUCTION_LIST_POLL_MS,
    refetchIntervalInBackground: false,
  });
}

// Broker-only: auctions in which the current broker has placed bids.
// Backend: GET /auctions/participated/ — returns 403 for developers, 401 unauthenticated.
export function useParticipatedAuctions(params?: AuctionListParams) {
  const isBroker = useSessionStore((s) => isUserBroker(s.user));

  return useQuery({
    queryKey: auctionKeys.participated(params),
    queryFn: () =>
      auctionsService.getParticipated(params).then((res) => res.data),
    enabled: isBroker,
    refetchInterval: AUCTION_LIST_POLL_MS,
    refetchIntervalInBackground: false,
  });
}

export function useAuctionDetail(id: number) {
  return useQuery({
    queryKey: auctionKeys.detail(id),
    queryFn: () => auctionsService.getById(id).then((res) => res.data),
    enabled: id > 0,
    refetchInterval: 15_000,
  });
}

export function useCreateAuction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: AuctionCreateRequest) =>
      auctionsService.create(data).then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: auctionKeys.all });
      queryClient.invalidateQueries({ queryKey: propertyKeys.all });
    },
  });
}

// --- Participants ---

export function useParticipants(auctionId: number, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: auctionKeys.participants(auctionId),
    queryFn: () =>
      auctionsService.getParticipants(auctionId).then((res) => res.data),
    enabled: (options?.enabled ?? true) && auctionId > 0,
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
      // Just placed a bid — the broker is now a participant, so the
      // /auctions «Мои» tab needs to refetch or the auction won't show up
      // there until the next 30 s poll.
      queryClient.invalidateQueries({
        queryKey: [...auctionKeys.all, 'participated'],
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
      // Updating an existing bid keeps the broker in «Мои», but bid
      // count / status / current_price changed — refresh anyway.
      queryClient.invalidateQueries({
        queryKey: [...auctionKeys.all, 'participated'],
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

// POST /auctions/<id>/publish/ — owner promotes their DRAFT to SCHEDULED.
// Body is optional overrides; missing fields fall back to whatever the
// draft already has.
export function usePublishAuction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      auctionId,
      data,
    }: {
      auctionId: number;
      data: AuctionPublishRequest;
    }) => auctionsService.publish(auctionId, data).then((res) => res.data),
    onSuccess: (_data, { auctionId }) => {
      queryClient.invalidateQueries({
        queryKey: auctionKeys.detail(auctionId),
      });
      // Status flipped draft → scheduled — every list (my / catalog /
      // participated) needs to refresh and the property catalog might
      // have flipped between blocking and free.
      queryClient.invalidateQueries({ queryKey: auctionKeys.all });
      queryClient.invalidateQueries({ queryKey: propertyKeys.all });
    },
  });
}

export function useCancelAuction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (auctionId: number) =>
      auctionsService.cancel(auctionId).then((res) => res.data),
    onSuccess: (_data, auctionId) => {
      queryClient.invalidateQueries({
        queryKey: auctionKeys.detail(auctionId),
      });
      queryClient.invalidateQueries({ queryKey: auctionKeys.all });
    },
  });
}

export function useCompatibleProperties(referenceId: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: auctionKeys.compatibleProperties(referenceId),
    queryFn: () =>
      auctionsService.getCompatibleProperties(referenceId).then((res) => res.data.results),
    enabled: (options?.enabled ?? true) && !!referenceId,
  });
}

// --- Owner decision (confirm / reject result) ---

export function useConfirmResult() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (auctionId: number) =>
      auctionsService.confirmResult(auctionId).then((res) => res.data),
    onSuccess: (_data, auctionId) => {
      queryClient.invalidateQueries({ queryKey: auctionKeys.detail(auctionId) });
      queryClient.invalidateQueries({ queryKey: auctionKeys.all });
    },
  });
}

export function useRejectResult() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ auctionId, data }: { auctionId: number; data: RejectResultRequest }) =>
      auctionsService.rejectResult(auctionId, data).then((res) => res.data),
    onSuccess: (_data, { auctionId }) => {
      queryClient.invalidateQueries({ queryKey: auctionKeys.detail(auctionId) });
      queryClient.invalidateQueries({ queryKey: auctionKeys.all });
    },
  });
}

// distribute-lot убран в ТЗ от 2026-05-14 — лот целиком получает
// один победитель, ручное распределение между несколькими брокерами
// больше не применяется.

// TZ 8.5 — decline current winner; backend auto-picks next candidate or fails the auction if queue is empty.
// The Deal (if it existed) transitions to 'declined'; a new Deal is NOT auto-created — owner must
// call /confirm-result/ again on the promoted winner.
export function useDeclineResult() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ auctionId, data }: { auctionId: number; data: DeclineResultRequest }) =>
      auctionsService.declineResult(auctionId, data).then((res) => res.data),
    onSuccess: (_data, { auctionId }) => {
      queryClient.invalidateQueries({ queryKey: auctionKeys.detail(auctionId) });
      queryClient.invalidateQueries({ queryKey: auctionKeys.all });
      // Deals might transition to `declined` after this — refresh deal lists everywhere.
      queryClient.invalidateQueries({ queryKey: dealKeys.all });
    },
  });
}
