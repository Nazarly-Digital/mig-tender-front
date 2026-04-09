'use client';

import { useCallback, useState } from 'react';
import { useRouter } from 'next/navigation';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  Award01Icon,
  Building03Icon,
  Coins01Icon,
  Wallet01Icon,
  UserIcon,
  CogIcon,
  Notification01Icon,
  Tick02Icon,
} from '@hugeicons/core-free-icons';

import { useNotificationsStore } from '@/entities/notifications';
import { useNotificationsSocket } from '@/shared/hooks/use-notifications-socket';
import type { NotificationItem, NotificationCategory } from '@/shared/types/notifications';
import * as Popover from '@/shared/ui/popover';
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

function getNotificationRoute(n: NotificationItem): string | null {
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

// --- Category avatar config ---

type CategoryConfig = {
  icon: typeof Award01Icon;
  bg: string;
  color: string;
};

const CATEGORY_CONFIG: Record<NotificationCategory, CategoryConfig> = {
  auction:  { icon: Award01Icon,     bg: 'bg-blue-100',    color: 'text-blue-600'    },
  deal:     { icon: Coins01Icon,     bg: 'bg-amber-100',   color: 'text-amber-600'   },
  payment:  { icon: Wallet01Icon,    bg: 'bg-emerald-100', color: 'text-emerald-600' },
  property: { icon: Building03Icon,  bg: 'bg-cyan-100',    color: 'text-cyan-600'    },
  user:     { icon: UserIcon,        bg: 'bg-purple-100',  color: 'text-purple-600'  },
  system:   { icon: CogIcon,         bg: 'bg-gray-100',    color: 'text-gray-500'    },
};

// --- Sub-components ---

function CategoryAvatar({ category }: { category: NotificationCategory }) {
  const cfg = CATEGORY_CONFIG[category] ?? CATEGORY_CONFIG.system;
  return (
    <div className={`flex size-10 shrink-0 items-center justify-center rounded-full ${cfg.bg} ${cfg.color}`}>
      <HugeiconsIcon icon={cfg.icon} size={20} color="currentColor" strokeWidth={1.5} />
    </div>
  );
}

function NotificationRow({
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
      className="flex w-full items-start gap-3 rounded-xl px-3 py-3 text-left transition-colors hover:bg-gray-50 active:bg-gray-100"
      onClick={() => {
        if (!notification.is_read) onRead(notification.id);
        onClick(notification);
      }}
    >
      <CategoryAvatar category={notification.category} />

      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <div className="flex items-baseline justify-between gap-2">
          <span className="truncate text-sm font-semibold text-gray-900">{notification.title}</span>
        <p className="line-clamp-2 text-sm leading-snug text-gray-500">{notification.message}</p>
        </div>
          <span className="shrink-0 text-end text-[11px] text-gray-400">{timeAgo(notification.created_at)}</span>
      </div>

      {!notification.is_read && (
        <div className="mt-2 size-2 shrink-0 rounded-full bg-emerald-500" />
      )}
    </button>
  );
}

// --- Main component ---

export default function NotificationButton({
  ...rest
}: React.ComponentPropsWithoutRef<typeof TopbarItemButton.Root>) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const items = useNotificationsStore((s) => s.items);
  const unreadCount = useNotificationsStore((s) => s.unreadCount);
  const { markRead, markAllRead } = useNotificationsSocket();

  const visibleItems = filter === 'unread' ? items.filter((n) => !n.is_read) : items;

  const handleOpenChange = (next: boolean) => {
    setOpen(next);
  };

  const handleClick = useCallback(
    (n: NotificationItem) => {
      const route = getNotificationRoute(n);
      if (route) router.push(route);
    },
    [router],
  );

  return (
    <>
      <Popover.Root open={open} onOpenChange={handleOpenChange}>
      <Popover.Trigger asChild>
        <TopbarItemButton.Root hasNotification={unreadCount > 0} {...rest}>
          <HugeiconsIcon
            icon={Notification01Icon}
            size={18}
            color="currentColor"
            strokeWidth={1.8}
          />
        </TopbarItemButton.Root>
      </Popover.Trigger>

      <Popover.Content
        showArrow={false}
        side="bottom"
        align="end"
        sideOffset={8}
        className="w-[380px] rounded-2xl border border-gray-200 bg-white p-0 shadow-xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 pt-4 pb-3">
          <span className="text-base font-semibold text-gray-900">Уведомления</span>
          <div className="flex items-center gap-0.5 rounded-lg bg-gray-100 p-1">
            <button
              type="button"
              onClick={() => setFilter('all')}
              className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${
                filter === 'all'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Все
            </button>
            <button
              type="button"
              onClick={() => setFilter('unread')}
              className={`flex items-center gap-1.5 rounded-md px-3 py-1 text-xs font-medium transition-colors ${
                filter === 'unread'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Непрочитанные
              {unreadCount > 0 && (
                <span className="flex py-1 px-1.5 items-center justify-center rounded-full bg-blue-600 text-[10px] font-medium leading-none text-white">
                  {unreadCount > 9 ? '9+' : unreadCount} +
                </span>
              )}
            </button>
          </div>
        </div>

        <div className="mx-4 h-px bg-gray-100" />

        {/* Notification list */}
        <div className="max-h-[420px] overflow-y-auto px-1 py-2">
          {visibleItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="mb-3 flex size-12 items-center justify-center rounded-full bg-gray-100 text-gray-400">
                <HugeiconsIcon icon={Notification01Icon} size={24} color="currentColor" strokeWidth={1.5} />
              </div>
              <p className="text-sm font-medium text-gray-900">Нет уведомлений</p>
              <p className="mt-1 text-xs text-gray-500">
                {filter === 'unread' ? 'Все уведомления прочитаны' : 'У вас пока нет уведомлений'}
              </p>
            </div>
          ) : (
            <div className="flex flex-col">
              {visibleItems.map((n) => (
                <NotificationRow
                  key={n.id}
                  notification={n}
                  onRead={markRead}
                  onClick={handleClick}
                />
              ))}
            </div>
          )}
        </div>

        {/* Footer — mark all read */}
        {unreadCount > 0 && (
          <>
            <div className="mx-4 h-px bg-gray-100" />
            <div className="px-3 py-3">
              <button
                type="button"
                onClick={markAllRead}
                className="flex w-full items-center justify-center gap-2 rounded-lg py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50 hover:text-gray-900"
              >
                <HugeiconsIcon icon={Tick02Icon} size={16} color="currentColor" strokeWidth={1.5} />
                Отметить все как прочитанные
              </button>
            </div>
          </>
        )}
      </Popover.Content>
    </Popover.Root>
    </>
  );
}
