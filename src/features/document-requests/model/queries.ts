import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { documentRequestsService } from "@/entities/document-requests";
import type {
  CreateDocumentRequestPayload,
  UploadDocumentResponsePayload,
} from "@/shared/types/document-requests";

export const documentRequestKeys = {
  all: ["document-requests"] as const,
  byAuction: (auctionId: number) =>
    [...documentRequestKeys.all, "auction", auctionId] as const,
};

export function useAuctionDocumentRequests(
  auctionId: number,
  options?: { enabled?: boolean; refetchInterval?: number | false },
) {
  return useQuery({
    queryKey: documentRequestKeys.byAuction(auctionId),
    queryFn: () =>
      documentRequestsService
        .listByAuction(auctionId)
        .then((res) => res.data),
    enabled: (options?.enabled ?? true) && auctionId > 0,
    // Без WebSocket: polling 10s + рефетч при фокусе окна (дефолт React Query)
    // даёт "живое" обновление обеим сторонам (девелопер видит ответ брокера,
    // брокер видит новый запрос) без ручного refresh.
    refetchInterval: options?.refetchInterval ?? 10_000,
    refetchOnWindowFocus: true,
  });
}

export function useCreateDocumentRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      auctionId,
      data,
    }: {
      auctionId: number;
      data: CreateDocumentRequestPayload;
    }) =>
      documentRequestsService
        .create(auctionId, data)
        .then((res) => res.data),
    onSuccess: (_data, { auctionId }) => {
      queryClient.invalidateQueries({
        queryKey: documentRequestKeys.byAuction(auctionId),
      });
    },
  });
}

export function useUploadDocumentResponse() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      requestId,
      data,
    }: {
      requestId: number;
      data: UploadDocumentResponsePayload;
    }) =>
      documentRequestsService
        .uploadResponse(requestId, data)
        .then((res) => res.data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: documentRequestKeys.byAuction(data.auction),
      });
    },
  });
}
