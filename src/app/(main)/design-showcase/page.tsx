'use client';

import { HugeiconsIcon } from '@hugeicons/react';
import {
  ArrowRight01Icon,
  Building03Icon,
  Award01Icon,
  Clock01Icon,
  Add01Icon,
  Image01Icon,
  Pdf01Icon,
  AnalyticsUpIcon,
} from '@hugeicons/core-free-icons';

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className='mt-14 first:mt-0'>
      <h2 className='text-[15px] font-semibold text-gray-900'>{title}</h2>
      <div className='mt-2 mb-6 h-px bg-gray-100' />
      {children}
    </div>
  );
}

function V({ n, name }: { n: number; name: string }) {
  return (
    <div className='mb-2 flex items-center gap-2'>
      <span className='flex size-5 items-center justify-center rounded bg-blue-600 text-[10px] font-bold text-white'>{n}</span>
      <span className='text-[11px] font-medium text-gray-400'>{name}</span>
    </div>
  );
}

/* ═══════════════════════════════════════════
   1. STAT CARD — 10 вариантов
   Чистый белый, тонкий акцент, профессионально
   ═══════════════════════════════════════════ */

function S1() {
  return (
    <div className='group rounded-xl border border-blue-100/80 bg-gradient-to-br from-white via-white to-blue-50/40 p-5 transition-all duration-200 hover:border-blue-200 hover:shadow-sm'>
      <div className='flex items-center gap-2.5'>
        <div className='flex size-8 items-center justify-center rounded-lg bg-blue-50'><HugeiconsIcon icon={Building03Icon} size={16} color='currentColor' strokeWidth={1.5} className='text-blue-600' /></div>
        <span className='text-[12px] font-semibold text-gray-500'>Мои объекты</span>
      </div>
      <span className='mt-3 block text-2xl font-bold tracking-tight text-gray-900'>24</span>
      <div className='mt-4 border-t border-gray-100 pt-3'>
        <span className='inline-flex items-center gap-1 text-[13px] font-medium text-gray-400 hover:text-blue-600 cursor-pointer transition-colors'>Все объекты <HugeiconsIcon icon={ArrowRight01Icon} size={14} color='currentColor' strokeWidth={1.5} /></span>
      </div>
    </div>
  );
}

function S2() {
  return (
    <div className='group rounded-xl border border-blue-100/80 bg-gradient-to-br from-white via-white to-blue-50/40 p-5 transition-all duration-200 hover:border-blue-200 hover:shadow-sm'>
      <span className='text-[11px] font-semibold uppercase tracking-widest text-gray-400'>Мои объекты</span>
      <div className='mt-2 flex items-baseline gap-2'>
        <span className='text-2xl font-bold tracking-tight text-gray-900'>24</span>
        <span className='rounded-full bg-emerald-50 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-600'>+12%</span>
      </div>
      <div className='mt-4 border-t border-gray-100 pt-3'>
        <span className='inline-flex items-center gap-1 text-[13px] font-medium text-gray-400 hover:text-blue-600 cursor-pointer transition-colors'>Все объекты <HugeiconsIcon icon={ArrowRight01Icon} size={14} color='currentColor' strokeWidth={1.5} /></span>
      </div>
    </div>
  );
}

function S3() {
  return (
    <div className='group flex items-center gap-4 rounded-xl border border-blue-100/80 bg-gradient-to-br from-white via-white to-blue-50/40 p-5 transition-all duration-200 hover:border-blue-200 hover:shadow-sm'>
      <div className='flex size-12 shrink-0 items-center justify-center rounded-xl bg-blue-50'><HugeiconsIcon icon={Building03Icon} size={22} color='currentColor' strokeWidth={1.5} className='text-blue-600' /></div>
      <div className='flex-1'>
        <span className='text-[12px] font-medium text-gray-400'>Мои объекты</span>
        <span className='block text-2xl font-bold tracking-tight text-gray-900'>24</span>
      </div>
      <HugeiconsIcon icon={ArrowRight01Icon} size={18} color='currentColor' strokeWidth={1.5} className='text-gray-300 transition-colors group-hover:text-blue-500' />
    </div>
  );
}

