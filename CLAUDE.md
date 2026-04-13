# MIG Tender Frontend

## Stack
- Next.js 16 (App Router, Turbopack)
- TypeScript, Tailwind CSS v4
- FSD architecture (shared/entities/features/widgets/app)
- Auth: axios + @tanstack/react-query + zustand (persist)
- Backend: `https://backend.migntender.app/api/v1/`

## Commands
- `npm run dev` — development server
- `npm run build` — production build
- `npm run lint` — ESLint

## Design System — STRICT RULES

### CRITICAL
- This project uses a Clean SaaS Dashboard design (Notion/Linear/Vercel style)
- When editing ANY component, ALL Tailwind classes for colors, spacing, radius, shadows MUST follow this system
- NEVER preserve old styles. ALWAYS rewrite Tailwind classes completely.

### Tailwind Class Mapping

#### Backgrounds
- Page background: bg-gray-50
- Cards/containers: bg-white
- Sidebar: bg-white
- Hover states: hover:bg-gray-50
- Active nav: bg-gray-100
- Input backgrounds: bg-white

#### Text Colors
- Primary text: text-gray-900
- Secondary text: text-gray-500
- Tertiary/placeholder: text-gray-400
- Links/accent: text-blue-600

#### Borders
- Default: border-gray-200
- Input borders: border-gray-300
- Dividers: divide-gray-200
- NEVER use border-gray-400 or darker

#### Border Radius
- Cards: rounded-xl
- Buttons/inputs: rounded-lg
- Badges: rounded-full
- Small elements: rounded-md

#### Shadows
- Cards: shadow-sm or border border-gray-200 (pick one, not both)
- Dropdowns: shadow-lg
- NO shadow-md or shadow-xl on cards

#### Spacing
- Card padding: p-5 or p-6
- Section gaps: space-y-6 or gap-6
- Between cards in a row: gap-4
- Page padding: p-6 or p-8
- Sidebar item padding: px-3 py-2

#### Typography
- Page title: text-2xl font-bold text-gray-900 tracking-tight
- Section title: text-lg font-semibold text-gray-900
- Body: text-sm text-gray-900
- Small: text-xs text-gray-500
- KPI numbers: text-3xl font-bold text-gray-900 tracking-tight
- Table headers: text-xs font-semibold text-gray-500 uppercase

#### Status Badges (always use this pattern)
- Success: bg-emerald-50 text-emerald-700 text-xs font-medium px-2.5 py-0.5 rounded-full
- Error: bg-red-50 text-red-700 text-xs font-medium px-2.5 py-0.5 rounded-full
- Warning: bg-amber-50 text-amber-700 text-xs font-medium px-2.5 py-0.5 rounded-full
- Info: bg-blue-50 text-blue-700 text-xs font-medium px-2.5 py-0.5 rounded-full
- Neutral: bg-gray-100 text-gray-600 text-xs font-medium px-2.5 py-0.5 rounded-full

#### Buttons
- Primary: bg-gray-900 text-white hover:bg-gray-800 px-4 py-2.5 text-sm font-medium rounded-lg transition-colors
- Secondary: bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 px-4 py-2.5 text-sm font-medium rounded-lg transition-colors
- Ghost: text-gray-500 hover:text-gray-700 hover:bg-gray-100 px-3 py-2 text-sm font-medium rounded-lg transition-colors
- Danger: bg-red-600 text-white hover:bg-red-700 px-4 py-2.5 text-sm font-medium rounded-lg transition-colors

#### Inputs
- Default: w-full h-10 px-3 text-sm bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 placeholder:text-gray-400 transition-colors

#### Tables
- Wrapper: bg-white rounded-xl border border-gray-200 overflow-hidden
- Header: bg-gray-50
- Header cell: px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide
- Body cell: px-4 py-3.5 text-sm text-gray-900
- Row border: border-b border-gray-100 (NOT border-gray-200)
- Row hover: hover:bg-gray-50
- NO vertical borders

#### Sidebar
- Container: w-64 bg-white border-r border-gray-200 flex flex-col h-screen
- Nav item: flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors
- Active nav: bg-gray-100 text-gray-900 font-semibold
- Section label: px-3 pt-6 pb-2 text-[11px] font-semibold text-gray-400 uppercase tracking-wider
- Icons: w-5 h-5 (20px)

#### Cards (KPI/Stats)
- Container: bg-white rounded-xl border border-gray-200 p-5
- Label: text-sm font-medium text-gray-500
- Value: text-3xl font-bold text-gray-900 tracking-tight mt-1
- Trend up: text-sm font-medium text-emerald-600
- Trend down: text-sm font-medium text-red-600

## Key Architecture
- `src/shared/api/instance.ts` — axios instance with token interceptor + refresh
- `src/entities/auth/model/store.ts` — zustand session store
- `src/shared/lib/design-tokens.ts` — design system constants
- Path alias: `@/*` → `./src/*`

## Registration Flow
- **Brokers** register themselves publicly at `/register/broker` (email code → data → documents).
- **Developers** are created **only by admins** via `/admin/users` (button «Добавить девелопера»).
  The public `/register/developer` route has been removed. Admin endpoints:
  - `POST /admin/developers/` — create. Accepts JSON with:
    `email`, `password`, `password_confirm`, `company_name` (required),
    `first_name`, `last_name` (optional).
  - `PATCH /admin/developers/{id}/` — partial update. Accepts JSON with any subset of:
    `email`, `first_name`, `last_name`, `company_name`.
- Admin UI:
  - `/admin/users` (`src/app/(main)/admin/users/page.tsx`) — user list with block/verify/edit actions. Edit developer is a modal on this page. «Добавить девелопера» is a `Link` to the create page.
  - `/admin/users/new-developer` (`src/app/(main)/admin/users/new-developer/page.tsx`) — dedicated full page for creating a developer (not a modal). Matches the design of `/properties/create` (blue card, header with back arrow, footer with Cancel + Create buttons). Same field set as the edit modal plus password fields.
- Mutations: `src/features/admin/model/queries.ts` (`useAdminCreateDeveloper`, `useAdminUpdateDeveloper`).
- Service layer: `src/entities/admin/api/admin.service.ts`.

### Known backend gaps (developer profile)
Attempts to extend admin developer create/edit with `inn_number`, `phone_number`, `inn`
(file), `passport` (file) were reverted because the backend does not accept them
(verified empirically on 2026-04-14 via Playwright against the live API):
- `POST /admin/developers/` with multipart silently ignores those fields and returns 201,
  but `inn_number`/`phone_number` are not saved and no `UserDocument` is created.
- `PATCH /admin/developers/{id}/` with only those fields returns `400 {"detail":["Передайте хотя бы одно поле для обновления."]}` — proof the request serializer doesn't know the fields at all.
- To restore these fields, backend must: add columns/fields to `DeveloperProfile`,
  include them in both request and response serializers for `/admin/developers/` and
  `/admin/users/`, and handle file uploads into `UserDocument(doc_type='inn'|'passport')`
  on behalf of the target user (admin context).

## Known Issues
- Pre-existing TS type errors; `typescript: { ignoreBuildErrors: true }` in next.config.ts
- Next.js 16 requires `turbopack: {}` config key
