import { apiInstance } from '@/shared/api';
import type { NotificationItem } from '@/shared/types/notifications';

export const notificationsService = {
  getAll: () =>
    apiInstance.get<NotificationItem[]>('/notifications/'),

  getUnreadCount: () =>
    apiInstance.get<{ unread_count: number }>('/notifications/unread-count/'),

  markRead: (notificationId: number) =>
    apiInstance.patch<{ detail: string }>('/notifications/mark-read/', {
      notification_id: notificationId,
    }),

  markAllRead: () =>
    apiInstance.patch<{ notification_ids: number[] }>('/notifications/mark-all-read/'),
};
