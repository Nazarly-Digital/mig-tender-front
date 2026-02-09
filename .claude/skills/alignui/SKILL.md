---
name: alignui
description: |
  ALIGN UI Design System — purchased component library with 150+ ready-made React components, design tokens, and patterns.
  Use this skill whenever building UI components, pages, layouts, dashboards, forms, tables, charts, or any visual interface.
  MANDATORY TRIGGERS: UI, component, page, layout, dashboard, form, table, chart, widget, button, input, modal, sidebar, header, design, styling, Tailwind, responsive.
  Always read this skill before writing ANY frontend code to ensure consistency with the ALIGN UI design system.
---

# ALIGN UI Design System

You have access to a professionally designed component library (ALIGN UI) with 150+ components across 3 template projects. Always use these components and patterns as the foundation for any UI work.

## Source Locations

The ALIGN UI source files are at:
```
/Users/ecomnazar/Downloads/ALIGNUI 2/
├── template-finance-master/   # Finance dashboard template
├── marketing-template-master/ # Marketing/Sales dashboard template
└── template-hr-master/        # HR management template
```

Each project contains: `components/ui/` (base components), `components/` (domain-specific), `hooks/`, `utils/`, `lib/`.

**When you need to use a component**: Read the source file from ALIGN UI to understand its exact API, then adapt it for the current project.

## Core Technology Stack

- **Framework**: Next.js 14 + React 18
- **Styling**: Tailwind CSS 3.4 + Tailwind Variants (`tv`)
- **Primitives**: Radix UI (accessible headless components)
- **Icons**: Remixicon React (`@remixicon/react`)
- **Charts**: Recharts + D3
- **Animation**: Framer Motion
- **State**: Jotai (atoms)
- **Tables**: TanStack React Table
- **Themes**: next-themes (light/dark)

## Design Tokens

Read `references/design-tokens.md` for the complete color palette, typography, shadows, and spacing system.

**Quick reference — semantic colors (HSL CSS variables):**
- Background: `bg-white-0`, `bg-weak-50`, `bg-soft-200`, `bg-sub-300`, `bg-surface-800`, `bg-strong-950`
- Text: `text-white-0`, `text-disabled-300`, `text-soft-400`, `text-sub-600`, `text-strong-950`
- Stroke: `stroke-white-0`, `stroke-soft-200`, `stroke-sub-300`, `stroke-strong-950`
- Status: `success-{dark,base,light,lighter}`, `error-{...}`, `warning-{...}`, `information-{...}`

## Component Catalog

Read `references/components-ui.md` for the complete list of 43+ base UI components with their props and APIs.

### Most Used Components (quick reference)

| Component | Variants | Sizes | Key Props |
|-----------|----------|-------|-----------|
| **Button** | primary, neutral, error | medium, small, xsmall, xxsmall | `variant`, `mode` (filled/stroke/lighter/ghost), `asChild` |
| **Input** | — | medium, small, xsmall | `size`, `hasError` |
| **Select** | default, compact, compactForInput, inline | medium, small, xsmall | `size`, `variant`, `hasError` |
| **Badge** | filled, light, lighter, stroke | small, medium | `color` (10 options), `disabled`, `square` |
| **Avatar** | — | 20-80 | `size`, `color`, `placeholderType` |
| **Modal** | — | — | `showClose`, `overlayClassName` |
| **Table** | — | — | TanStack React Table based |
| **Tabs** | horizontal, vertical | — | — |
| **Tooltip** | dark, light | xsmall, small, medium | `variant`, `size`, `sideOffset` |
| **Switch** | — | — | Radix-based toggle |
| **Checkbox** | — | — | `checked`, animated SVG |
| **Tag** | stroke, gray | — | `disabled`, dismissible |
| **Progress Bar** | — | — | `value`, `max` |
| **Segmented Control** | — | — | `defaultValue`, animated bg |

### Domain-Specific Components

Read these references for specialized components:
- `references/components-finance.md` — Widgets, cards, charts, transactions
- `references/components-marketing.md` — Products, orders, analytics, settings
- `references/components-hr.md` — Calendar, time tracking, team management

## Architecture Patterns

### 1. Compound Components
Components use sub-component pattern:
```tsx
<Button.Root variant="primary" mode="filled" size="medium">
  <Button.Icon as={RiAddLine} />
  Add Item
</Button.Root>
```

### 2. Tailwind Variants (tv)
All component styles use `tailwind-variants`:
```tsx
import { tv } from '@/utils/tv';

const buttonVariants = tv({
  slots: {
    root: 'inline-flex items-center justify-center',
    icon: 'size-5',
  },
  variants: {
    variant: {
      primary: { root: 'bg-primary-base text-white' },
      neutral: { root: 'bg-bg-white-0 text-text-strong-950' },
    },
    size: {
      medium: { root: 'h-10 px-3.5 gap-2', icon: 'size-5' },
      small: { root: 'h-9 px-3 gap-1.5', icon: 'size-5' },
    },
  },
  defaultVariants: { variant: 'primary', size: 'medium' },
});
```

### 3. Polymorphic Components
Support rendering as different elements via `asChild` (Radix Slot):
```tsx
<Button.Root asChild>
  <Link href="/dashboard">Go to Dashboard</Link>
</Button.Root>
```

### 4. Recursive Prop Passing
`recursiveCloneChildren` utility passes variant props to nested sub-components automatically:
```tsx
// Parent passes size/variant to all named children
recursiveCloneChildren(children, [ButtonIcon], { size, variant }, [ButtonRoot]);
```

### 5. Utility Functions
```tsx
import { cn, cnExt } from '@/utils/cn';  // clsx + tailwind-merge
import { tv } from '@/utils/tv';          // tailwind-variants with custom config
import { currencyFormatter, compactNumFormatter } from '@/utils/number-formatter';
```

### 6. Hooks
```tsx
import { useBreakpoint } from '@/hooks/use-breakpoint';     // sm, md, lg, xl, 2xl
import { useTabObserver } from '@/hooks/use-tab-observer';   // Tab intersection
import { useAnimateNumber } from '@/hooks/use-animate-number'; // Number animations
```

## How to Use This Skill

1. **Before creating any UI component**: Check if ALIGN UI already has it (see component catalog)
2. **When it exists**: Read the source file, understand the API, adapt for the project
3. **When creating new components**: Follow the same patterns (tv variants, compound components, Radix primitives)
4. **Always use**: The same design tokens (colors, typography, shadows) from the Tailwind config
5. **Icons**: Always use `@remixicon/react` — never mix icon libraries
6. **Accessibility**: Use Radix UI primitives as the base for interactive components

## Widget Patterns

Widgets follow a consistent structure:
```tsx
<WidgetBox>
  <WidgetBox.Header title="Widget Title">
    <Select.Root size="small" ...>  {/* filter/controls */}
    </Select.Root>
  </WidgetBox.Header>
  {/* Widget content */}
</WidgetBox>
```

## File Organization Convention

```
components/
  ui/           → Base reusable components (Button, Input, Select, etc.)
  widgets/      → Dashboard widgets (charts, stats, data displays)
  [feature]/    → Feature-specific components
hooks/          → Custom React hooks
utils/          → Utility functions (cn, tv, formatters)
lib/            → Data files, constants
```
