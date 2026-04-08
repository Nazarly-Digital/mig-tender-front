import { create } from 'zustand';
import type { NotificationItem } from '@/shared/types/notifications';

type NotificationsState = {
  items: NotificationItem[];
  unreadCount: number;
  isConnected: boolean;
};

type NotificationsActions = {
  setSnapshot: (items: NotificationItem[], unreadCount: number) => void;
  addNotification: (notification: NotificationItem, unreadCount: number) => void;
  markRead: (notificationId: number, readAt: string, unreadCount: number) => void;
  markAllRead: (notificationIds: number[], readAt: string, unreadCount: number) => void;
  setConnected: (connected: boolean) => void;
  setUnreadCount: (count: number) => void;
  reset: () => void;
};

const initialState: NotificationsState = {
  items: [],
  unreadCount: 0,
  isConnected: false,
};

export const useNotificationsStore = create<NotificationsState & NotificationsActions>()(
  (set) => ({
    ...initialState,

    setSnapshot: (items, unreadCount) =>
      set({ items, unreadCount }),

    addNotification: (notification, unreadCount) =>
      set((state) => {
        // Dedupe by id
        if (state.items.some((n) => n.id === notification.id)) {
          return { unreadCount };
        }
        return {
          items: [notification, ...state.items],
          unreadCount,
        };
      }),

    markRead: (notificationId, readAt, unreadCount) =>
      set((state) => ({
        items: state.items.map((n) =>
          n.id === notificationId ? { ...n, is_read: true, read_at: readAt } : n,
        ),
        unreadCount,
      })),

    markAllRead: (notificationIds, readAt, unreadCount) =>
      set((state) => {
        const idsSet = new Set(notificationIds);
        return {
          items: state.items.map((n) =>
            idsSet.has(n.id) ? { ...n, is_read: true, read_at: readAt } : n,
          ),
          unreadCount,
        };
      }),

    setConnected: (connected) => set({ isConnected: connected }),

    setUnreadCount: (count) => set({ unreadCount: count }),

    reset: () => set(initialState),
  }),
);
