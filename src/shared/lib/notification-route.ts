import type { NotificationItem } from '@/shared/types/notifications';

export function getNotificationRoute(
  n: NotificationItem,
  recipientRole?: string,
): string | null {
  switch (n.category) {
    case 'auction':
      return n.auction_id ? `/auctions/${n.auction_id}` : '/auctions';
    case 'deal':
      return '/deals';
    case 'payment':
      return '/payments';
    case 'property':
      // Admins get «новый объект на модерации» — отправлять их на
      // /properties/{id} (страницу редактирования девелопера) бесполезно:
      // у админа там нет прав сохранять, любая правка возвращает 500.
      // Их место — очередь модерации.
      if (recipientRole === 'admin') return '/admin/properties';
      return n.real_property_id ? `/properties/${n.real_property_id}` : '/properties';
    case 'user':
      return recipientRole === 'admin' ? '/admin/users' : '/cabinet';
    default:
      return null;
  }
}
