'use client';

import { HugeiconsIcon } from '@hugeicons/react';
import {
  Image01Icon,
  Edit01Icon,
  Delete01Icon,
  Clock01Icon,
  Building03Icon,
  Award01Icon,
  UserIcon,
  Coins01Icon,
  ChampionIcon,
} from '@hugeicons/core-free-icons';

const M = {
  address: 'ул. Примерная, д. 42',
  type: 'Квартира',
  cls: 'Комфорт',
  status: 'Опубликован',
  price: '12 500 000 $',
  area: '120.5 м²',
  deadline: '15.06.2026',
};

function V({ n, name }: { n: number; name: string }) {
  return (
    <div className='mb-3 flex items-center gap-2'>
      <span className='flex size-6 items-center justify-center rounded-md bg-gradient-to-r from-blue-600 to-blue-700 text-[11px] font-bold text-white'>{n}</span>
      <span className='text-[12px] font-semibold text-gray-500'>{name}</span>
    </div>
  );
}

function Img({ h = 'h-36' }: { h?: string }) {
  return (
    <div className={`${h} bg-gray-100 flex items-center justify-center`}>
      <HugeiconsIcon icon={Image01Icon} size={32} color='currentColor' strokeWidth={1} className='text-gray-300' />
    </div>
  );
}

/* ═══════ V1: Overlay цена + dot-статус + мета строка ═══════ */
function C1() {
  return (
    <div className='group overflow-hidden rounded-xl border border-blue-100/80 bg-gradient-to-br from-white via-white to-blue-50/40 transition-all duration-200 hover:border-blue-200 hover:shadow-sm'>
      <div className='relative h-36 bg-gray-100 flex items-center justify-center'>
        <HugeiconsIcon icon={Image01Icon} size={32} color='currentColor' strokeWidth={1} className='text-gray-300' />
        <div className='absolute left-3 bottom-3 rounded-md bg-black/60 px-2 py-1 text-[13px] font-bold text-white backdrop-blur-sm'>{M.price}</div>
        <div className='absolute right-3 top-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity'>
          <button type='button' className='size-7 rounded-md bg-white/80 flex items-center justify-center text-gray-600 backdrop-blur-sm hover:bg-white'><HugeiconsIcon icon={Edit01Icon} size={14} /></button>
          <button type='button' className='size-7 rounded-md bg-white/80 flex items-center justify-center text-gray-600 backdrop-blur-sm hover:bg-white hover:text-red-500'><HugeiconsIcon icon={Delete01Icon} size={14} /></button>
        </div>
      </div>
      <div className='p-4'>
        <div className='flex items-center justify-between'>
          <h3 className='text-[14px] font-semibold text-gray-900 truncate'>{M.address}</h3>
          <span className='inline-flex items-center gap-1 shrink-0 ml-2'>
            <span className='size-1.5 rounded-full bg-emerald-500' />
            <span className='text-[11px] font-medium text-emerald-600'>{M.status}</span>
          </span>
        </div>
        <div className='mt-2 flex items-center gap-3 text-[12px] text-gray-400'>
          <span>{M.type}</span><span className='text-gray-200'>·</span>
          <span>{M.cls}</span><span className='text-gray-200'>·</span>
          <span>{M.area}</span><span className='text-gray-200'>·</span>
          <span>до {M.deadline}</span>
        </div>
      </div>
    </div>
  );
}

/* ═══════ V2: Overlay + бейджи type/class на фото сверху ═══════ */
function C2() {
  return (
    <div className='group overflow-hidden rounded-xl border border-blue-100/80 bg-gradient-to-br from-white via-white to-blue-50/40 transition-all duration-200 hover:border-blue-200 hover:shadow-sm'>
      <div className='relative h-36 bg-gray-100 flex items-center justify-center'>
        <HugeiconsIcon icon={Image01Icon} size={32} color='currentColor' strokeWidth={1} className='text-gray-300' />
        <div className='absolute left-3 top-3 flex gap-1.5'>
          <span className='rounded-md bg-white/90 px-1.5 py-0.5 text-[10px] font-semibold text-gray-600 backdrop-blur-sm shadow-sm'>{M.type}</span>
          <span className='rounded-md bg-white/90 px-1.5 py-0.5 text-[10px] font-semibold text-gray-600 backdrop-blur-sm shadow-sm'>{M.cls}</span>
        </div>
        <div className='absolute left-3 bottom-3 rounded-md bg-black/60 px-2 py-1 text-[13px] font-bold text-white backdrop-blur-sm'>{M.price}</div>
        <div className='absolute right-3 top-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity'>
          <button type='button' className='size-7 rounded-md bg-white/80 flex items-center justify-center text-gray-600 backdrop-blur-sm hover:bg-white'><HugeiconsIcon icon={Edit01Icon} size={14} /></button>
          <button type='button' className='size-7 rounded-md bg-white/80 flex items-center justify-center text-gray-600 backdrop-blur-sm hover:bg-white hover:text-red-500'><HugeiconsIcon icon={Delete01Icon} size={14} /></button>
        </div>
      </div>
      <div className='px-4 py-3'>
        <div className='flex items-center justify-between'>
          <h3 className='text-[14px] font-semibold text-gray-900 truncate'>{M.address}</h3>
          <span className='inline-flex items-center gap-1 shrink-0 ml-2'>
            <span className='size-1.5 rounded-full bg-emerald-500' />
            <span className='text-[11px] font-medium text-emerald-600'>{M.status}</span>
          </span>
        </div>
        <span className='mt-1 block text-[12px] text-gray-400'>{M.area} · до {M.deadline}</span>
      </div>
    </div>
  );
}

