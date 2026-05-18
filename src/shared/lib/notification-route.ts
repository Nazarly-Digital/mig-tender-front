import type { NotificationItem } from '@/shared/types/notifications';

export function getNotificationRoute(
  n: NotificationItem,
  recipientRole?: string,
): string | null {
  switch (n.category) {
    case 'auction':
      // ТЗ от 2026-05-15 — если по аукциону уже создана сделка
      // (deal_id), прыгаем сразу в неё с якорем (#deal-N) на
      // конкретную карточку. Это про уведомления «Вы победили…
      // загрузите документы…» — раньше они вели в аукцион,
      // откуда юзер вручную лез в /deals.
      if (n.deal_id) return `/deals#deal-${n.deal_id}`;
      return n.auction_id ? `/auctions/${n.auction_id}` : '/auctions';
    case 'deal':
      return n.deal_id ? `/deals#deal-${n.deal_id}` : '/deals';
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
      if (recipientRole === 'admin') return '/admin/users';
      // ТЗ от 2026-05-16 — уведомление «профиль верифицирован» ведёт
      // сразу на /auctions: юзер теперь может торговать, логично
      // открыть список аукционов, а не ЛК.
      if (
        n.event_type === 'verification_accepted' ||
        n.event_type === 'broker_verification_accepted'
      ) {
        return '/auctions';
      }
      return '/cabinet';
    default:
      return null;
  }
}
