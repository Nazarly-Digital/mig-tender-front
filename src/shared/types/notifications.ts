export type NotificationCategory =
  | 'system'
  | 'user'
  | 'property'
  | 'auction'
  | 'deal'
  | 'payment';

export type NotificationEventType =
  // User / Property
  | 'new_broker_registered'
  | 'new_property_pending'
  // Auction
  | 'auction_won'
  | 'auction_not_selected'
  | 'auction_finished_open'
  | 'auction_finished_closed'
  | 'auction_result_confirmed'
  | 'auction_result_rejected'
  | 'auction_winner_declined'
  | 'auction_winner_promoted'
  | 'documents_requested'
  | 'documents_request_answered'
  // Deal / Deadline / Review
  | 'documents_deadline_3d'
  | 'documents_deadline_1d'
  | 'obligation_overdue'
  | 'deal_submitted_for_review'
  | 'admin_approved'
  | 'developer_needs_confirm'
  | 'admin_rejected'
  | 'developer_confirm_reminder'
  | 'developer_confirmed'
  | 'developer_rejected'
  | 'deal_failed'
  // Payment
  | 'payout_created'
  | 'payout_paid'
  // Daily summaries
  | 'daily_deals_summary'
  | 'daily_payments_summary';

export interface NotificationItem {
  id: number;
  category: NotificationCategory;
  event_type: NotificationEventType;
  title: string;
  message: string;
  data: Record<string, unknown>;
  auction_id: number | null;
  deal_id: number | null;
  payment_id: number | null;
  real_property_id: number | null;
  is_read: boolean;
  read_at: string | null;
  created_at: string;
}

// WebSocket messages from server
export type NotificationWsMessage =
  | {
      type: 'notifications_snapshot';
      notifications: NotificationItem[];
      unread_count: number;
    }
  | {
      type: 'notification_created';
      notification: NotificationItem;
      unread_count: number;
    }
  | {
      type: 'notification_read';
      notification_id: number;
      read_at: string;
      unread_count: number;
    }
  | {
      type: 'notifications_read_all';
      notification_ids: number[];
      read_at: string;
      unread_count: number;
    }
  | { type: 'pong' }
  | { type: 'error'; detail: string };
