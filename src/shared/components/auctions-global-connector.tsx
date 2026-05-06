'use client';

import { useAuctionsGlobalSocket } from '@/shared/hooks/use-auctions-global-socket';

/**
 * Headless component that opens the global auctions WebSocket
 * when mounted inside an authenticated layout. The hook listens
 * for status flips (scheduled→active, active→finished, etc.)
 * and invalidates the auction list/detail react-query caches so
 * cards on /auctions, /cabinet, /objects update without a reload.
 */
export default function AuctionsGlobalConnector() {
  useAuctionsGlobalSocket();
  return null;
}
