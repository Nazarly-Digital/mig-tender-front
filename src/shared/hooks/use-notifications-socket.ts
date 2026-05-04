'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useSessionStore } from '@/entities/auth/model/store';
import { useNotificationsStore } from '@/entities/notifications';
import type { NotificationItem, NotificationWsMessage } from '@/shared/types/notifications';

function getWsUrl(token: string): string {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? '';
  const base = apiUrl.replace(/\/api\/v\d+\/?$/, '').replace(/^http/, 'ws');
  return `${base}/ws/notifications/?token=${token}`;
}

const RECONNECT_DELAYS = [1000, 2000, 5000, 10000];
const PING_INTERVAL = 30000;

// Invalidate domain-specific query caches when a notification implies fresh
// data (e.g. auction status changed) is needed. This keeps lists / cards in
// sync without each page having to subscribe to its own websocket.
function invalidateForNotification(qc: ReturnType<typeof useQueryClient>, n: NotificationItem) {
  switch (n.category) {
    case 'auction':
      qc.invalidateQueries({ queryKey: ['auctions'] });
      qc.invalidateQueries({ queryKey: ['auction'] });
      break;
    case 'deal':
      qc.invalidateQueries({ queryKey: ['deals'] });
      break;
    case 'payment':
      qc.invalidateQueries({ queryKey: ['settlements'] });
      qc.invalidateQueries({ queryKey: ['payments'] });
      break;
    case 'property':
      qc.invalidateQueries({ queryKey: ['properties'] });
      qc.invalidateQueries({ queryKey: ['admin', 'pending-properties'] });
      break;
    case 'user':
      qc.invalidateQueries({ queryKey: ['admin'] });
      break;
  }
}

export function useNotificationsSocket(enabled = true) {
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pingTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const reconnectCount = useRef(0);
  const queryClient = useQueryClient();

  const store = useNotificationsStore;

  const clearTimers = useCallback(() => {
    if (reconnectTimer.current) {
      clearTimeout(reconnectTimer.current);
      reconnectTimer.current = null;
    }
    if (pingTimer.current) {
      clearInterval(pingTimer.current);
      pingTimer.current = null;
    }
  }, []);

  const connect = useCallback(() => {
    const token = useSessionStore.getState().accessToken;
    if (!token) return;

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
      store.getState().setConnected(true);

      // Start ping heartbeat
      pingTimer.current = setInterval(() => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({ type: 'ping' }));
        }
      }, PING_INTERVAL);
    };

    ws.onmessage = (event) => {
      try {
        const msg: NotificationWsMessage = JSON.parse(event.data);
        const state = store.getState();

        switch (msg.type) {
          case 'notifications_snapshot':
            state.setSnapshot(msg.notifications, msg.unread_count);
            break;

          case 'notification_created':
            state.addNotification(msg.notification, msg.unread_count);
            invalidateForNotification(queryClient, msg.notification);
            break;

          case 'notification_read':
            state.markRead(msg.notification_id, msg.read_at, msg.unread_count);
            break;

          case 'notifications_read_all':
            state.markAllRead(msg.notification_ids, msg.read_at, msg.unread_count);
            break;

          case 'pong':
            break;

          case 'error':
            break;
        }
      } catch {
        // ignore parse errors
      }
    };

    ws.onclose = (e) => {
      wsRef.current = null;
      store.getState().setConnected(false);
      clearTimers();

      // 4401 = not authenticated — refresh token and reconnect
      if (e.code === 4401) {
        reconnectTimer.current = setTimeout(connect, 2000);
        return;
      }

      // 1000 = normal close, don't reconnect
      if (e.code === 1000) return;

      // Auto-reconnect with backoff
      if (reconnectCount.current >= RECONNECT_DELAYS.length) return;

      const delay = RECONNECT_DELAYS[reconnectCount.current];
      reconnectCount.current += 1;
      reconnectTimer.current = setTimeout(connect, delay);
    };

    ws.onerror = () => {
      // onclose will fire after onerror
    };
  }, [store, clearTimers, queryClient]);

  // Send mark_read via WebSocket
  const markRead = useCallback((notificationId: number) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(
        JSON.stringify({ type: 'mark_read', notification_id: notificationId }),
      );
    }
  }, []);

  // Send mark_all_read via WebSocket
  const markAllRead = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'mark_all_read' }));
    }
  }, []);

  // Connect/disconnect
  useEffect(() => {
    if (!enabled) return;

    connect();

    return () => {
      clearTimers();
      if (wsRef.current) {
        wsRef.current.close(1000);
        wsRef.current = null;
      }
      store.getState().setConnected(false);
    };
  }, [connect, enabled, clearTimers, store]);

  return { markRead, markAllRead };
}