function S4() {
  return (
    <div className='group rounded-xl border border-blue-100/80 bg-gradient-to-br from-white via-white to-blue-50/40 p-5 transition-all duration-200 hover:border-blue-200 hover:shadow-sm'>
      <div className='flex items-center justify-between'>
        <span className='text-[12px] font-semibold text-gray-500'>Мои объекты</span>
        <span className='rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-semibold text-blue-600'>Сегодня</span>
      </div>
      <span className='mt-2 block text-2xl font-bold tracking-tight text-gray-900'>24</span>
      <div className='mt-3 h-1 overflow-hidden rounded-full bg-gray-100'>
        <div className='h-full w-3/4 rounded-full bg-blue-500' />
      </div>
      <span className='mt-1.5 text-[11px] text-gray-400'>18 из 24 активных</span>
    </div>
  );
}

function S5() {
  return (
    <div className='group rounded-xl border border-blue-100/80 bg-gradient-to-br from-white via-white to-blue-50/40 p-5 transition-all duration-200 hover:border-blue-200 hover:shadow-sm'>
      <div className='flex items-center gap-2.5'>
        <div className='flex size-8 items-center justify-center rounded-lg bg-emerald-50'><HugeiconsIcon icon={Award01Icon} size={16} color='currentColor' strokeWidth={1.5} className='text-emerald-600' /></div>
        <span className='text-[12px] font-semibold text-gray-500'>Аукционы</span>
      </div>
      <span className='mt-3 block text-2xl font-bold tracking-tight text-gray-900'>8</span>
      <div className='mt-4 border-t border-gray-100 pt-3'>
        <span className='inline-flex items-center gap-1 text-[13px] font-medium text-gray-400 hover:text-blue-600 cursor-pointer transition-colors'>Подробнее <HugeiconsIcon icon={ArrowRight01Icon} size={14} color='currentColor' strokeWidth={1.5} /></span>
      </div>
    </div>
  );
}

function S6() {
  return (
    <div className='group rounded-xl border-l-[3px] border-l-blue-500 border border-blue-100/80 bg-gradient-to-br from-white via-white to-blue-50/40 p-5 transition-all duration-200 hover:shadow-sm'>
      <span className='text-[12px] font-semibold text-gray-500'>Мои объекты</span>
      <span className='mt-2 block text-2xl font-bold tracking-tight text-gray-900'>24</span>
      <span className='mt-1 text-[12px] text-gray-400'>+3 за эту неделю</span>
    </div>
  );
}

function S7() {
  return (
    <div className='group rounded-xl border border-blue-100/80 bg-gradient-to-br from-white via-white to-blue-50/40 p-5 transition-all duration-200 hover:border-blue-200 hover:shadow-sm'>
      <div className='flex items-center justify-between'>
        <span className='text-[12px] font-semibold text-gray-500'>Активные объекты</span>
        <HugeiconsIcon icon={AnalyticsUpIcon} size={16} color='currentColor' strokeWidth={1.5} className='text-emerald-500' />
      </div>
      <div className='mt-2 flex items-baseline gap-3'>
        <span className='text-2xl font-bold tracking-tight text-gray-900'>18</span>
        <span className='text-[13px] text-gray-300'>/ 24</span>
      </div>
      <div className='mt-3 flex gap-0.5'>
        {[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0].map((active, i) => (
          <div key={i} className={`h-1.5 flex-1 rounded-full ${active ? 'bg-blue-500' : 'bg-gray-100'}`} />
        ))}
      </div>
    </div>
  );
}

function S8() {
  return (
    <div className='group rounded-xl border border-gray-200 bg-gradient-to-br from-white to-gray-50/80 p-5 transition-all duration-200 hover:border-blue-200 hover:shadow-sm'>
      <div className='flex items-center gap-2.5'>
        <div className='flex size-8 items-center justify-center rounded-lg bg-amber-50'><HugeiconsIcon icon={Clock01Icon} size={16} color='currentColor' strokeWidth={1.5} className='text-amber-600' /></div>
        <span className='text-[12px] font-semibold text-gray-500'>На модерации</span>
      </div>
      <span className='mt-3 block text-2xl font-bold tracking-tight text-gray-900'>3</span>
      <div className='mt-4 border-t border-gray-100 pt-3'>
        <span className='inline-flex items-center gap-1 text-[13px] font-medium text-gray-400 hover:text-blue-600 cursor-pointer transition-colors'>Перейти <HugeiconsIcon icon={ArrowRight01Icon} size={14} color='currentColor' strokeWidth={1.5} /></span>
      </div>
    </div>
  );
}

