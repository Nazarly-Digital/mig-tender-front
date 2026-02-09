# ALIGN UI — HR Template Components

Source: `/Users/ecomnazar/Downloads/ALIGNUI 2/template-hr-master/`

## Widgets (15)

| Component | File | Purpose |
|-----------|------|---------|
| Daily Work Hours | `widgets/widget-daily-work-hours.tsx` | Work hours tracking |
| Time Tracker | `widgets/widget-time-tracker.tsx` | Time tracking widget |
| Work Analysis | `widgets/widget-work-analysis.tsx` | Work analytics |
| Training | `widgets/widget-training.tsx` | Training progress |
| Rating | `widgets/widget-rating.tsx` | Employee rating display |
| Spotlight | `widgets/widget-spotlight.tsx` | Featured content |
| Notes | `widgets/widget-notes.tsx` | Notes widget |
| Feedback | `widgets/widget-feedback.tsx` | Feedback collection |
| Schedule | `widgets/widget-schedule.tsx` | Schedule display |
| Courses | `widgets/widget-courses.tsx` | Course listing |
| Status Tracker | `widgets/widget-status-tracker.tsx` | Status monitoring |
| Time Off | `widgets/widget-time-off.tsx` | Time off tracking |
| Upcoming Events | `widgets/widget-upcoming-events.tsx` | Events calendar |
| Announcements | `widgets/widget-announcements.tsx` | Team announcements |
| Quick Actions | `widgets/widget-quick-actions.tsx` | Quick action shortcuts |

## Charts & Visualization

| Component | File | Purpose |
|-----------|------|---------|
| Gauge Chart | `gauge-chart.tsx` | Gauge/meter visualization |
| Category Bar Chart | `chart-category-bar.tsx` | Category bar chart |
| Step Line Chart | `chart-step-line.tsx` | Step line chart |
| Spark Line Chart | `chart-spark-line.tsx` | Inline sparklines |

## HR-Specific Components

| Component | File | Purpose |
|-----------|------|---------|
| Big Calendar | `big-calendar.tsx` | Full calendar view |
| Time Tracker | `time-tracker.tsx` | Time tracking component |
| Phone Number Input | `phone-number-input.tsx` | Formatted phone input |
| Company Switch | `company-switch.tsx` | Company/team switcher |
| Widget Box | `widget-box.tsx` | Widget container |

## Layout & Navigation

| Component | File | Purpose |
|-----------|------|---------|
| Sidebar | `sidebar.tsx` | Main navigation sidebar |
| Header | `header.tsx` | Page header with actions |
| Header Mobile | `header-mobile.tsx` | Mobile header |
| User Button | `user-button.tsx` | User profile menu |
| Notification Button | `notification-button.tsx` | Notifications |
| Search | `search.tsx` | Command search |

## Pages & Routes

### Auth (3 styles): `/login`, `/register`, `/reset-password`, `/verification`
### Main: `/` (dashboard), `/calendar`, `/teams`, `/integrations`
### Settings: Profile, Company, General, Notifications, Privacy/Security, Integrations
### Onboarding: Multi-step wizard with Jotai state management

## Empty State Illustrations (12 SVG components)
Various empty states for dashboard widgets and sections.

## Key Differences from Other Templates
- **Big Calendar component** — Full-featured calendar view
- **Time Tracker** — Work hours tracking with timer
- **Gauge charts** — D3-based gauge visualizations
- **Employee-focused widgets** — Rating, training, feedback
- **Onboarding flow** — Multi-step employee onboarding