/* ═══════ V3: Overlay + area badge на фото + footer с иконкой ═══════ */
function C3() {
  return (
    <div className='group overflow-hidden rounded-xl border border-blue-100/80 bg-gradient-to-br from-white via-white to-blue-50/40 transition-all duration-200 hover:border-blue-200 hover:shadow-sm'>
      <div className='relative h-40 bg-gray-100 flex items-center justify-center'>
        <HugeiconsIcon icon={Image01Icon} size={32} color='currentColor' strokeWidth={1} className='text-gray-300' />
        <div className='absolute left-3 bottom-3 rounded-md bg-black/60 px-2.5 py-1 backdrop-blur-sm'>
          <span className='text-[14px] font-bold text-white'>{M.price}</span>
        </div>
        <div className='absolute right-3 bottom-3 rounded-md bg-black/40 px-1.5 py-0.5 text-[11px] font-medium text-white backdrop-blur-sm'>{M.area}</div>
        <div className='absolute right-3 top-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity'>
          <button type='button' className='size-7 rounded-md bg-white/80 flex items-center justify-center text-gray-600 backdrop-blur-sm hover:bg-white'><HugeiconsIcon icon={Edit01Icon} size={14} /></button>
          <button type='button' className='size-7 rounded-md bg-white/80 flex items-center justify-center text-gray-600 backdrop-blur-sm hover:bg-white hover:text-red-500'><HugeiconsIcon icon={Delete01Icon} size={14} /></button>
        </div>
      </div>
      <div className='px-4 py-3 flex items-center justify-between'>
        <div className='min-w-0 flex-1'>
          <h3 className='text-[14px] font-semibold text-gray-900 truncate'>{M.address}</h3>
          <div className='mt-1 flex items-center gap-1.5 text-[12px] text-gray-400'>
            <span>{M.type}</span><span className='text-gray-200'>·</span><span>{M.cls}</span>
          </div>
        </div>
        <div className='flex items-center gap-1.5 shrink-0 ml-3'>
          <span className='size-1.5 rounded-full bg-emerald-500' />
          <span className='text-[11px] font-medium text-emerald-600'>{M.status}</span>
        </div>
      </div>
    </div>
  );
}

