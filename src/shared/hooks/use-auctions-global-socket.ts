'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useSessionStore } from '@/entities/auth/model/store';
import { auctionKeys } from '@/features/auctions/model/queries';
import type { AuctionStatus } from '@/shared/types/auctions';

/**
 * Read-only firehose for auction status flips across the platform.
 *
 * The backend group `auctions_global` receives every
 * `broadcast_auction_status(...)` call (scheduled→active,
 * active→finished, active→failed, etc.). Without this hook the
 * list/cards on /auctions, /cabinet, /objects only updated via the
 * 30 s react-query poll — the user had to reload to see a freshly
 * flipped status. Now any status change invalidates the list cache
 * within ~200 ms of the backend transition, with no per-card WS.
 *
 * Backend: apps/auctions/consumers.py#AuctionsGlobalConsumer
 *          apps/auctions/realtime.py#broadcast_auction_status
 */

type AuctionStatusChangedMsg = {
  type: 'auction_status_changed';
  auction: {
    id: number;
    status: AuctionStatus;
    updated_at: string;
  };
};

type GlobalWsMessage =
  | AuctionStatusChangedMsg
  | { type: 'error'; detail: string };

function getWsUrl(token: string | null): string {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? '';
  // https://backend.migntender.app/api/v1 → wss://backend.migntender.app
  const base = apiUrl.replace(/\/api\/v\d+\/?$/, '').replace(/^http/, 'ws');
  // Token is optional — the global consumer doesn't enforce auth — but we
  // pass it when available so any auth-aware proxy lets the upgrade through.
  return token ? `${base}/ws/auctions/?token=${token}` : `${base}/ws/auctions/`;
}

const RECONNECT_DELAYS = [1000, 2000, 5000, 10000, 30000];

export function useAuctionsGlobalSocket(enabled = true) {
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const reconnectCount = useRef(0);
  const queryClient = useQueryClient();

  const clearReconnect = useCallback(() => {
    if (reconnectTimer.current) {
      clearTimeout(reconnectTimer.current);
      reconnectTimer.current = null;
    }
  }, []);

  const connect = useCallback(() => {
    const token = useSessionStore.getState().accessToken ?? null;

    // Cleanup previous
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }

    const url = getWsUrl(token);
    const ws = new WebSocket(url);
    wsRef.current = ws;

    ws.onopen = () => {
      reconnectCount.current = 0;
    };

    ws.onmessage = (event) => {
      try {
        const msg: GlobalWsMessage = JSON.parse(event.data);

        if (msg.type !== 'auction_status_changed') return;

        const { id, status, updated_at } = msg.auction;

        // 1) Surgical patch — flip the status on every cached list entry
        //    that already contains this auction. Gives instant UI without
        //    waiting for the refetch round-trip.
        const listFilter = { queryKey: auctionKeys.all } as const;
        queryClient.setQueriesData<unknown>(listFilter, (old: unknown) => {
          if (!old || typeof old !== 'object') return old;

          // Paginated list shape: { results: Auction[], count, ... }
          if ('results' in old && Array.isArray((old as { results: unknown[] }).results)) {
            const o = old as { results: Array<{ id: number; status: AuctionStatus; updated_at: string } & Record<string, unknown>> };
            let touched = false;
            const results = o.results.map((a) => {
              if (a.id !== id) return a;
              touched = true;
              return { ...a, status, updated_at };
            });
            return touched ? { ...o, results } : old;
          }

          // Detail shape: { id, status, ... }
          if ('id' in old && (old as { id: number }).id === id && 'status' in old) {
            return { ...(old as Record<string, unknown>), status, updated_at };
          }

          return old;
        });

        // 2) Invalidate so an authoritative refetch reconciles the cache
        //    (status flip often comes with derived field changes like
        //    winner_bid, deals_created, has_failed_deal).
        queryClient.invalidateQueries({ queryKey: auctionKeys.all });
        // Properties may have flipped between blocking and free — refresh
        // the catalog/objects pages too.
        queryClient.invalidateQueries({ queryKey: ['properties'] });
      } catch {
        // ignore parse errors
      }
    };

    ws.onclose = (e) => {
      wsRef.current = null;

      // 1000 = normal close, don't reconnect
      if (e.code === 1000) return;

      if (reconnectCount.current >= RECONNECT_DELAYS.length) return;

      const delay = RECONNECT_DELAYS[reconnectCount.current];
      reconnectCount.current += 1;
      reconnectTimer.current = setTimeout(connect, delay);
    };

    ws.onerror = () => {
      // onclose will fire after onerror
    };
  }, [queryClient]);

  useEffect(() => {
    if (!enabled) return;

    connect();

    return () => {
      clearReconnect();
      if (wsRef.current) {
        wsRef.current.close(1000);
        wsRef.current = null;
      }
    };
  }, [connect, enabled, clearReconnect]);
}
