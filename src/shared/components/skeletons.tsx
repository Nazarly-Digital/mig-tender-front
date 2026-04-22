import { cn } from '@/shared/lib/cn';

function Bone({ className }: { className?: string }) {
  return <div className={cn('animate-pulse rounded-md bg-gray-200/60', className)} />;
}

/* ── Card grid skeleton (Properties / Auctions / Catalog) ── */
export function CardGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className='overflow-hidden rounded-xl border border-blue-100/80 bg-gradient-to-br from-white via-white to-blue-50/40'>
          <Bone className='h-44 rounded-none rounded-t-xl' />
          <div className='p-4 space-y-3'>
            <Bone className='h-4 w-3/4' />
            <Bone className='h-3 w-1/2' />
            <div className='flex justify-between pt-2'>
              <Bone className='h-5 w-24' />
              <Bone className='h-3 w-16' />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ── Auction card grid skeleton ── */
export function AuctionGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className='rounded-xl border border-blue-100/80 bg-gradient-to-br from-white via-white to-blue-50/40 p-5 space-y-4'>
          <div className='flex justify-between'>
            <div className='space-y-2'>
              <Bone className='h-4 w-28' />
              <Bone className='h-3 w-20' />
            </div>
            <Bone className='h-5 w-24' />
          </div>
          <div className='space-y-1.5'>
            <Bone className='h-1 w-full' />
            <div className='flex justify-between'>
              <Bone className='h-3 w-32' />
              <Bone className='h-3 w-8' />
            </div>
          </div>
          <div className='flex gap-3 pt-2 border-t border-blue-50'>
            <Bone className='h-3 w-20' />
            <Bone className='h-3 w-24' />
          </div>
        </div>
      ))}
    </div>
  );
}

/* ── Table skeleton (Admin users / properties) ── */
export function TableSkeleton({ rows = 6, cols = 5 }: { rows?: number; cols?: number }) {
  return (
    <div className='overflow-hidden rounded-xl border border-blue-100/80 bg-gradient-to-br from-white via-white to-blue-50/40'>
      {/* Header */}
      <div className='flex gap-4 px-5 py-3 bg-gray-50/50'>
        {Array.from({ length: cols }).map((_, i) => (
          <Bone key={i} className='h-3 flex-1' />
        ))}
      </div>
      {/* Rows */}
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} className='flex gap-4 px-5 py-3.5 border-t border-gray-100'>
          {Array.from({ length: cols }).map((_, c) => (
            <Bone key={c} className={cn('h-3 flex-1', c === 0 && 'w-32', c === cols - 1 && 'w-20')} />
          ))}
        </div>
      ))}
    </div>
  );
}

/* ── KPI cards skeleton (Dashboard) ── */
export function StatCardsSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3'>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className='rounded-xl border border-blue-100/80 bg-gradient-to-br from-white via-white to-blue-50/40 p-5 space-y-3'>
          <div className='flex items-center gap-2.5'>
            <Bone className='size-8 rounded-lg' />
            <Bone className='h-3 w-24' />
          </div>
          <Bone className='h-7 w-16' />
          <div className='border-t border-blue-50 pt-3'>
            <Bone className='h-3 w-20' />
          </div>
        </div>
      ))}
    </div>
  );
}

/* ── Recent list skeleton (Dashboard) ── */
export function RecentListSkeleton() {
  return (
    <div className='overflow-hidden rounded-xl border border-blue-100/80 bg-gradient-to-br from-white via-white to-blue-50/40'>
      <div className='flex justify-between px-5 py-4 border-b border-blue-50'>
        <Bone className='h-4 w-36' />
        <Bone className='h-3 w-12' />
      </div>
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className='flex items-center gap-3 px-5 py-3 border-b border-gray-100 last:border-0'>
          <Bone className='size-8 rounded-lg shrink-0' />
          <div className='flex-1 space-y-1.5'>
            <Bone className='h-3.5 w-3/4' />
            <Bone className='h-2.5 w-1/2' />
          </div>
          <Bone className='h-5 w-16 rounded-full' />
        </div>
      ))}
    </div>
  );
}

