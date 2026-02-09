# ALIGN UI — Marketing Template Components

Source: `/Users/ecomnazar/Downloads/ALIGNUI 2/marketing-template-master/`

## Widgets (18)

| Component | File | Purpose |
|-----------|------|---------|
| Customer Segments | `widgets/customer-segments.tsx` | Customer segmentation display |
| Marketing Channels | `widgets/marketing-channels.tsx` | Channel performance |
| Product Categories | `widgets/product-categories.tsx` | Category breakdown |
| Recent Activities | `widgets/recent-activities.tsx` | Activity feed |
| Campaign Data | `widgets/widget-campaign-data.tsx` | Campaign analytics |
| Conversion Rate | `widgets/widget-conversion-rate.tsx` | Conversion metrics |
| Geography | `widgets/widget-geogprahy.tsx` | Geographic data map |
| My Products | `widgets/widget-my-products.tsx` | Product listing |
| Product Performance | `widgets/widget-product-performance.tsx` | Product analytics |
| Real Time | `widgets/widget-real-time.tsx` | Real-time metrics |
| Sales Channels | `widgets/widget-sales-channels.tsx` | Sales channel data |
| Shipping Tracking | `widgets/widget-shipping-tracking.tsx` | Shipping status |
| Support Analytics | `widgets/widget-support-analytics.tsx` | Support metrics |
| Total Sales | `widgets/widget-total-sales.tsx` | Sales overview |
| Total Visitors | `widgets/widget-total-visitors.tsx` | Visitor count |
| User Retention | `widgets/widget-user-retention.tsx` | Retention metrics |
| Visitor Channels | `widgets/widget-visitor-channels.tsx` | Traffic sources |
| Weekly Visitors | `widgets/widget-weekly-visitors.tsx` | Weekly visitor chart |

## Charts & Visualization

| Component | File | Purpose |
|-----------|------|---------|
| Bubble Chart | `bubble-chart.tsx` | Bubble data visualization |
| Pie Chart | `pie-chart.tsx` | Pie chart component |
| Category Bar Chart | `chart-category-bar.tsx` | Category bar chart |
| Progress Chart | `progress-chart.tsx` | Progress visualization |
| Legend Dot | `legend-dot.tsx` | Chart legend indicator |

## Settings Modal System (25+ files)

Complex multi-tab settings modal at `components/settings-modal/`:

### Tabs:
- **Appearance**: Theme selection, preferences
- **Account Settings**: Profile, notifications, language/region
- **Product Settings**: Defaults, inventory, categories
- **Store Settings**: Store details, contact info, discounts
- **Payment & Billing**: Payment methods, tax, currency
- **Shipping & Delivery**: Methods, zones, delivery options
- **Privacy & Security**: Password/2FA, active sessions
- **Integrations**: API settings, connections, social media

## Layout & Navigation

| Component | File | Purpose |
|-----------|------|---------|
| Sidebar | `sidebar.tsx` | Main navigation (10.9KB) |
| Header | `header.tsx` | Page header |
| Header Mobile | `header-mobile.tsx` | Mobile header |
| User Button | `user-button.tsx` | User profile (6.1KB) |
| Company Switch | `company-switch.tsx` | Workspace switcher (5.4KB) |
| Notification Button | `notification-button.tsx` | Notifications (19.5KB) |
| Search | `search.tsx` | Search with command menu (6.4KB) |

## Specialized

| Component | File | Purpose |
|-----------|------|---------|
| Custom Input | `custom-input.tsx` | Enhanced input wrapper |
| Custom Textarea | `custom-textarea.tsx` | Enhanced textarea |
| Custom Select | `custom-select.tsx` | Custom select |
| Select Transparent | `select-transparent.tsx` | Transparent select variant |
| Editable Input | `editable-input.tsx` | In-place editable field |
| Check Button | `check-button.tsx` | Button with checkbox |
| New Product Button | `new-product-button.tsx` | Create product action |
| Language Select | `language-select.tsx` | Language picker |
| Themed Image | `themed-image.tsx` | Theme-aware image |
| Dashed Divider | `dashed-divider.tsx` | Dashed line separator |

## Pages & Routes

### Auth: `/login`, `/register`, `/reset-password`, `/verification`
### Main: `/` (dashboard), `/products`, `/orders`, `/analytics`
### Products: List, filters, product cards, card slider, edit drawer
### Orders: Table, filters, summary, order detail drawer
### Analytics: Dashboard with total sales chart
### Add Product: 5-step wizard (image, details, price, stock, summary)

## Additional Dependencies (beyond base)
- `react-leaflet` — Leaflet maps
- `react-masonry-css` — Masonry layout
- `dotted-map` — Interactive dotted map
- `primereact` — Additional React components
- `react-aria-components` — Aria components
- `react-textarea-autosize` — Auto-sizing textarea
- `@number-flow/react` — Number animation
