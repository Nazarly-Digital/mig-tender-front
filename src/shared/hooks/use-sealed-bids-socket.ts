'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import { useSessionStore } from '@/entities/auth/model/store';

// --- Types ---

export type WsSealedBid = {
  id: number;
  auction_id: number;
  broker_id: number;
  amount: string;
  created_at: string;
};

export type WsSealedAuction = {
  id: number;
  bids_count: number;
  current_price: string;
  highest_bid_id: number | null;
  updated_at: string;
};

type WsSealedMessage =
  | { type: 'sealed_bids_snapshot'; auction: WsSealedAuction; bids: WsSealedBid[] }
  | { type: 'sealed_bid_changed'; action: 'created' | 'updated'; auction: WsSealedAuction; bid: WsSealedBid };

export type SealedBidsSocketState = {
  connected: boolean;
  auction: WsSealedAuction | null;
  bids: WsSealedBid[];
  error: string | null;
};

// --- Helpers ---

function getWsUrl(auctionId: number, token: string): string {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? '';
  const base = apiUrl.replace(/\/api\/v\d+\/?$/, '').replace(/^http/, 'ws');
  return `${base}/ws/auctions/${auctionId}/sealed-bids/?token=${token}`;
}

// --- Hook ---

const RECONNECT_DELAYS = [1000, 2000, 4000, 8000, 16000];

export function useSealedBidsSocket(auctionId: number, enabled = true) {
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const reconnectCount = useRef(0);

  const [state, setState] = useState<SealedBidsSocketState>({
    connected: false,
    auction: null,
    bids: [],
    error: null,
  });

  const connect = useCallback(() => {
    const token = useSessionStore.getState().accessToken;
    if (!token || !auctionId) return;

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
        const msg: WsSealedMessage = JSON.parse(event.data);

        switch (msg.type) {
          case 'sealed_bids_snapshot':
            setState((s) => ({
              ...s,
              auction: msg.auction,
              bids: msg.bids,
            }));
            break;

          case 'sealed_bid_changed': {
            setState((s) => {
              let updatedBids: WsSealedBid[];
              if (msg.action === 'created') {
                const exists = s.bids.some((b) => b.id === msg.bid.id);
                updatedBids = exists ? s.bids : [msg.bid, ...s.bids];
              } else {
                // updated
                updatedBids = s.bids.map((b) =>
                  b.id === msg.bid.id ? msg.bid : b,
                );
              }
              // Sort by amount desc, then created_at desc
              updatedBids.sort((a, b) => {
                const diff = parseFloat(b.amount) - parseFloat(a.amount);
                if (diff !== 0) return diff;
                return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
              });
              return {
                ...s,
                auction: msg.auction,
                bids: updatedBids,
              };
            });
            break;
          }
        }
      } catch {
        // ignore parse errors
      }
    };

    ws.onclose = (e) => {
      wsRef.current = null;
      setState((s) => ({ ...s, connected: false }));

      // Don't reconnect on auth/access/mode errors
      if (e.code === 4401 || e.code === 4403 || e.code === 4404 || e.code === 1000) {
        return;
      }

      if (reconnectCount.current >= RECONNECT_DELAYS.length) {
        setState((s) => ({ ...s, error: 'Не удалось подключиться' }));
        return;
      }

      const delay = RECONNECT_DELAYS[reconnectCount.current];
      reconnectCount.current += 1;
      reconnectTimer.current = setTimeout(connect, delay);
    };

    ws.onerror = () => {
      // onclose will fire after onerror
    };
  }, [auctionId]);

  useEffect(() => {
    if (!enabled) return;

    connect();

    return () => {
      if (reconnectTimer.current) clearTimeout(reconnectTimer.current);
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, [connect, enabled]);

  return state;
}