/* ── Detail page skeleton (Property detail / generic) ── */
export function DetailPageSkeleton() {
  return (
    <div className='w-full px-8 py-8 space-y-4'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-3'>
          <Bone className='size-9 rounded-lg' />
          <div className='space-y-2'>
            <Bone className='h-5 w-40' />
            <Bone className='h-3 w-24' />
          </div>
        </div>
        <Bone className='h-10 w-36 rounded-lg' />
      </div>
      {/* KPI row */}
      <div className='grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5'>
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className='rounded-xl border border-blue-100/80 bg-gradient-to-br from-white via-white to-blue-50/40 p-4 space-y-2'>
            <Bone className='h-3 w-20' />
            <Bone className='h-5 w-24' />
          </div>
        ))}
      </div>
      {/* Content */}
      <div className='grid grid-cols-1 gap-4 xl:grid-cols-3'>
        <div className='xl:col-span-2 space-y-4'>
          <div className='rounded-xl border border-blue-100/80 bg-gradient-to-br from-white via-white to-blue-50/40 p-6 space-y-4'>
            <div className='flex justify-between'>
              <Bone className='h-4 w-32' />
              <div className='flex gap-2'><Bone className='h-5 w-16 rounded-full' /><Bone className='h-5 w-20 rounded-full' /></div>
            </div>
            <Bone className='h-1.5 w-full rounded-full' />
            <div className='grid grid-cols-4 gap-4'>
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className='space-y-1.5'><Bone className='h-2.5 w-16' /><Bone className='h-3.5 w-24' /></div>
              ))}
            </div>
          </div>
        </div>
        <div className='space-y-4'>
          <div className='rounded-xl border border-blue-100/80 bg-gradient-to-br from-white via-white to-blue-50/40 p-5 space-y-3'>
            <Bone className='h-4 w-28' />
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className='flex items-center gap-2.5 py-1'>
                <Bone className='size-7 rounded-full' />
                <Bone className='h-3 w-28' />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Auction detail skeleton — 50/50 layout (object info | auction functions) ── */
