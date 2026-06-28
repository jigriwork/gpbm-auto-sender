# UI Redesign

This phase redesigns GPBM Auto Sender as a premium black-and-white SaaS product while preserving existing auth, business context, API helpers, and secret-safety behavior.

## Redesigned Areas

- Public homepage with product positioning, problem/solution sections, compatibility, providers, SaaS positioning, pricing placeholder, and FAQ.
- Login page with premium split layout, Supabase auth preservation, loading/error states, invite note, and homepage link.
- Private app shell with fixed desktop sidebar, mobile header/drawer, grouped navigation, account context, business switcher, setup progress, and logout.
- Dashboard command center with KPI cards, bill flow timeline, store-wise overview, setup warnings, system health, and live-vs-fallback clarity.
- Bills and failed bills with tabs, filters, desktop table, mobile cards, detail drawer, redaction, retry actions, and event/PDF placeholder clarity.
- Agents, providers, templates, stores, billing sources, parser profiles, onboarding, business, settings, and subscription pages.

## Components Added Or Improved

- `AppShell`, sidebar, mobile drawer, topbar/page header
- `Panel`, `SectionHeader`, `MetricCard`, `InsightCard`
- `StatusBadge`, provider/store/agent badges
- `EmptyState`, `LoadingState`, `ErrorState`, `AlertBanner`
- `DataTable`, `MobileDataCard`, `FilterBar`
- `Modal`, `Drawer`, `ConfirmDialog`
- `OneTimeTokenCard`, `Timeline`, `Tabs`, `ProgressChecklist`
- Button, input, select, textarea primitives

## Live Vs Placeholder

The UI avoids presenting fallback/demo data as real. Dashboard and bills use live data where auth/business context is available, and clearly label fallback/sample areas when not.

## Remaining Gaps

- Real bill event timeline endpoint.
- PDF view/download UI backed by secure storage URL.
- Provider test-message backend flow.
- Parser test runner after sample bill PDFs are available.
- Windows installer/download page.
- True subscription/payment enforcement.
