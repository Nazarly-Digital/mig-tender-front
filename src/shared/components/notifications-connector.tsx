'use client';

import { useNotificationsSocket } from '@/shared/hooks/use-notifications-socket';

/**
 * Headless component that opens the notifications WebSocket
 * when mounted inside an authenticated layout.
 */
export default function NotificationsConnector() {
  useNotificationsSocket();
  return null;
}