export function AuctionDetailSkeleton() {
  return (
    <div className='w-full px-8 py-8 space-y-4'>
      {/* Header: back + title/meta + action buttons */}
      <div className='flex items-start justify-between gap-4'>
        <div className='flex items-center gap-3'>
          <Bone className='size-9 rounded-lg' />
          <div className='space-y-2'>
            <Bone className='h-5 w-48' />
            <div className='flex items-center gap-2'>
              <Bone className='h-3 w-28' />
              <Bone className='h-4 w-16 rounded-full' />
            </div>
          </div>
        </div>
        <div className='flex items-center gap-2'>
          <Bone className='h-9 w-28 rounded-lg' />
          <Bone className='h-9 w-24 rounded-lg' />
        </div>
      </div>

      {/* Main: single col < xl · 2/5 + 3/5 at xl · 50/50 at 2xl */}
      <div className='grid grid-cols-1 gap-4 xl:grid-cols-5 2xl:grid-cols-2'>
        {/* LEFT — Object info card with carousel */}
        <div className='space-y-4 order-last xl:order-first xl:col-span-2 2xl:col-span-1'>
          <div className='rounded-xl border border-blue-100/80 bg-gradient-to-br from-white via-white to-blue-50/40 overflow-hidden'>
            {/* Carousel placeholder */}
            <Bone className='h-72 w-full rounded-none sm:h-96' />
            {/* Info content */}
            <div className='p-6 space-y-4'>
              <div className='flex items-center justify-between'>
                <div className='flex items-center gap-2'>
                  <Bone className='size-5 rounded' />
                  <Bone className='h-4 w-40' />
                </div>
                <Bone className='h-3 w-20' />
              </div>
              {/* Inline rows justify-between — only at xl */}
              <div className='hidden xl:block 2xl:hidden space-y-2.5'>
                {Array.from({ length: 7 }).map((_, i) => (
                  <div key={i} className='flex items-center justify-between gap-4'>
                    <Bone className='h-3 w-20' />
                    <Bone className='h-3 w-32' />
                  </div>
                ))}
              </div>

              {/* 2-column grid — default and 2xl+ */}
              <div className='grid grid-cols-2 gap-4 xl:hidden 2xl:grid'>
                {/* Address — full width */}
                <div className='col-span-2 space-y-1.5'>
                  <Bone className='h-2.5 w-14' />
                  <Bone className='h-3.5 w-2/3' />
                </div>
                <div className='space-y-4'>
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className='space-y-1.5'>
                      <Bone className='h-2.5 w-16' />
                      <Bone className='h-3.5 w-32' />
                    </div>
                  ))}
                </div>
                <div className='space-y-4'>
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className='space-y-1.5'>
                      <Bone className='h-2.5 w-16' />
                      <Bone className='h-3.5 w-28' />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT — KPI + auction functions */}
        <div className='space-y-4 xl:col-span-3 2xl:col-span-1'>
          {/* KPI cards — 2 per row inside right column */}
          <div className='grid grid-cols-2 gap-3'>
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className='rounded-xl border border-blue-100/80 bg-gradient-to-br from-white via-white to-blue-50/40 p-4 space-y-2'>
                <Bone className='h-2.5 w-24' />
                <Bone className='h-5 w-20' />
              </div>
            ))}
          </div>

          {/* Info + progress card */}
          <div className='rounded-xl border border-blue-100/80 bg-gradient-to-br from-white via-white to-blue-50/40 p-6 space-y-4'>
            <div className='flex items-center justify-between'>
              <Bone className='h-4 w-32' />
              <div className='flex gap-2'>
                <Bone className='h-5 w-20 rounded-full' />
                <Bone className='h-5 w-16 rounded-full' />
              </div>
            </div>
            <div className='grid grid-cols-2 gap-4'>
              <div className='space-y-1.5'>
                <Bone className='h-2.5 w-14' />
                <Bone className='h-3.5 w-32' />
              </div>
              <div className='space-y-1.5'>
                <Bone className='h-2.5 w-20' />
                <Bone className='h-3.5 w-28' />
              </div>
            </div>
            <Bone className='h-1.5 w-full rounded-full' />
          </div>

          {/* Status / participation card */}
          <div className='rounded-xl border border-blue-100/80 bg-gradient-to-br from-white via-white to-blue-50/40 p-6 space-y-3'>
            <Bone className='h-4 w-28' />
            <div className='flex items-center justify-between'>
              <Bone className='h-3 w-20' />
              <Bone className='h-5 w-24 rounded-full' />
            </div>
            <div className='flex items-center justify-between'>
              <Bone className='h-3 w-20' />
              <Bone className='h-3 w-16' />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Property detail skeleton ── */
export function PropertyDetailSkeleton() {
  return (
    <div className='w-full px-8 py-8 space-y-6'>
      <div className='flex items-center gap-3'>
        <Bone className='size-8 rounded-lg' />
        <div className='space-y-2'><Bone className='h-5 w-48' /><Bone className='h-3 w-32' /></div>
      </div>
      <Bone className='h-72 w-full rounded-xl sm:h-96' />
      <div className='grid grid-cols-1 gap-6 lg:grid-cols-3'>
        <div className='lg:col-span-2 rounded-xl border border-blue-100/80 bg-gradient-to-br from-white via-white to-blue-50/40 p-6 space-y-4'>
          <Bone className='h-4 w-40' />
          <div className='grid grid-cols-3 gap-4'>
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className='space-y-1.5'><Bone className='h-2.5 w-14' /><Bone className='h-3.5 w-20' /></div>
            ))}
          </div>
        </div>
        <div className='space-y-4'>
          <div className='rounded-xl border border-blue-100/80 bg-gradient-to-br from-white via-white to-blue-50/40 p-6 space-y-3'>
            <Bone className='h-2.5 w-12' />
            <Bone className='h-6 w-32' />
          </div>
        </div>
      </div>
    </div>
  );
}
