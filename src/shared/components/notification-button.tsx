'use client';

import { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { RiNotification3Line, RiCheckDoubleLine } from '@remixicon/react';

import { useNotificationsStore } from '@/entities/notifications';
import { useNotificationsSocket } from '@/shared/hooks/use-notifications-socket';
import type { NotificationItem } from '@/shared/types/notifications';
import * as Popover from '@/shared/ui/popover';
import * as Divider from '@/shared/ui/divider';
import * as LinkButton from '@/shared/ui/link-button';
import * as TopbarItemButton from '@/shared/components/topbar-item-button';

// --- Helpers ---

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return 'Только что';
  if (minutes < 60) return `${minutes} мин. назад`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} ч. назад`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} дн. назад`;
  return new Date(dateStr).toLocaleDateString('ru-RU');
}

function getCategoryLabel(category: string): string {
  const map: Record<string, string> = {
    system: 'Система',
    user: 'Пользователи',
    property: 'Объекты',
    auction: 'Аукционы',
    deal: 'Сделки',
    payment: 'Выплаты',
  };
  return map[category] ?? category;
}

function getCategoryColor(category: string): string {
  const map: Record<string, string> = {
    auction: 'bg-blue-50 text-blue-700',
    deal: 'bg-amber-50 text-amber-700',
    payment: 'bg-emerald-50 text-emerald-700',
    user: 'bg-purple-50 text-purple-700',
    property: 'bg-cyan-50 text-cyan-700',
    system: 'bg-gray-100 text-gray-600',
  };
  return map[category] ?? 'bg-gray-100 text-gray-600';
}

function getNotificationRoute(n: NotificationItem): string | null {
  if (n.deal_id) return `/deals/${n.deal_id}`;
  if (n.payment_id) return `/payments`;
  if (n.auction_id) return `/auctions/${n.auction_id}`;
  if (n.real_property_id) return `/properties/${n.real_property_id}`;
  return null;
}

// --- Components ---

function NotificationItemRow({
  notification,
  onRead,
  onClick,
}: {
  notification: NotificationItem;
  onRead: (id: number) => void;
  onClick: (n: NotificationItem) => void;
}) {
  return (
    <button
      type="button"
      className={`flex w-full items-start gap-3 rounded-lg p-3 text-left transition-colors hover:bg-gray-50 ${
        !notification.is_read ? 'bg-blue-50/40' : ''
      }`}
      onClick={() => {
        if (!notification.is_read) onRead(notification.id);
        onClick(notification);
      }}
    >
      <div className="flex flex-col gap-1.5 min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span
            className={`inline-flex items-center text-[10px] font-medium px-1.5 py-0.5 rounded-full ${getCategoryColor(
              notification.category,
            )}`}
          >
            {getCategoryLabel(notification.category)}
          </span>
          {!notification.is_read && (
            <span className="size-1.5 rounded-full bg-blue-600 shrink-0" />
          )}
        </div>
        <p className="text-sm text-gray-900 leading-snug">{notification.message}</p>
        <span className="text-xs text-gray-400">{timeAgo(notification.created_at)}</span>
      </div>
    </button>
  );
}

export default function NotificationButton({
  ...rest
}: React.ComponentPropsWithoutRef<typeof TopbarItemButton.Root>) {
  const router = useRouter();
  const items = useNotificationsStore((s) => s.items);
  const unreadCount = useNotificationsStore((s) => s.unreadCount);
  const { markRead, markAllRead } = useNotificationsSocket();

  const handleClick = useCallback(
    (n: NotificationItem) => {
      const route = getNotificationRoute(n);
      if (route) router.push(route);
    },
    [router],
  );

  const handleMarkRead = useCallback(
    (id: number) => {
      markRead(id);
    },
    [markRead],
  );

  return (
    <Popover.Root>
      <Popover.Trigger asChild>
        <TopbarItemButton.Root hasNotification={unreadCount > 0} {...rest}>
          <TopbarItemButton.Icon as={RiNotification3Line} />
        </TopbarItemButton.Root>
      </Popover.Trigger>
      <Popover.Content
        showArrow={false}
        className="w-screen max-w-[calc(100%-36px)] rounded-20 p-0 shadow-none min-[480px]:max-w-[448px]"
      >
        {/* Header */}
        <div className="flex h-14 items-center justify-between px-5">
          <span className="text-label-md text-text-strong-950">
            Уведомления
            {unreadCount > 0 && (
              <span className="ml-2 inline-flex items-center justify-center rounded-full bg-blue-600 px-1.5 py-0.5 text-[10px] font-medium text-white leading-none">
                {unreadCount}
              </span>
            )}
          </span>
          {unreadCount > 0 && (
            <LinkButton.Root
              variant="primary"
              size="medium"
              onClick={markAllRead}
            >
              <RiCheckDoubleLine className="size-4" />
              Прочитать все
            </LinkButton.Root>
          )}
        </div>

        <Divider.Root variant="line-spacing" />

        {/* List */}
        <div className="max-h-[400px] overflow-y-auto p-2">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <RiNotification3Line className="size-10 text-gray-300 mb-3" />
              <p className="text-sm text-gray-500">Нет уведомлений</p>
            </div>
          ) : (
            <div className="flex flex-col gap-0.5">
              {items.map((n) => (
                <NotificationItemRow
                  key={n.id}
                  notification={n}
                  onRead={handleMarkRead}
                  onClick={handleClick}
                />
              ))}
            </div>
          )}
        </div>
      </Popover.Content>
    </Popover.Root>
  );
}