function S9() {
  return (
    <div className='group overflow-hidden rounded-xl border border-blue-100/80 bg-gradient-to-br from-white via-white to-blue-50/40 transition-all duration-200 hover:border-blue-200 hover:shadow-sm'>
      <div className='p-5'>
        <span className='text-[12px] font-semibold text-gray-500'>Конверсия</span>
        <span className='mt-2 block text-2xl font-bold tracking-tight text-gray-900'>73%</span>
        <span className='text-[11px] text-emerald-600 font-medium'>+5% выше среднего</span>
      </div>
      <div className='h-1 bg-gray-50'><div className='h-full w-[73%] bg-blue-500' /></div>
    </div>
  );
}

function S10() {
  return (
    <div className='group rounded-xl border border-blue-100/80 bg-gradient-to-br from-white via-white to-blue-50/40 p-5 transition-all duration-200 hover:border-blue-200 hover:shadow-sm'>
      <div className='flex items-center justify-between'>
        <span className='text-[12px] font-semibold text-gray-500'>Документы</span>
        <span className='flex size-6 items-center justify-center rounded-full bg-blue-50 text-[10px] font-bold text-blue-600'>56</span>
      </div>
      <span className='mt-2 block text-2xl font-bold tracking-tight text-gray-900'>56</span>
      <span className='mt-1 text-[11px] text-gray-400'>загружено</span>
    </div>
  );
}

/* ═══════════════════════════════════════════
   2. PROPERTY CARD (с фото) — 10 вариантов
   Как на странице "Мои объекты"
   ═══════════════════════════════════════════ */

