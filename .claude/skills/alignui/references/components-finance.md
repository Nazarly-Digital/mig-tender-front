# ALIGN UI — Finance Template Components

Source: `/Users/ecomnazar/Downloads/ALIGNUI 2/template-finance-master/`

## Widgets (13)

| Component | File | Purpose |
|-----------|------|---------|
| Total Balance | `widgets/widget-total-balance.tsx` | Balance display with currency select and trend chart |
| Total Expenses | `widgets/widget-total-expenses.tsx` | Expenses with pie chart |
| Recent Transactions | `widgets/widget-recent-transactions.tsx` | Transaction list with filters |
| My Cards Compact | `widgets/widget-my-cards-compact.tsx` | Compact card display |
| My Cards | `widgets/widget-my-cards.tsx` | Full card management |
| Budget Overview | `widgets/widget-budget-overview.tsx` | Budget tracking visualization |
| Credit Score | `widgets/widget-credit-score.tsx` | Score gauge display |
| Exchange | `widgets/widget-exchange.tsx` | Currency exchange |
| Major Expenses | `widgets/widget-major-expenses.tsx` | Top expenses breakdown |
| Quick Transfer | `widgets/widget-quick-transfer.tsx` | Quick money transfer |
| Saved Actions | `widgets/widget-saved-actions.tsx` | Quick action shortcuts |
| Spending Summary | `widgets/widget-spending-summary.tsx` | Spending overview pie chart |
| Transactions Table | `widgets/widget-transactions-table.tsx` | Full transactions table |

## Charts

| Component | File | Purpose |
|-----------|------|---------|
| Chart | `chart.tsx` | Recharts wrapper with config & legends |
| Step Line Chart | `chart-step-line.tsx` | Balance trend step lines |
| Spark Line Chart | `chart-spark-line.tsx` | Small inline sparklines |
| Score Track Chart | `score-track-chart.tsx` | Score tracking over time |
| Spending Pie Chart | `spending-summary-pie-chart.tsx` | Spending breakdown |
| Budget Stack Bar | `budget-overview-stack-bar-chart.tsx` | Stacked bar for budget |
| Vertical Bar Chart | `vertical-bar-chart.tsx` | Vertical bars |
| Motion Number | `motion-number.tsx` | Animated number counter |

## Card Components

| Component | File | Purpose |
|-----------|------|---------|
| Physical Card | `physical-card.tsx` | Credit card display with chip & logo |
| Virtual Card | `virtual-card.tsx` | Virtual card details |
| Card Chip | `card-chip.tsx` | Card chip icon |

## Transaction Components

| Component | File | Purpose |
|-----------|------|---------|
| Transaction Item | `transaction-item.tsx` | Single transaction row |
| Transaction Detail Drawer | `transaction-detail-drawer.tsx` | Transaction details in drawer |
| Transactions Table | `transactions-table.tsx` | Full data table with TanStack |

## Layout & Navigation

| Component | File | Purpose |
|-----------|------|---------|
| Sidebar | `sidebar.tsx` | Main nav sidebar |
| Header | `header.tsx` | Page header with actions |
| Header Mobile | `header-mobile.tsx` | Mobile header |
| Widget Box | `widget-box.tsx` | Reusable widget container |
| User Button | `user-button.tsx` | User profile menu |
| Notification Button | `notification-button.tsx` | Notification bell |
| Company Switch | `company-switch.tsx` | Account/company switcher |
| Search | `search.tsx` | Command search menu |

## Specialized

| Component | File | Purpose |
|-----------|------|---------|
| Currency Select | `currency-select.tsx` | Currency picker |
| Language Select | `language-select.tsx` | Language picker |
| Phone Number Input | `phone-number-input.tsx` | Formatted phone input |
| Move Money Button | `move-money-button.tsx` | Quick transfer action |
| Level Bar | `level-bar.tsx` | Level/progress indicator |
| Legend Dot | `legend-dot.tsx` | Chart legend dot |

## Pages & Routes

### Auth: `/login`, `/register`, `/reset-password`, `/verification`
### Main: `/` (dashboard), `/my-cards`, `/transactions`
### Settings: `/settings/profile-settings`, `/privacy-security`, `/notification-settings`, `/company-settings`, `/team-settings`, `/integrations`, `/localization`
### Flow: `/send-money` (4-step wizard with Jotai state)

## Empty State Illustrations (8 SVG components)
Budget Overview, Exchange, My Cards, My Subscriptions, Quick Transfer, Recent Transactions, Saved Actions, Spending Summary
