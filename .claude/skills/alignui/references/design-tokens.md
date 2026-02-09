# ALIGN UI Design Tokens

Complete design token reference from the Tailwind config.

## Color Palette

All colors use HSL CSS variables for dynamic theming.

### Neutral / Gray Scale
`neutral-{0-950}` + `neutral-alpha-{24,16,10,8,4}` (transparent overlays)

### Brand Colors (each with 0-950 shades)
- `blue` — Primary accent, links, active states
- `orange` — Warnings, highlights
- `red` — Errors, destructive actions
- `green` — Success, positive states
- `yellow` — Caution, pending
- `purple` — Features, premium
- `sky` — Information, secondary accent
- `pink` — Special highlights
- `teal` — Secondary features

### Semantic Background Colors
| Token | Usage |
|-------|-------|
| `bg-white-0` | Card backgrounds, primary surfaces |
| `bg-weak-50` | Page background, secondary surfaces |
| `bg-soft-200` | Hover states, subtle backgrounds |
| `bg-sub-300` | Borders, dividers background |
| `bg-surface-800` | Dark surface (dark mode primary) |
| `bg-strong-950` | Strongest background, inverted |

### Semantic Text Colors
| Token | Usage |
|-------|-------|
| `text-white-0` | Text on dark backgrounds |
| `text-disabled-300` | Disabled, placeholder text |
| `text-soft-400` | Tertiary text, hints |
| `text-sub-600` | Secondary text, labels |
| `text-strong-950` | Primary text, headings |

### Semantic Stroke Colors
| Token | Usage |
|-------|-------|
| `stroke-white-0` | Borders on dark backgrounds |
| `stroke-soft-200` | Default borders, dividers |
| `stroke-sub-300` | Emphasized borders |
| `stroke-strong-950` | Strong borders, outlines |

### Status Colors
Each status has 4 levels: `dark`, `base`, `light`, `lighter`

| Status | Usage |
|--------|-------|
| `success` | Completed, approved, active |
| `error` | Failed, rejected, destructive |
| `warning` | Caution, needs attention |
| `information` | Info, neutral notification |
| `faded` | Inactive, archived |
| `feature` | Feature highlight |
| `verified` | Verified, trusted |
| `highlighted` | Highlighted items |
| `stable` | Stable, unchanged |
| `away` | Away, idle status |

### Social Brand Colors
`apple`, `twitter`, `github`, `notion`, `tidal`, `amazon`, `zendesk`

## Typography

### Headings
| Class | Size | Line Height | Letter Spacing |
|-------|------|-------------|----------------|
| `title-h1` | 3.5rem (56px) | 4rem | -0.02em |
| `title-h2` | 3rem (48px) | 3.5rem | -0.02em |
| `title-h3` | 2.25rem (36px) | 2.75rem | -0.02em |
| `title-h4` | 1.75rem (28px) | 2.25rem | -0.02em |
| `title-h5` | 1.5rem (24px) | 2rem | -0.015em |
| `title-h6` | 1.25rem (20px) | 1.75rem | -0.005em |

### Labels (font-weight: 500)
| Class | Size | Line Height |
|-------|------|-------------|
| `label-xl` | 1.125rem (18px) | 1.5rem |
| `label-lg` | 1rem (16px) | 1.5rem |
| `label-md` | 0.875rem (14px) | 1.25rem |
| `label-sm` | 0.8125rem (13px) | 1.125rem |
| `label-xs` | 0.75rem (12px) | 1rem |

### Paragraphs (font-weight: 400)
| Class | Size | Line Height |
|-------|------|-------------|
| `paragraph-xl` | 1.125rem (18px) | 1.75rem |
| `paragraph-lg` | 1rem (16px) | 1.5rem |
| `paragraph-md` | 0.875rem (14px) | 1.25rem |
| `paragraph-sm` | 0.8125rem (13px) | 1.25rem |
| `paragraph-xs` | 0.75rem (12px) | 1rem |

### Subheadings (font-weight: 500, uppercase optional)
| Class | Size | Line Height | Letter Spacing |
|-------|------|-------------|----------------|
| `subheading-md` | 0.875rem | 1.25rem | 0.06em |
| `subheading-sm` | 0.8125rem | 1.125rem | 0.04em |
| `subheading-xs` | 0.75rem | 1rem | 0.04em |
| `subheading-2xs` | 0.6875rem | 0.875rem | 0.04em |

## Shadows

### Regular Shadows
| Token | Value |
|-------|-------|
| `regular-xs` | `0px 1px 2px 0px rgba(228,229,231,0.24)` |
| `regular-sm` | `0px 2px 4px 0px rgba(228,229,231,0.24)` |
| `regular-md` | `0px 16px 32px -12px rgba(88,92,100,0.10)` |

### Focus Shadows (for interactive elements)
| Token | Usage |
|-------|-------|
| `button-primary-focus` | Primary button focus ring |
| `button-important-focus` | Important/CTA focus ring |
| `button-error-focus` | Error/destructive focus ring |

### Component Shadows
| Token | Usage |
|-------|-------|
| `toggle-switch` | Switch track shadow |
| `switch-thumb` | Switch thumb shadow |
| `tooltip` | Tooltip container shadow |
| `fancy-buttons-neutral` | Fancy neutral button effect |
| `fancy-buttons-primary` | Fancy primary button effect |
| `fancy-buttons-error` | Fancy error button effect |

## Border Radius

| Token | Value |
|-------|-------|
| `rounded-10` | 0.625rem (10px) |
| `rounded-20` | 1.25rem (20px) |
| Standard Tailwind | `rounded-sm` through `rounded-3xl` |

## Animations

| Token | Duration | Easing |
|-------|----------|--------|
| `accordion-down` | 0.2s | ease-out |
| `accordion-up` | 0.2s | ease-out |
| `event-item-show` | 0.5s | cubic-bezier(0.4, 0, 0.2, 1) |

## Breakpoints

| Name | Width |
|------|-------|
| `sm` | 640px |
| `md` | 768px |
| `lg` | 1024px |
| `xl` | 1280px |
| `2xl` | 1536px |