function P({ variant }: { variant: number }) {
  const addresses = ['ул. Примерная, д. 42','пр. Абая, д. 105','ул. Сатпаева, д. 18','ул. Жандосова, 55','бул. Нурсултана, 7','ул. Тимирязева, 88','ул. Гоголя, 15А','мкр. Самал, д. 3','ул. Манаса, д. 22','пр. Достык, д. 1'];
  const types = ['Квартира','Дом','Таунхаус','Квартира','Коммерция','Квартира','Участок','Квартира','Дом','Квартира'];
  const classes = ['Комфорт','Бизнес','Премиум','Эконом','Эконом','Комфорт','—','Премиум','Бизнес','Комфорт'];
  const prices = ['12.5M $','28M $','45M $','8.5M $','6.8M $','15M $','3.2M $','55M $','32M $','18M $'];
  const areas = ['120.5 м²','340 м²','220 м²','76 м²','95 м²','120 м²','850 м²','200 м²','410 м²','165 м²'];
  const statuses = ['Опубликован','Черновик','Опубликован','На модерации','Отклонён','Опубликован','Опубликован','Опубликован','Опубликован','На аукционе'];
  const dotColors = ['bg-emerald-500','bg-amber-500','bg-emerald-500','bg-amber-500','bg-red-500','bg-emerald-500','bg-emerald-500','bg-emerald-500','bg-emerald-500','bg-blue-500'];
  const textColors = ['text-emerald-600','text-amber-600','text-emerald-600','text-amber-600','text-red-600','text-emerald-600','text-emerald-600','text-emerald-600','text-emerald-600','text-blue-600'];
  const i = variant - 1;

  return (
    <div className='group overflow-hidden rounded-xl border border-blue-100/80 bg-gradient-to-br from-white via-white to-blue-50/40 transition-all duration-200 hover:border-blue-200 hover:shadow-sm'>
      <div className='relative h-40 bg-gray-100'>
        <div className='flex h-full items-center justify-center'>
          <HugeiconsIcon icon={Image01Icon} size={32} color='currentColor' strokeWidth={1} className='text-gray-300 transition-transform duration-300 group-hover:scale-105' />
        </div>
        <div className='absolute left-3 top-3 flex gap-1.5'>
          <span className='rounded-md bg-white/90 px-1.5 py-0.5 text-[10px] font-semibold text-gray-600 backdrop-blur-sm shadow-sm'>{types[i]}</span>
          {classes[i] !== '—' && <span className='rounded-md bg-white/90 px-1.5 py-0.5 text-[10px] font-semibold text-gray-600 backdrop-blur-sm shadow-sm'>{classes[i]}</span>}
        </div>
      </div>
      <div className='p-4'>
        <div className='flex items-center gap-1.5'>
          <span className={`size-1.5 rounded-full ${dotColors[i]}`} />
          <span className={`text-[11px] font-medium ${textColors[i]}`}>{statuses[i]}</span>
        </div>
        <h3 className='mt-1.5 truncate text-[14px] font-semibold text-gray-900'>{addresses[i]}</h3>
        <div className='mt-3 flex items-baseline justify-between'>
          <span className='text-[17px] font-bold text-gray-900'>{prices[i]}</span>
          <span className='text-[12px] text-gray-400'>{areas[i]}</span>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   3. AUCTION CARD (с прогрессом) — 10 вариантов
   Как на странице "Мои аукционы"
   ═══════════════════════════════════════════ */

function A({ variant }: { variant: number }) {
  const data = [
    { num: 142, status: 'Активный', mode: 'Закрытый', price: '8.2M ₸', bids: '12 ставок', min: '5M ₸', pct: 65, dot: 'bg-emerald-500', text: 'text-emerald-600' },
    { num: 89, status: 'Завершён', mode: 'Открытый', price: '12M ₸', bids: '24 ставки', min: '8M ₸', pct: 100, dot: 'bg-blue-500', text: 'text-blue-600' },
    { num: 201, status: 'Черновик', mode: 'Закрытый', price: '—', bids: '0 ставок', min: '3M ₸', pct: 0, dot: 'bg-amber-500', text: 'text-amber-600' },
    { num: 167, status: 'Активный', mode: 'Открытый', price: '15.4M ₸', bids: '7 ставок', min: '10M ₸', pct: 35, dot: 'bg-emerald-500', text: 'text-emerald-600' },
    { num: 55, status: 'Отменён', mode: 'Закрытый', price: '2.1M ₸', bids: '3 ставки', min: '1M ₸', pct: 40, dot: 'bg-red-500', text: 'text-red-500' },
    { num: 210, status: 'Активный', mode: 'Открытый', price: '22M ₸', bids: '18 ставок', min: '15M ₸', pct: 80, dot: 'bg-emerald-500', text: 'text-emerald-600' },
    { num: 98, status: 'Завершён', mode: 'Закрытый', price: '7.5M ₸', bids: '9 ставок', min: '5M ₸', pct: 100, dot: 'bg-blue-500', text: 'text-blue-600' },
    { num: 175, status: 'Активный', mode: 'Закрытый', price: '33M ₸', bids: '31 ставка', min: '20M ₸', pct: 50, dot: 'bg-emerald-500', text: 'text-emerald-600' },
    { num: 44, status: 'Черновик', mode: 'Открытый', price: '—', bids: '0 ставок', min: '2M ₸', pct: 0, dot: 'bg-amber-500', text: 'text-amber-600' },
    { num: 130, status: 'Завершён', mode: 'Открытый', price: '4.8M ₸', bids: '6 ставок', min: '3M ₸', pct: 100, dot: 'bg-blue-500', text: 'text-blue-600' },
  ];
  const d = data[variant - 1];

  return (
    <div className='group rounded-xl border border-blue-100/80 bg-gradient-to-br from-white via-white to-blue-50/40 p-5 transition-all duration-200 hover:border-blue-200 hover:shadow-sm'>
      <div className='flex items-start justify-between'>
        <div>
          <h3 className='text-[14px] font-semibold text-gray-900'>Аукцион #{d.num}</h3>
          <div className='mt-1 flex items-center gap-1.5'>
            <span className={`size-1.5 rounded-full ${d.dot}`} />
            <span className={`text-[11px] font-medium ${d.text}`}>{d.status}</span>
            <span className='text-[11px] text-gray-300'>·</span>
            <span className='text-[11px] text-gray-400'>{d.mode}</span>
          </div>
        </div>
        <span className='text-[17px] font-bold text-gray-900'>{d.price}</span>
      </div>
      {d.pct > 0 && (
        <div className='mt-4'>
          <div className='mb-1 flex justify-between text-[11px]'>
            <span className='text-gray-400'>{d.bids} · мин. {d.min}</span>
            <span className='font-semibold text-gray-500'>{d.pct}%</span>
          </div>
          <div className='h-1 overflow-hidden rounded-full bg-gray-100'>
            <div className='h-full rounded-full bg-blue-500' style={{ width: `${d.pct}%` }} />
          </div>
        </div>
      )}
      {d.pct === 0 && (
        <div className='mt-4 text-[11px] text-gray-400'>{d.bids} · мин. {d.min}</div>
      )}
      <div className='mt-3 flex items-center gap-3 border-t border-gray-100 pt-3 text-[12px] text-gray-400'>
        <span className='flex items-center gap-1'><HugeiconsIcon icon={Award01Icon} size={13} color='currentColor' strokeWidth={1.5} className='text-gray-300' />{d.bids}</span>
        <span className='flex items-center gap-1'><HugeiconsIcon icon={Clock01Icon} size={13} color='currentColor' strokeWidth={1.5} className='text-gray-300' />до 15 апр</span>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   4. DOCUMENT CARD — 10 вариантов
   ═══════════════════════════════════════════ */

function D({ variant }: { variant: number }) {
  const docs = [
    { name: 'Договор_аренды.pdf', size: '2.4 МБ', date: '15 мар', badge: 'PDF', color: 'red' },
    { name: 'Акт_приёмки.docx', size: '1.1 МБ', date: '10 мар', badge: 'DOC', color: 'blue' },
    { name: 'Смета_Q1.xlsx', size: '856 КБ', date: '5 мар', badge: 'XLS', color: 'emerald' },
    { name: 'Фасад.png', size: '4.7 МБ', date: '1 мар', badge: 'IMG', color: 'violet' },
    { name: 'Лицензия.pdf', size: '512 КБ', date: '20 фев', badge: 'PDF', color: 'amber' },
    { name: 'Паспорт_объекта.pdf', size: '3.1 МБ', date: '18 фев', badge: 'PDF', color: 'red' },
    { name: 'ТЗ_проект.docx', size: '2.8 МБ', date: '12 фев', badge: 'DOC', color: 'blue' },
    { name: 'Бюджет_2026.xlsx', size: '1.5 МБ', date: '8 фев', badge: 'XLS', color: 'emerald' },
    { name: 'Планировка.jpg', size: '6.2 МБ', date: '1 фев', badge: 'IMG', color: 'violet' },
    { name: 'Соглашение.pdf', size: '890 КБ', date: '25 янв', badge: 'PDF', color: 'amber' },
  ];
  const d = docs[variant - 1];
  const iconBg: Record<string, string> = { red: 'bg-red-50', blue: 'bg-blue-50', emerald: 'bg-emerald-50', violet: 'bg-violet-50', amber: 'bg-amber-50' };
  const iconText: Record<string, string> = { red: 'text-red-500', blue: 'text-blue-500', emerald: 'text-emerald-500', violet: 'text-violet-500', amber: 'text-amber-500' };
  const badgeBg: Record<string, string> = { red: 'bg-red-500', blue: 'bg-blue-500', emerald: 'bg-emerald-500', violet: 'bg-violet-500', amber: 'bg-amber-500' };

  return (
    <div className='group flex items-center gap-3 rounded-xl border border-blue-100/80 bg-gradient-to-br from-white via-white to-blue-50/40 p-4 transition-all duration-200 hover:border-blue-200 hover:shadow-sm'>
      <div className='relative'>
        <div className={`flex size-10 items-center justify-center rounded-lg ${iconBg[d.color]}`}>
          <HugeiconsIcon icon={d.color === 'violet' ? Image01Icon : Pdf01Icon} size={20} color='currentColor' strokeWidth={1.5} className={iconText[d.color]} />
        </div>
        <span className={`absolute -bottom-1 -right-1 rounded px-1 text-[8px] font-bold text-white ${badgeBg[d.color]}`}>{d.badge}</span>
      </div>
      <div className='flex-1 min-w-0'>
        <span className='block truncate text-[13px] font-medium text-gray-900'>{d.name}</span>
        <span className='text-[12px] text-gray-400'>{d.size} · {d.date}</span>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   5. QUICK ACTION CARD — 10 вариантов
   ═══════════════════════════════════════════ */

function Q({ variant }: { variant: number }) {
  const actions = [
    { icon: Add01Icon, title: 'Создать объект', desc: 'Новый объект недвижимости' },
    { icon: Award01Icon, title: 'Создать аукцион', desc: 'Запустите торги' },
    { icon: Pdf01Icon, title: 'Загрузить документ', desc: 'PDF, Word, Excel' },
    { icon: AnalyticsUpIcon, title: 'Аналитика', desc: 'Статистика аукционов' },
    { icon: Building03Icon, title: 'Каталог', desc: 'Все объекты' },
    { icon: Clock01Icon, title: 'Мои сделки', desc: 'Активные и завершённые' },
    { icon: Add01Icon, title: 'Новый аукцион', desc: 'Быстрое создание' },
    { icon: Image01Icon, title: 'Фотографии', desc: 'Галерея объектов' },
    { icon: Award01Icon, title: 'Ставки', desc: 'Управление ставками' },
    { icon: ArrowRight01Icon, title: 'Настройки', desc: 'Параметры аккаунта' },
  ];
  const a = actions[variant - 1];

  return (
    <div className='group cursor-pointer rounded-xl border border-dashed border-blue-100/80 bg-gradient-to-br from-white via-white to-blue-50/30 p-5 text-center transition-all duration-200 hover:border-blue-300 hover:bg-blue-50/20'>
      <div className='mx-auto flex size-10 items-center justify-center rounded-xl bg-gray-50 transition-colors duration-200 group-hover:bg-blue-50'>
        <HugeiconsIcon icon={a.icon} size={20} color='currentColor' strokeWidth={1.5} className='text-gray-400 transition-colors group-hover:text-blue-600' />
      </div>
      <h3 className='mt-2.5 text-[13px] font-semibold text-gray-900'>{a.title}</h3>
      <p className='mt-0.5 text-[12px] text-gray-400'>{a.desc}</p>
    </div>
  );
}

/* ═══════════════════════════════════════════ */

export default function DesignShowcasePage() {
  return (
    <div className='w-full px-8 py-8'>
      <div>
        <h1 className='text-xl font-semibold tracking-tight text-gray-900'>Витрина карточек</h1>
        <p className='mt-0.5 text-[13px] text-gray-500'>10 вариантов каждого типа. Взрослый, чистый, с жизнью.</p>
      </div>

      <Section title='1. Stat Card (KPI)'>
        <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5'>
          {[1,2,3,4,5,6,7,8,9,10].map(n => <div key={n}><V n={n} name={['Icon + Link','Trend Badge','Horizontal','Progress','Green Icon','Left Accent','Dot Bar','Warm BG','Bottom Bar','Count Circle'][n-1]} /><S1 key={`s${n}`} />{n===1?null:n===2?<S2/>:n===3?<S3/>:n===4?<S4/>:n===5?<S5/>:n===6?<S6/>:n===7?<S7/>:n===8?<S8/>:n===9?<S9/>:<S10/>}</div>)}
        </div>
      </Section>

      <Section title='2. Property Card (Карточка объекта с фото)'>
        <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5'>
          {[1,2,3,4,5,6,7,8,9,10].map(n => <div key={n}><V n={n} name={['Опубликован','Черновик','Премиум','Эконом','Отклонён','Комфорт','Участок','Премиум','Бизнес','На аукционе'][n-1]} /><P variant={n} /></div>)}
        </div>
      </Section>

      <Section title='3. Auction Card (Карточка аукциона с прогрессом)'>
        <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5'>
          {[1,2,3,4,5,6,7,8,9,10].map(n => <div key={n}><V n={n} name={['Активный','Завершён','Черновик','Открытый','Отменён','80%','Завершён 2','50%','Черновик 2','Завершён 3'][n-1]} /><A variant={n} /></div>)}
        </div>
      </Section>

      <Section title='4. Document Card (Карточка документа)'>
        <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3'>
          {[1,2,3,4,5,6,7,8,9,10].map(n => <div key={n}><V n={n} name={['PDF','DOC','XLS','IMG','PDF 2','PDF 3','DOC 2','XLS 2','IMG 2','PDF 4'][n-1]} /><D variant={n} /></div>)}
        </div>
      </Section>

      <Section title='5. Quick Action Card (CTA)'>
        <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5'>
          {[1,2,3,4,5,6,7,8,9,10].map(n => <div key={n}><V n={n} name={['Объект','Аукцион','Документ','Аналитика','Каталог','Сделки','Аукцион 2','Фото','Ставки','Настройки'][n-1]} /><Q variant={n} /></div>)}
        </div>
      </Section>

      <div className='mt-16 h-20' />
    </div>
  );
}
