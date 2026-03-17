'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import { useSessionStore } from '@/entities/auth/model/store';
import type {
  Bid,
  AuctionStatus,
  WsMessage,
} from '@/shared/types/auctions';

type AuctionSocketState = {
  connected: boolean;
  auctionData: {
    id: number;
    status: AuctionStatus;
    bids_count: number;
    current_price: string;
    highest_bid_id: number | null;
    min_price: string;
    start_date: string;
    end_date: string;
    owner_id: number;
    updated_at: string;
  } | null;
  bids: Bid[];
  participants: number[];
  error: string | null;
};

export function useAuctionSocket(auctionId: number | null) {
  const wsRef = useRef<WebSocket | null>(null);
  const accessToken = useSessionStore((s) => s.accessToken);

  const [state, setState] = useState<AuctionSocketState>({
    connected: false,
    auctionData: null,
    bids: [],
    participants: [],
    error: null,
  });

  // Normalize WS error detail
  const normalizeError = (detail: string | { detail: string }): string => {
    if (typeof detail === 'string') return detail;
    if (typeof detail === 'object' && 'detail' in detail) return detail.detail;
    return 'Неизвестная ошибка';
  };

  useEffect(() => {
    if (!auctionId || !accessToken) return;

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';
    const baseUrl = apiUrl.replace('/api/v1', '').replace('https://', 'wss://').replace('http://', 'ws://');
    const wsUrl = `${baseUrl}/ws/auctions/${auctionId}/?token=${accessToken}`;

    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      setState((prev) => ({ ...prev, connected: true, error: null }));
    };

    ws.onmessage = (event) => {
      const msg: WsMessage = JSON.parse(event.data);

      switch (msg.type) {
        case 'auction_snapshot':
          setState((prev) => ({
            ...prev,
            auctionData: {
              id: msg.auction.id,
              status: msg.auction.status,
              bids_count: msg.auction.bids_count,
              current_price: msg.auction.current_price,
              highest_bid_id: msg.auction.highest_bid_id,
              min_price: msg.auction.min_price,
              start_date: msg.auction.start_date,
              end_date: msg.auction.end_date,
              owner_id: msg.auction.owner_id,
              updated_at: msg.auction.updated_at,
            },
            bids: msg.bids,
          }));
          break;

        case 'participants_snapshot':
          setState((prev) => ({
            ...prev,
            participants: msg.participants,
          }));
          break;

        case 'bid_created':
          setState((prev) => ({
            ...prev,
            auctionData: prev.auctionData
              ? {
                  ...prev.auctionData,
                  bids_count: msg.auction.bids_count,
                  current_price: msg.auction.current_price,
                  highest_bid_id: msg.auction.highest_bid_id,
                  updated_at: msg.auction.updated_at,
                }
              : prev.auctionData,
            bids: [msg.bid, ...prev.bids],
            error: null,
          }));
          break;

        case 'participant_joined':
          setState((prev) => ({
            ...prev,
            participants: prev.participants.includes(msg.user_id)
              ? prev.participants
              : [...prev.participants, msg.user_id],
          }));
          break;

        case 'auction_updated':
          setState((prev) => ({
            ...prev,
            auctionData: prev.auctionData
              ? {
                  ...prev.auctionData,
                  ...(msg.status && { status: msg.status }),
                }
              : prev.auctionData,
          }));
          break;

        case 'error':
          setState((prev) => ({
            ...prev,
            error: normalizeError(msg.detail),
          }));
          break;
      }
    };

    ws.onclose = () => {
      setState((prev) => ({ ...prev, connected: false }));
    };

    ws.onerror = () => {
      setState((prev) => ({ ...prev, error: 'Ошибка подключения к WebSocket' }));
    };

    return () => {
      ws.close();
      wsRef.current = null;
    };
  }, [auctionId, accessToken]);

  const placeBid = useCallback((amount: string) => {
    const ws = wsRef.current;
    if (!ws || ws.readyState !== WebSocket.OPEN) return;
    setState((prev) => ({ ...prev, error: null }));
    ws.send(JSON.stringify({ type: 'bid', amount }));
  }, []);

  const clearError = useCallback(() => {
    setState((prev) => ({ ...prev, error: null }));
  }, []);

  return {
    ...state,
    placeBid,
    clearError,
  };
}
