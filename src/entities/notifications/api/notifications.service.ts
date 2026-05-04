import { apiInstance } from '@/shared/api';
import type { NotificationItem } from '@/shared/types/notifications';
import type { PaginatedResponse } from '@/shared/types/properties';

export type NotificationListParams = {
  page?: number;
  page_size?: number;
  is_read?: boolean;
  category?: string;
};

export const notificationsService = {
  getAll: (params?: NotificationListParams) =>
    apiInstance.get<PaginatedResponse<NotificationItem>>('/notifications/', { params }),

  getUnreadCount: () =>
    apiInstance.get<{ unread_count: number }>('/notifications/unread-count/'),

  markRead: (notificationId: number) =>
    apiInstance.patch<{ detail: string }>('/notifications/mark-read/', {
      notification_id: notificationId,
    }),

  markAllRead: () =>
    apiInstance.patch<{ notification_ids: number[] }>('/notifications/mark-all-read/'),
};
