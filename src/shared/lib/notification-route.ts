import type { NotificationItem } from '@/shared/types/notifications';

export function getNotificationRoute(n: NotificationItem): string | null {
  switch (n.category) {
    case 'auction':
      return n.auction_id ? `/auctions/${n.auction_id}` : '/auctions';
    case 'deal':
      return '/deals';
    case 'payment':
      return '/payments';
    case 'property':
      return n.real_property_id ? `/properties/${n.real_property_id}` : '/properties';
    case 'user':
      return '/admin/users';
    default:
      return null;
  }
}
