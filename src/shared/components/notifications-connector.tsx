'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { useNotificationsSocket } from '@/shared/hooks/use-notifications-socket';
import { useNotificationsStore } from '@/entities/notifications';
import { getNotificationRoute } from '@/shared/lib/notification-route';
import { useSessionStore } from '@/entities/auth/model/store';

/**
 * Headless component that opens the notifications WebSocket
 * when mounted inside an authenticated layout.
 *
 * Also auto-marks unread notifications as read once the user navigates
 * to the page they point to (so the unread counter stays in sync without
 * requiring an explicit click in the drawer).
 */
export default function NotificationsConnector() {
  const { markRead } = useNotificationsSocket();
  const pathname = usePathname();
  const items = useNotificationsStore((s) => s.items);
  const isConnected = useNotificationsStore((s) => s.isConnected);
  const userRole = useSessionStore((s) => s.user?.role);

  // Track which IDs we've already requested to mark read in this session,
  // so that the optimistic-then-server-confirm window doesn't trigger
  // duplicate sends if the effect re-runs before the store updates.
  const sentRef = useRef<Set<number>>(new Set());

  useEffect(() => {
    if (!pathname || !isConnected) return;
    for (const n of items) {
      if (n.is_read) continue;
      if (sentRef.current.has(n.id)) continue;
      const route = getNotificationRoute(n, userRole);
      if (route && pathname === route) {
        sentRef.current.add(n.id);
        markRead(n.id);
      }
    }
  }, [pathname, items, isConnected, markRead, userRole]);

  return null;
}
