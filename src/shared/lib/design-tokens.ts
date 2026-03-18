export const colors = {
  bg: {
    primary: '#FFFFFF',
    secondary: '#F9FAFB',
    tertiary: '#F3F4F6',
    hover: '#F3F4F6',
    active: '#E5E7EB',
  },
  text: {
    primary: '#111827',
    secondary: '#6B7280',
    tertiary: '#9CA3AF',
    inverse: '#FFFFFF',
  },
  border: {
    default: '#E5E7EB',
    strong: '#D1D5DB',
    input: '#D1D5DB',
  },
  accent: {
    default: '#2563EB',
    light: '#EFF6FF',
    hover: '#1D4ED8',
    text: '#1E40AF',
  },
  status: {
    success: { default: '#10B981', bg: '#ECFDF5', text: '#065F46' },
    error: { default: '#EF4444', bg: '#FEF2F2', text: '#991B1B' },
    warning: { default: '#F59E0B', bg: '#FFFBEB', text: '#92400E' },
    info: { default: '#3B82F6', bg: '#EFF6FF', text: '#1E40AF' },
  },
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 20,
  xl: 24,
  '2xl': 32,
  '3xl': 40,
  '4xl': 48,
  '5xl': 64,
} as const;

export const radius = {
  sm: 6,
  md: 8,
  lg: 12,
  xl: 16,
  full: 9999,
} as const;

export const typography = {
  pageTitle: { size: 28, weight: 700, tracking: '-0.02em' },
  sectionTitle: { size: 18, weight: 600 },
  cardTitle: { size: 15, weight: 600 },
  body: { size: 14, weight: 400, lineHeight: 1.5 },
  small: { size: 13, weight: 400 },
  caption: { size: 12, weight: 500, tracking: '0.05em', transform: 'uppercase' as const },
  kpiNumber: { size: 32, weight: 700, tracking: '-0.02em' },
  kpiLabel: { size: 13, weight: 500 },
} as const;

export const shadows = {
  sm: '0 1px 2px rgba(0,0,0,0.04), 0 1px 3px rgba(0,0,0,0.06)',
  md: '0 4px 12px rgba(0,0,0,0.08)',
  lg: '0 20px 60px rgba(0,0,0,0.15)',
} as const;

/* Tailwind class mappings for convenience:

  BACKGROUNDS:
  bg-primary    → bg-white
  bg-secondary  → bg-[#F9FAFB]
  bg-tertiary   → bg-[#F3F4F6]
  bg-hover      → hover:bg-[#F3F4F6]
  bg-active     → bg-[#E5E7EB]

  TEXT:
  text-primary    → text-[#111827]
  text-secondary  → text-[#6B7280]
  text-tertiary   → text-[#9CA3AF]

  BORDERS:
  border-default  → border-[#E5E7EB]
  border-strong   → border-[#D1D5DB]

  ACCENT:
  accent          → bg-[#2563EB] text-white
  accent-light-bg → bg-[#EFF6FF]
  accent-text     → text-[#2563EB]

  STATUS BADGES:
  success → bg-[#ECFDF5] text-[#065F46]
  error   → bg-[#FEF2F2] text-[#991B1B]
  warning → bg-[#FFFBEB] text-[#92400E]
  info    → bg-[#EFF6FF] text-[#1E40AF]

  TYPOGRAPHY:
  page-title   → text-[28px] font-bold tracking-[-0.02em] text-[#111827]
  section-title → text-[18px] font-semibold text-[#111827]
  card-title   → text-[15px] font-semibold text-[#111827]
  body         → text-[14px] text-[#111827] leading-relaxed
  small        → text-[13px] text-[#6B7280]
  caption      → text-[12px] font-medium uppercase tracking-[0.05em] text-[#9CA3AF]
  kpi-number   → text-[32px] font-bold tracking-[-0.02em] text-[#111827]
  kpi-label    → text-[13px] font-medium text-[#6B7280]

  RADIUS:
  cards    → rounded-xl (12px)
  buttons  → rounded-lg (8px)
  badges   → rounded-full (pill) or rounded-md (6px)
  inputs   → rounded-lg (8px)

  SHADOWS:
  card → shadow-sm (use EITHER border OR shadow, not both)
*/