/* ═══════ V4: Overlay + gradient bottom bar + deadline ═══════ */
function C4() {
  return (
    <div className='group overflow-hidden rounded-xl border border-blue-100/80 bg-gradient-to-br from-white via-white to-blue-50/40 transition-all duration-200 hover:border-blue-200 hover:shadow-sm'>
      <div className='relative h-36 bg-gray-100 flex items-center justify-center'>
        <HugeiconsIcon icon={Image01Icon} size={32} color='currentColor' strokeWidth={1} className='text-gray-300' />
        <div className='absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/50 to-transparent px-4 pb-3 pt-8'>
          <div className='flex items-end justify-between'>
            <span className='text-[15px] font-bold text-white'>{M.price}</span>
            <span className='text-[11px] text-white/70'>{M.area}</span>
          </div>
        </div>
        <div className='absolute right-3 top-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity'>
          <button type='button' className='size-7 rounded-md bg-white/80 flex items-center justify-center text-gray-600 backdrop-blur-sm hover:bg-white'><HugeiconsIcon icon={Edit01Icon} size={14} /></button>
          <button type='button' className='size-7 rounded-md bg-white/80 flex items-center justify-center text-gray-600 backdrop-blur-sm hover:bg-white hover:text-red-500'><HugeiconsIcon icon={Delete01Icon} size={14} /></button>
        </div>
      </div>
      <div className='px-4 py-3'>
        <h3 className='text-[14px] font-semibold text-gray-900 truncate'>{M.address}</h3>
        <div className='mt-1.5 flex items-center justify-between'>
          <div className='flex items-center gap-1.5 text-[12px] text-gray-400'>
            <span>{M.type}</span><span className='text-gray-200'>·</span><span>{M.cls}</span>
          </div>
          <div className='flex items-center gap-2'>
            <span className='flex items-center gap-1 text-[11px] text-gray-400'>
              <HugeiconsIcon icon={Clock01Icon} size={12} color='currentColor' strokeWidth={1.5} />
              {M.deadline}
            </span>
            <span className='size-1.5 rounded-full bg-emerald-500' />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══════ V5: Overlay + left accent stripe + minimal footer ═══════ */
function C5() {
  return (
    <div className='group overflow-hidden rounded-xl border border-blue-100/80 bg-gradient-to-br from-white via-white to-blue-50/40 transition-all duration-200 hover:border-blue-200 hover:shadow-sm'>
      <div className='relative h-36 bg-gray-100 flex items-center justify-center'>
        <HugeiconsIcon icon={Image01Icon} size={32} color='currentColor' strokeWidth={1} className='text-gray-300' />
        <div className='absolute left-3 bottom-3 flex items-center gap-2'>
          <span className='rounded-md bg-black/60 px-2 py-1 text-[13px] font-bold text-white backdrop-blur-sm'>{M.price}</span>
          <span className='rounded-full bg-emerald-500/90 px-2 py-0.5 text-[10px] font-semibold text-white backdrop-blur-sm'>{M.status}</span>
        </div>
        <div className='absolute right-3 top-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity'>
          <button type='button' className='size-7 rounded-md bg-white/80 flex items-center justify-center text-gray-600 backdrop-blur-sm hover:bg-white'><HugeiconsIcon icon={Edit01Icon} size={14} /></button>
          <button type='button' className='size-7 rounded-md bg-white/80 flex items-center justify-center text-gray-600 backdrop-blur-sm hover:bg-white hover:text-red-500'><HugeiconsIcon icon={Delete01Icon} size={14} /></button>
        </div>
      </div>
      <div className='flex items-stretch'>
        <div className='w-1 bg-gradient-to-b from-blue-500 to-blue-600' />
        <div className='flex-1 px-4 py-3'>
          <h3 className='text-[14px] font-semibold text-gray-900 truncate'>{M.address}</h3>
          <div className='mt-1 flex items-center gap-3 text-[12px] text-gray-400'>
            <span>{M.type} · {M.cls}</span>
            <span className='text-gray-200'>|</span>
            <span>{M.area}</span>
            <span className='text-gray-200'>|</span>
            <span>до {M.deadline}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   AUCTION CARDS — 5 вариантов
   ═══════════════════════════════════════════ */

const AUC = { num: 142, status: 'Активный', mode: 'Закрытый', price: '8 200 000 ₸', bids: '12 ставок', min: '5 000 000 ₸', pct: 65 };

/* A1: Текущий — статус+цена сверху, прогресс, footer */
function A1() {
  return (
    <div className='group rounded-xl border border-blue-100/80 bg-gradient-to-br from-white via-white to-blue-50/40 p-5 transition-all duration-200 hover:border-blue-200 hover:shadow-sm'>
      <div className='flex items-start justify-between'>
        <div>
          <h3 className='text-[14px] font-semibold text-gray-900'>Аукцион #{AUC.num}</h3>
          <div className='mt-1 flex items-center gap-1.5'>
            <span className='size-1.5 rounded-full bg-emerald-500' />
            <span className='text-[11px] font-medium text-emerald-600'>{AUC.status}</span>
            <span className='text-[11px] text-gray-300'>·</span>
            <span className='text-[11px] text-gray-400'>{AUC.mode}</span>
          </div>
        </div>
        <span className='text-[17px] font-bold text-gray-900'>{AUC.price}</span>
      </div>
      <div className='mt-4'>
        <div className='mb-1 flex justify-between text-[11px]'>
          <span className='text-gray-400'>{AUC.bids} · мин. {AUC.min}</span>
          <span className='font-semibold text-gray-500'>{AUC.pct}%</span>
        </div>
        <div className='h-1 overflow-hidden rounded-full bg-gray-100'><div className='h-full rounded-full bg-blue-500' style={{ width: `${AUC.pct}%` }} /></div>
      </div>
      <div className='mt-3 flex items-center gap-3 border-t border-blue-50 pt-3 text-[12px] text-gray-400'>
        <span className='flex items-center gap-1'><HugeiconsIcon icon={Award01Icon} size={13} color='currentColor' strokeWidth={1.5} className='text-gray-300' />{AUC.bids}</span>
        <span className='flex items-center gap-1'><HugeiconsIcon icon={Clock01Icon} size={13} color='currentColor' strokeWidth={1.5} className='text-gray-300' />до 15 апр</span>
      </div>
    </div>
  );
}

/* A2: Цена крупно сверху, компактный прогресс + мета строка */
function A2() {
  return (
    <div className='group rounded-xl border border-blue-100/80 bg-gradient-to-br from-white via-white to-blue-50/40 p-5 transition-all duration-200 hover:border-blue-200 hover:shadow-sm'>
      <div className='flex items-center justify-between'>
        <span className='text-[12px] font-medium text-gray-400'>Аукцион #{AUC.num}</span>
        <span className='inline-flex items-center gap-1'>
          <span className='size-1.5 rounded-full bg-emerald-500' />
          <span className='text-[11px] font-medium text-emerald-600'>{AUC.status}</span>
        </span>
      </div>
      <span className='mt-2 block text-xl font-bold tracking-tight text-gray-900'>{AUC.price}</span>
      <div className='mt-3 h-1 overflow-hidden rounded-full bg-gray-100'><div className='h-full rounded-full bg-blue-500' style={{ width: `${AUC.pct}%` }} /></div>
      <div className='mt-2 flex items-center justify-between text-[11px] text-gray-400'>
        <span>мин. {AUC.min}</span>
        <span>{AUC.bids} · {AUC.pct}%</span>
      </div>
    </div>
  );
}

/* A3: Split — прогресс вверху как accent bar, данные внизу */
function A3() {
  return (
    <div className='group overflow-hidden rounded-xl border border-blue-100/80 bg-gradient-to-br from-white via-white to-blue-50/40 transition-all duration-200 hover:border-blue-200 hover:shadow-sm'>
      <div className='h-1.5 bg-gray-100'><div className='h-full bg-blue-500' style={{ width: `${AUC.pct}%` }} /></div>
      <div className='p-5'>
        <div className='flex items-center justify-between'>
          <h3 className='text-[14px] font-semibold text-gray-900'>Аукцион #{AUC.num}</h3>
          <span className='rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-700'>{AUC.status}</span>
        </div>
        <span className='mt-2 block text-xl font-bold tracking-tight text-gray-900'>{AUC.price}</span>
        <div className='mt-3 flex items-center gap-4 text-[12px] text-gray-400'>
          <span>мин. {AUC.min}</span>
          <span>{AUC.bids}</span>
          <span>{AUC.mode}</span>
          <span className='ml-auto font-medium text-gray-500'>{AUC.pct}%</span>
        </div>
      </div>
    </div>
  );
}

/* A4: Две колонки внутри — цены слева, мета справа */
function A4() {
  return (
    <div className='group rounded-xl border border-blue-100/80 bg-gradient-to-br from-white via-white to-blue-50/40 p-5 transition-all duration-200 hover:border-blue-200 hover:shadow-sm'>
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-2'>
          <div className='flex size-9 items-center justify-center rounded-lg bg-blue-50'>
            <HugeiconsIcon icon={Award01Icon} size={18} color='currentColor' strokeWidth={1.5} className='text-blue-600' />
          </div>
          <div>
            <h3 className='text-[13px] font-semibold text-gray-900'>Аукцион #{AUC.num}</h3>
            <span className='text-[11px] text-gray-400'>{AUC.mode}</span>
          </div>
        </div>
        <span className='inline-flex items-center gap-1'>
          <span className='size-1.5 rounded-full bg-emerald-500' />
          <span className='text-[11px] font-medium text-emerald-600'>{AUC.status}</span>
        </span>
      </div>
      <div className='mt-4 grid grid-cols-2 gap-3'>
        <div className='rounded-lg bg-gray-50/80 p-3'>
          <span className='text-[10px] font-semibold uppercase tracking-widest text-gray-400'>Текущая</span>
          <span className='mt-0.5 block text-[14px] font-bold text-gray-900'>{AUC.price}</span>
        </div>
        <div className='rounded-lg bg-gray-50/80 p-3'>
          <span className='text-[10px] font-semibold uppercase tracking-widest text-gray-400'>Мин. цена</span>
          <span className='mt-0.5 block text-[14px] font-bold text-gray-900'>{AUC.min}</span>
        </div>
      </div>
      <div className='mt-3 h-1 overflow-hidden rounded-full bg-gray-100'><div className='h-full rounded-full bg-blue-500' style={{ width: `${AUC.pct}%` }} /></div>
      <div className='mt-1.5 flex items-center justify-between text-[11px] text-gray-400'>
        <span>{AUC.bids}</span>
        <span>{AUC.pct}% времени</span>
      </div>
    </div>
  );
}

/* A5: Compact — left accent stripe + одна строка инфо */
function A5() {
  return (
    <div className='group overflow-hidden rounded-xl border border-blue-100/80 bg-gradient-to-br from-white via-white to-blue-50/40 transition-all duration-200 hover:border-blue-200 hover:shadow-sm'>
      <div className='flex items-stretch'>
        <div className='w-1 bg-gradient-to-b from-blue-500 to-blue-600' />
        <div className='flex-1 p-5'>
          <div className='flex items-center justify-between'>
            <h3 className='text-[14px] font-semibold text-gray-900'>Аукцион #{AUC.num}</h3>
            <span className='text-[17px] font-bold text-gray-900'>{AUC.price}</span>
          </div>
          <div className='mt-3 h-1 overflow-hidden rounded-full bg-gray-100'><div className='h-full rounded-full bg-blue-500' style={{ width: `${AUC.pct}%` }} /></div>
          <div className='mt-2 flex items-center justify-between text-[11px] text-gray-400'>
            <div className='flex items-center gap-3'>
              <span className='inline-flex items-center gap-1'><span className='size-1.5 rounded-full bg-emerald-500' />{AUC.status}</span>
              <span>{AUC.mode}</span>
              <span>{AUC.bids}</span>
            </div>
            <span>мин. {AUC.min}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════ */

export default function ReviewDesignPage() {
  return (
    <div className='w-full px-8 py-8'>
      <div>
        <h1 className='text-xl font-semibold tracking-tight text-gray-900'>Карточки объектов и аукционов</h1>
        <p className='mt-0.5 text-[13px] text-gray-500'>5 вариантов для каждого типа. Выбери лучшие.</p>
      </div>

      {/* ── PROPERTY CARDS ── */}
      <h2 className='mt-10 text-[15px] font-semibold text-gray-900'>Карточка объекта (Property Card)</h2>
      <div className='mt-1 mb-6 h-px bg-gray-100' />

      <div className='space-y-10'>
        <div>
          <V n={1} name='Overlay + dot-статус + мета строка' />
          <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4'><C1 /><C1 /><C1 /><C1 /></div>
        </div>
        <div>
          <V n={2} name='Overlay + бейджи type/class на фото' />
          <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4'><C2 /><C2 /><C2 /><C2 /></div>
        </div>
        <div>
          <V n={3} name='Overlay + area badge справа + footer' />
          <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4'><C3 /><C3 /><C3 /><C3 /></div>
        </div>
        <div>
          <V n={4} name='Gradient overlay снизу + deadline' />
          <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4'><C4 /><C4 /><C4 /><C4 /></div>
        </div>
        <div>
          <V n={5} name='Overlay + left accent stripe' />
          <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4'><C5 /><C5 /><C5 /><C5 /></div>
        </div>
      </div>

      {/* ── AUCTION CARDS ── */}
      <h2 className='mt-14 text-[15px] font-semibold text-gray-900'>Карточка аукциона (Auction Card)</h2>
      <div className='mt-1 mb-6 h-px bg-gray-100' />

      <div className='space-y-10'>
        <div>
          <V n={1} name='Статус + цена + прогресс + footer' />
          <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4'><A1 /><A1 /><A1 /><A1 /></div>
        </div>
        <div>
          <V n={2} name='Цена крупно + компактный прогресс' />
          <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4'><A2 /><A2 /><A2 /><A2 /></div>
        </div>
        <div>
          <V n={3} name='Top accent bar + pill статус' />
          <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4'><A3 /><A3 /><A3 /><A3 /></div>
        </div>
        <div>
          <V n={4} name='Иконка + два price блока' />
          <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4'><A4 /><A4 /><A4 /><A4 /></div>
        </div>
        <div>
          <V n={5} name='Left accent stripe + inline всё' />
          <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4'><A5 /><A5 /><A5 /><A5 /></div>
        </div>
      </div>

      {/* ── AUCTION DETAIL PAGE LAYOUTS ── */}
      <h2 className='mt-14 text-[15px] font-semibold text-gray-900'>Страница деталей аукциона (Auction Detail)</h2>
      <div className='mt-1 mb-6 h-px bg-gray-100' />

      <div className='space-y-16'>
        {/* ═══ V1: Hero banner сверху + 2 колонки снизу ═══ */}
        <div>
          <V n={1} name='Hero banner + 2-col content' />
          <div className='rounded-xl border border-blue-100/80 bg-gradient-to-br from-white via-white to-blue-50/40 overflow-hidden'>
            {/* Hero */}
            <div className='bg-gradient-to-r from-blue-600 to-blue-700 px-8 py-6 text-white'>
              <div className='flex items-center justify-between'>
                <div>
                  <span className='text-[12px] font-medium text-blue-200'>АУКЦИОН</span>
                  <h2 className='text-2xl font-bold'>#142</h2>
                </div>
                <div className='text-right'>
                  <span className='text-[12px] font-medium text-blue-200'>ТЕКУЩАЯ СТАВКА</span>
                  <div className='text-2xl font-bold'>8 200 000 ₸</div>
                </div>
              </div>
              <div className='mt-4 h-1.5 rounded-full bg-white/20'><div className='h-full w-[65%] rounded-full bg-white/80' /></div>
              <div className='mt-2 flex items-center justify-between text-[12px] text-blue-200'>
                <span>12 ставок · Закрытый</span>
                <span>65% времени</span>
              </div>
            </div>
            {/* KPI row */}
            <div className='grid grid-cols-4 divide-x divide-blue-50 border-b border-blue-50'>
              {[{l:'Мин. цена',v:'5 000 000 ₸'},{l:'Участников',v:'8'},{l:'Начало',v:'01.03.2026'},{l:'Окончание',v:'15.04.2026'}].map(d=>(
                <div key={d.l} className='px-6 py-4'><span className='text-[11px] font-semibold uppercase tracking-widest text-gray-400'>{d.l}</span><span className='mt-1 block text-[14px] font-semibold text-gray-900'>{d.v}</span></div>
              ))}
            </div>
            {/* 2-col content */}
            <div className='grid grid-cols-3 divide-x divide-blue-50'>
              <div className='col-span-2 p-6'>
                <h3 className='text-[14px] font-semibold text-gray-900 flex items-center gap-2'><HugeiconsIcon icon={Coins01Icon} size={18} className='text-gray-400' />Ставки</h3>
                <div className='mt-4 space-y-2'>
                  {['Иван Петров — 8 200 000 ₸','Мария Сидорова — 7 800 000 ₸','Алексей Ким — 6 500 000 ₸'].map(s=>(
                    <div key={s} className='flex items-center justify-between rounded-lg bg-gray-50/80 px-4 py-3 text-[13px]'><span className='text-gray-900 font-medium'>{s.split('—')[0]}</span><span className='font-semibold text-gray-900'>{s.split('—')[1]}</span></div>
                  ))}
                </div>
              </div>
              <div className='p-6'>
                <h3 className='text-[14px] font-semibold text-gray-900 flex items-center gap-2'><HugeiconsIcon icon={UserIcon} size={18} className='text-gray-400' />Участники (8)</h3>
                <div className='mt-4 space-y-2'>
                  {['Иван Петров','Мария Сидорова','Алексей Ким','Ольга Смирнова'].map(n=>(
                    <div key={n} className='flex items-center gap-3 py-2'><div className='size-7 rounded-full bg-blue-100 flex items-center justify-center text-[10px] font-bold text-blue-600'>{n[0]}</div><span className='text-[13px] font-medium text-gray-900'>{n}</span></div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ═══ V2: KPI cards сверху + tabs-style content ═══ */}
        <div>
          <V n={2} name='KPI cards row + секции ниже' />
          <div className='space-y-4'>
            {/* KPI row */}
            <div className='grid grid-cols-5 gap-3'>
              {[
                {l:'Текущая ставка',v:'8 200 000 ₸',accent:true},
                {l:'Мин. цена',v:'5 000 000 ₸'},
                {l:'Ставок',v:'12'},
                {l:'Участников',v:'8'},
                {l:'Прогресс',v:'65%'},
              ].map(d=>(
                <div key={d.l} className={`rounded-xl border p-4 ${d.accent ? 'border-blue-200 bg-blue-50/50' : 'border-blue-100/80 bg-gradient-to-br from-white via-white to-blue-50/40'}`}>
                  <span className='text-[11px] font-semibold uppercase tracking-widest text-gray-400'>{d.l}</span>
                  <span className={`mt-1 block text-[17px] font-bold ${d.accent ? 'text-blue-700' : 'text-gray-900'}`}>{d.v}</span>
                </div>
              ))}
            </div>
            {/* Info + Participants side by side */}
            <div className='grid grid-cols-3 gap-4'>
              <div className='col-span-2 rounded-xl border border-blue-100/80 bg-gradient-to-br from-white via-white to-blue-50/40 p-6'>
                <div className='flex items-center justify-between'>
                  <h3 className='text-[14px] font-semibold text-gray-900'>Аукцион #142</h3>
                  <div className='flex items-center gap-2'>
                    <span className='inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-medium text-emerald-700'><span className='size-1.5 rounded-full bg-emerald-500'/>Активный</span>
                    <span className='rounded-full bg-gray-100 px-2.5 py-0.5 text-[11px] font-medium text-gray-600'>Закрытый</span>
                  </div>
                </div>
                <div className='mt-4 h-1.5 rounded-full bg-gray-100'><div className='h-full w-[65%] rounded-full bg-blue-500'/></div>
                <div className='mt-4 grid grid-cols-4 gap-4'>
                  {[{l:'Начало',v:'01.03.2026 10:00'},{l:'Окончание',v:'15.04.2026 18:00'},{l:'Объект',v:'#78'},{l:'Тип',v:'Закрытый'}].map(d=>(
                    <div key={d.l}><span className='text-[11px] font-semibold uppercase tracking-widest text-gray-400'>{d.l}</span><span className='mt-1 block text-[13px] font-medium text-gray-900'>{d.v}</span></div>
                  ))}
                </div>
                {/* Bids table */}
                <div className='mt-6 border-t border-blue-50 pt-4'>
                  <h4 className='text-[13px] font-semibold text-gray-900 mb-3'>Ставки</h4>
                  <table className='w-full text-left'>
                    <thead><tr className='text-[11px] font-semibold uppercase tracking-widest text-gray-400'><th className='pb-2'>Участник</th><th className='pb-2'>Сумма</th><th className='pb-2'>Дата</th></tr></thead>
                    <tbody className='text-[13px]'>
                      {[{n:'Иван Петров',a:'8 200 000 ₸',d:'15.03.2026'},{n:'Мария Сидорова',a:'7 800 000 ₸',d:'14.03.2026'},{n:'Алексей Ким',a:'6 500 000 ₸',d:'12.03.2026'}].map(b=>(
                        <tr key={b.n} className='border-t border-gray-100'><td className='py-2.5 font-medium text-gray-900'>{b.n}</td><td className='py-2.5 font-medium text-gray-900'>{b.a}</td><td className='py-2.5 text-gray-400'>{b.d}</td></tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              {/* Right */}
              <div className='space-y-4'>
                <div className='rounded-xl border border-blue-100/80 bg-gradient-to-br from-white via-white to-blue-50/40 p-5'>
                  <h3 className='text-[14px] font-semibold text-gray-900 flex items-center gap-2'><HugeiconsIcon icon={UserIcon} size={18} className='text-gray-400'/>Участники (8)</h3>
                  <div className='mt-3 space-y-2'>
                    {['Иван Петров','Мария Сидорова','Алексей Ким','Ольга Смирнова'].map(n=>(
                      <div key={n} className='flex items-center gap-2.5 rounded-lg px-3 py-2 hover:bg-blue-50/20 transition-colors'><div className='size-7 rounded-full bg-blue-100 flex items-center justify-center text-[10px] font-bold text-blue-600'>{n[0]}</div><span className='text-[13px] font-medium text-gray-900'>{n}</span></div>
                    ))}
                  </div>
                </div>
                <div className='rounded-xl border border-blue-100/80 bg-gradient-to-br from-white via-white to-blue-50/40 p-5'>
                  <h3 className='text-[14px] font-semibold text-gray-900 mb-3'>Ваш статус</h3>
                  <div className='space-y-2.5 text-[13px]'>
                    <div className='flex justify-between'><span className='text-gray-500'>Участие</span><span className='rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-700'>Участвуете</span></div>
                    <div className='flex justify-between'><span className='text-gray-500'>Ставка</span><span className='font-medium text-gray-900'>7 800 000 ₸</span></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ═══ V3: Compact single column ═══ */}
        <div>
          <V n={3} name='Компактный single-column' />
          <div className='max-w-3xl space-y-4'>
            {/* Header card */}
            <div className='rounded-xl border border-blue-100/80 bg-gradient-to-br from-white via-white to-blue-50/40 p-6'>
              <div className='flex items-center justify-between'>
                <div>
                  <h2 className='text-xl font-bold text-gray-900'>Аукцион #142</h2>
                  <div className='mt-1 flex items-center gap-2'>
                    <span className='inline-flex items-center gap-1 text-[12px] font-medium text-emerald-600'><span className='size-1.5 rounded-full bg-emerald-500'/>Активный</span>
                    <span className='text-[12px] text-gray-400'>· Закрытый · Объект #78</span>
                  </div>
                </div>
                <div className='text-right'>
                  <span className='text-[11px] text-gray-400'>Текущая ставка</span>
                  <div className='text-xl font-bold text-gray-900'>8 200 000 ₸</div>
                </div>
              </div>
              <div className='mt-4 h-1.5 rounded-full bg-gray-100'><div className='h-full w-[65%] rounded-full bg-blue-500'/></div>
              <div className='mt-3 grid grid-cols-5 gap-4'>
                {[{l:'Мин. цена',v:'5M ₸'},{l:'Ставок',v:'12'},{l:'Участников',v:'8'},{l:'Начало',v:'01.03'},{l:'Конец',v:'15.04'}].map(d=>(
                  <div key={d.l}><span className='text-[11px] font-semibold uppercase tracking-widest text-gray-400'>{d.l}</span><span className='mt-0.5 block text-[13px] font-medium text-gray-900'>{d.v}</span></div>
                ))}
              </div>
            </div>
            {/* Bids */}
            <div className='rounded-xl border border-blue-100/80 bg-gradient-to-br from-white via-white to-blue-50/40 overflow-hidden'>
              <div className='px-6 py-4 border-b border-blue-50 flex items-center justify-between'>
                <h3 className='text-[14px] font-semibold text-gray-900'>Ставки</h3>
                <span className='text-[12px] text-gray-400'>12 всего</span>
              </div>
              {['Иван Петров|8 200 000 ₸|15.03','Мария Сидорова|7 800 000 ₸|14.03','Алексей Ким|6 500 000 ₸|12.03'].map(s=>{const[n,a,d]=s.split('|');return(
                <div key={n} className='flex items-center justify-between px-6 py-3 border-b border-gray-100 last:border-0 hover:bg-blue-50/20 transition-colors'>
                  <div className='flex items-center gap-3'><div className='size-7 rounded-full bg-blue-100 flex items-center justify-center text-[10px] font-bold text-blue-600'>{n[0]}</div><span className='text-[13px] font-medium text-gray-900'>{n}</span></div>
                  <div className='flex items-center gap-4'><span className='text-[12px] text-gray-400'>{d}</span><span className='text-[14px] font-bold text-gray-900'>{a}</span></div>
                </div>
              );})}
            </div>
            {/* Participants */}
            <div className='rounded-xl border border-blue-100/80 bg-gradient-to-br from-white via-white to-blue-50/40 overflow-hidden'>
              <div className='px-6 py-4 border-b border-blue-50'><h3 className='text-[14px] font-semibold text-gray-900'>Участники (8)</h3></div>
              <div className='grid grid-cols-2 divide-x divide-blue-50'>
                {['Иван Петров','Мария Сидорова','Алексей Ким','Ольга Смирнова'].map(n=>(
                  <div key={n} className='flex items-center gap-3 px-6 py-3 border-b border-gray-100'><div className='size-7 rounded-full bg-blue-100 flex items-center justify-center text-[10px] font-bold text-blue-600'>{n[0]}</div><span className='text-[13px] font-medium text-gray-900'>{n}</span></div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ═══ V4: Sidebar right — info sticky ═══ */}
        <div>
          <V n={4} name='Sticky sidebar справа с ценой' />
          <div className='grid grid-cols-3 gap-4'>
            {/* Main */}
            <div className='col-span-2 space-y-4'>
              <div className='rounded-xl border border-blue-100/80 bg-gradient-to-br from-white via-white to-blue-50/40 p-6'>
                <h3 className='text-[14px] font-semibold text-gray-900 flex items-center gap-2'><HugeiconsIcon icon={Award01Icon} size={18} className='text-gray-400'/>Информация</h3>
                <div className='mt-4 grid grid-cols-3 gap-4'>
                  {[{l:'Статус',v:'Активный',badge:true},{l:'Тип',v:'Закрытый'},{l:'Ставок',v:'12'},{l:'Участников',v:'8'},{l:'Начало',v:'01.03.2026 10:00'},{l:'Окончание',v:'15.04.2026 18:00'}].map(d=>(
                    <div key={d.l}>
                      <span className='text-[11px] font-semibold uppercase tracking-widest text-gray-400'>{d.l}</span>
                      {d.badge ? <div className='mt-1'><span className='inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-700'><span className='size-1.5 rounded-full bg-emerald-500'/>{d.v}</span></div> : <span className='mt-1 block text-[13px] font-medium text-gray-900'>{d.v}</span>}
                    </div>
                  ))}
                </div>
              </div>
              <div className='rounded-xl border border-blue-100/80 bg-gradient-to-br from-white via-white to-blue-50/40 p-6'>
                <h3 className='text-[14px] font-semibold text-gray-900 flex items-center gap-2 mb-4'><HugeiconsIcon icon={Coins01Icon} size={18} className='text-gray-400'/>Ставки</h3>
                <table className='w-full text-left'>
                  <thead><tr className='text-[11px] font-semibold uppercase tracking-widest text-gray-400 border-b border-gray-100'><th className='pb-2'>Участник</th><th className='pb-2'>Сумма</th><th className='pb-2'>Дата</th><th className='pb-2 w-20'/></tr></thead>
                  <tbody className='text-[13px]'>
                    {[{n:'Иван Петров',a:'8 200 000 ₸',d:'15.03.2026',w:true},{n:'Мария Сидорова',a:'7 800 000 ₸',d:'14.03.2026'},{n:'Алексей Ким',a:'6 500 000 ₸',d:'12.03.2026'}].map(b=>(
                      <tr key={b.n} className='border-b border-gray-100 last:border-0'><td className='py-3 font-medium text-gray-900'>{b.n}</td><td className='py-3 font-semibold text-gray-900'>{b.a}</td><td className='py-3 text-gray-400'>{b.d}</td><td className='py-3'>{b.w&&<span className='rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-medium text-emerald-700'>Лидер</span>}</td></tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className='rounded-xl border border-blue-100/80 bg-gradient-to-br from-white via-white to-blue-50/40 p-6'>
                <h3 className='text-[14px] font-semibold text-gray-900 flex items-center gap-2'><HugeiconsIcon icon={UserIcon} size={18} className='text-gray-400'/>Участники (8)</h3>
                <div className='mt-3 grid grid-cols-2 gap-2'>
                  {['Иван Петров','Мария Сидорова','Алексей Ким','Ольга Смирнова','Дмитрий Ли','Анна Козлова'].map(n=>(
                    <div key={n} className='flex items-center gap-2.5 rounded-lg border border-gray-100 px-3 py-2.5'><div className='size-7 rounded-full bg-blue-100 flex items-center justify-center text-[10px] font-bold text-blue-600'>{n[0]}</div><div><span className='text-[13px] font-medium text-gray-900'>{n}</span></div></div>
                  ))}
                </div>
              </div>
            </div>
            {/* Sidebar */}
            <div className='space-y-4'>
              <div className='rounded-xl border border-blue-100/80 bg-gradient-to-br from-white via-white to-blue-50/40 p-5'>
                <span className='text-[11px] font-semibold uppercase tracking-widest text-gray-400'>Текущая ставка</span>
                <span className='mt-1 block text-2xl font-bold text-gray-900'>8 200 000 ₸</span>
                <div className='mt-3 h-1.5 rounded-full bg-gray-100'><div className='h-full w-[65%] rounded-full bg-blue-500'/></div>
                <span className='mt-1.5 block text-[11px] text-gray-400'>65% времени · мин. 5 000 000 ₸</span>
                <button type='button' className='mt-4 w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg py-2.5 text-[13px] font-medium'>Сделать ставку</button>
              </div>
              <div className='rounded-xl border border-blue-100/80 bg-gradient-to-br from-white via-white to-blue-50/40 p-5'>
                <h3 className='text-[14px] font-semibold text-gray-900 mb-3'>Ваш статус</h3>
                <div className='space-y-2.5 text-[13px]'>
                  <div className='flex justify-between'><span className='text-gray-500'>Участие</span><span className='rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-700'>Участвуете</span></div>
                  <div className='flex justify-between'><span className='text-gray-500'>Ваша ставка</span><span className='font-semibold text-gray-900'>7 800 000 ₸</span></div>
                  <div className='flex justify-between'><span className='text-gray-500'>Позиция</span><span className='font-medium text-gray-900'>2-е место</span></div>
                </div>
              </div>
              <div className='rounded-xl border border-blue-100/80 bg-gradient-to-br from-white via-white to-blue-50/40 p-5'>
                <h3 className='text-[14px] font-semibold text-gray-900 mb-3 flex items-center gap-2'><HugeiconsIcon icon={Clock01Icon} size={16} className='text-gray-400'/>Сроки</h3>
                <div className='space-y-2.5 text-[13px]'>
                  <div className='flex justify-between'><span className='text-gray-400'>Начало</span><span className='font-medium text-gray-900'>01.03.2026</span></div>
                  <div className='flex justify-between'><span className='text-gray-400'>Окончание</span><span className='font-medium text-gray-900'>15.04.2026</span></div>
                  <div className='flex justify-between'><span className='text-gray-400'>Осталось</span><span className='font-semibold text-orange-600'>12д 5ч</span></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ═══ V5: Full-width top bar + tabs-like sections ═══ */}
        <div>
          <V n={5} name='Top info bar + секции в ряд' />
          <div className='space-y-4'>
            {/* Top bar */}
            <div className='rounded-xl border border-blue-100/80 bg-gradient-to-br from-white via-white to-blue-50/40 px-6 py-4 flex items-center justify-between'>
              <div className='flex items-center gap-4'>
                <h2 className='text-xl font-bold text-gray-900'>Аукцион #142</h2>
                <span className='inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-medium text-emerald-700'><span className='size-1.5 rounded-full bg-emerald-500'/>Активный</span>
                <span className='rounded-full bg-gray-100 px-2.5 py-0.5 text-[11px] font-medium text-gray-600'>Закрытый</span>
              </div>
              <div className='flex items-center gap-6'>
                <div className='text-right'><span className='text-[11px] text-gray-400'>Текущая</span><span className='block text-[17px] font-bold text-gray-900'>8 200 000 ₸</span></div>
                <div className='text-right'><span className='text-[11px] text-gray-400'>Мин.</span><span className='block text-[14px] font-medium text-gray-500'>5 000 000 ₸</span></div>
                <button type='button' className='bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg px-5 py-2.5 text-[13px] font-medium'>Сделать ставку</button>
              </div>
            </div>
            {/* Progress */}
            <div className='rounded-xl border border-blue-100/80 bg-gradient-to-br from-white via-white to-blue-50/40 px-6 py-3'>
              <div className='flex items-center gap-4'>
                <span className='text-[12px] text-gray-500 shrink-0'>Прогресс</span>
                <div className='flex-1 h-2 rounded-full bg-gray-100'><div className='h-full w-[65%] rounded-full bg-blue-500'/></div>
                <span className='text-[12px] font-semibold text-gray-500 shrink-0'>65%</span>
                <span className='text-[12px] text-gray-400 shrink-0'>12 ставок</span>
                <span className='text-[12px] text-gray-400 shrink-0'>8 участников</span>
              </div>
            </div>
            {/* 3-col sections */}
            <div className='grid grid-cols-3 gap-4'>
              <div className='rounded-xl border border-blue-100/80 bg-gradient-to-br from-white via-white to-blue-50/40 p-5'>
                <h3 className='text-[14px] font-semibold text-gray-900 flex items-center gap-2 mb-3'><HugeiconsIcon icon={Clock01Icon} size={16} className='text-gray-400'/>Детали</h3>
                <div className='space-y-2.5 text-[13px]'>
                  {[{l:'Объект',v:'#78'},{l:'Начало',v:'01.03.2026 10:00'},{l:'Окончание',v:'15.04.2026 18:00'},{l:'Осталось',v:'12д 5ч'}].map(d=>(
                    <div key={d.l} className='flex justify-between'><span className='text-gray-400'>{d.l}</span><span className='font-medium text-gray-900'>{d.v}</span></div>
                  ))}
                </div>
              </div>
              <div className='rounded-xl border border-blue-100/80 bg-gradient-to-br from-white via-white to-blue-50/40 p-5'>
                <h3 className='text-[14px] font-semibold text-gray-900 flex items-center gap-2 mb-3'><HugeiconsIcon icon={Coins01Icon} size={16} className='text-gray-400'/>Топ ставки</h3>
                <div className='space-y-2'>
                  {[{n:'И. Петров',a:'8.2M ₸',rank:'1'},{n:'М. Сидорова',a:'7.8M ₸',rank:'2'},{n:'А. Ким',a:'6.5M ₸',rank:'3'}].map(b=>(
                    <div key={b.n} className='flex items-center justify-between py-1.5'>
                      <div className='flex items-center gap-2'><span className='size-5 rounded-full bg-gray-100 flex items-center justify-center text-[10px] font-bold text-gray-500'>{b.rank}</span><span className='text-[13px] font-medium text-gray-900'>{b.n}</span></div>
                      <span className='text-[13px] font-semibold text-gray-900'>{b.a}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className='rounded-xl border border-blue-100/80 bg-gradient-to-br from-white via-white to-blue-50/40 p-5'>
                <h3 className='text-[14px] font-semibold text-gray-900 flex items-center gap-2 mb-3'><HugeiconsIcon icon={UserIcon} size={16} className='text-gray-400'/>Участники</h3>
                <div className='space-y-2'>
                  {['Иван Петров','Мария Сидорова','Алексей Ким','Ольга Смирнова'].map(n=>(
                    <div key={n} className='flex items-center gap-2 py-1'><div className='size-6 rounded-full bg-blue-100 flex items-center justify-center text-[9px] font-bold text-blue-600'>{n[0]}</div><span className='text-[13px] text-gray-900'>{n}</span></div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className='mt-16 h-20' />
    </div>
  );
}
