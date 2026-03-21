'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import { useSessionStore } from '@/entities/auth/model/store';

// --- Types ---

export type WsBid = {
  id: number;
  auction: number;
  broker: number;
  amount: string;
  created_at: string;
};

export type WsAuctionSnapshot = {
  id: number;
  mode: string;
  status: string;
  min_price: string;
  start_date: string;
  end_date: string;
  bids_count: number;
  current_price: string;
  highest_bid_id: number | null;
  owner_id: number;
  updated_at: string;
};

export type WsMessage =
  | { type: 'auction_snapshot'; auction: WsAuctionSnapshot; bids: WsBid[] }
  | { type: 'participants_snapshot'; participants: number[] }
  | { type: 'bid_created'; auction: Partial<WsAuctionSnapshot>; bid: WsBid }
  | { type: 'participant_joined'; auction_id: number; user_id: number; participants_count: number }
  | { type: 'auction_updated'; [key: string]: unknown }
  | { type: 'error'; detail: string | { detail: string } };

export type AuctionSocketState = {
  connected: boolean;
  auction: WsAuctionSnapshot | null;
  bids: WsBid[];
  participants: number[];
  error: string | null;
};

// --- Helpers ---

function getWsUrl(auctionId: number, token: string): string {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? '';
  // https://backend.migntender.app/api/v1 → wss://backend.migntender.app
  const base = apiUrl.replace(/\/api\/v\d+\/?$/, '').replace(/^http/, 'ws');
  return `${base}/ws/auctions/${auctionId}/?token=${token}`;
}

function normalizeError(detail: string | { detail: string } | unknown): string {
  if (typeof detail === 'string') return detail;
  if (typeof detail === 'object' && detail !== null && 'detail' in detail) {
    return String((detail as { detail: string }).detail);
  }
  return 'Неизвестная ошибка';
}

// --- Hook ---

const RECONNECT_DELAYS = [1000, 2000, 4000, 8000, 16000];

export function useAuctionSocket(auctionId: number, enabled = true) {
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimer = useRef<ReturnType<typeof setTimeout>>();
  const reconnectCount = useRef(0);

  const [state, setState] = useState<AuctionSocketState>({
    connected: false,
    auction: null,
    bids: [],
    participants: [],
    error: null,
  });

  const connect = useCallback(() => {
    const token = useSessionStore.getState().accessToken;
    if (!token || !auctionId) return;

    // Cleanup previous
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }

    const url = getWsUrl(auctionId, token);
    const ws = new WebSocket(url);
    wsRef.current = ws;

    ws.onopen = () => {
      reconnectCount.current = 0;
      setState((s) => ({ ...s, connected: true, error: null }));
    };

    ws.onmessage = (event) => {
      try {
        const msg: WsMessage = JSON.parse(event.data);

        switch (msg.type) {
          case 'auction_snapshot':
            setState((s) => ({
              ...s,
              auction: msg.auction,
              bids: msg.bids,
            }));
            break;

          case 'participants_snapshot':
            setState((s) => ({
              ...s,
              participants: msg.participants,
            }));
            break;

          case 'bid_created':
            setState((s) => {
              const exists = s.bids.some((b) => b.id === msg.bid.id);
              return {
                ...s,
                auction: s.auction ? { ...s.auction, ...msg.auction } : s.auction,
                bids: exists ? s.bids : [msg.bid, ...s.bids].slice(0, 50),
              };
            });
            break;

          case 'participant_joined':
            setState((s) => ({
              ...s,
              participants: s.participants.includes(msg.user_id)
                ? s.participants
                : [...s.participants, msg.user_id],
            }));
            break;

          case 'auction_updated':
            setState((s) => ({
              ...s,
              auction: s.auction
                ? { ...s.auction, ...(msg as Record<string, unknown>) }
                : s.auction,
            }));
            break;

          case 'error':
            setState((s) => ({ ...s, error: normalizeError(msg.detail) }));
            break;
        }
      } catch {
        // ignore parse errors
      }
    };

    ws.onclose = (e) => {
      wsRef.current = null;
      setState((s) => ({ ...s, connected: false }));

      if (typeof window !== 'undefined') {
        // eslint-disable-next-line no-console
        console.log(`[WS] closed: code=${e.code} reason="${e.reason}"`);
      }

      // 4403 = not OPEN auction, don't reconnect
      if (e.code === 4403) {
        setState((s) => ({ ...s, error: 'Аукцион не является открытым' }));
        return;
      }

      // 1000 = normal close, don't reconnect
      if (e.code === 1000) return;

      // Stop reconnecting after too many attempts
      if (reconnectCount.current >= RECONNECT_DELAYS.length) {
        setState((s) => ({ ...s, error: 'Не удалось подключиться к аукциону' }));
        return;
      }

      // Auto-reconnect with backoff
      const delay = RECONNECT_DELAYS[reconnectCount.current];
      reconnectCount.current += 1;
      reconnectTimer.current = setTimeout(connect, delay);
    };

    ws.onerror = () => {
      // onclose will fire after onerror
    };
  }, [auctionId]);

  // Send bid
  const sendBid = useCallback((amount: string) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'bid', amount }));
    }
  }, []);

  // Connect/disconnect
  useEffect(() => {
    if (!enabled) return;

    connect();

    return () => {
      clearTimeout(reconnectTimer.current);
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, [connect, enabled]);

  return { ...state, sendBid };
}
