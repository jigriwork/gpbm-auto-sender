# Private App UI

## Root cause

The dashboard and private pages depended almost entirely on Tailwind utility classes, but the web app did not have an explicit Tailwind/PostCSS setup. In local dev this can fail or become stale enough that the private dashboard appears like raw unstyled HTML.

## Fix

- Added `apps/web/postcss.config.mjs` with the official `@tailwindcss/postcss` plugin.
- Added `apps/web/tailwind.config.mjs` with app, components, lib, and package content paths.
- Updated `apps/web/app/globals.css` with explicit Tailwind config/source directives.
- Added private app baseline CSS classes for shell, sidebar, cards, buttons, forms, and tables.
- Preserved the existing Supabase Auth, `BusinessProvider`, `readApi`, and `writeApi` logic.

## App shell status

The private dashboard now uses a stronger SaaS shell:

- Black left sidebar on desktop.
- Grouped navigation: Overview, Setup, Business.
- Active route highlight.
- Mobile stacking sidebar/header behavior.
- Topbar with page title, subtitle, current email, business, role, super-admin badge, business switcher, and setup CTA.

## Reusable UI

The shared UI component layer now includes:

- `Panel`
- `PageHeader`
- `MetricCard`
- `StatusPill`
- `LoadingState`
- `ErrorState`
- `EmptyState`
- `DataTable`
- `Button`
- `TextInput`
- `SelectInput`
- `SetupStepCard`
- `AgentHealthBadge`
- `ProviderBadge`
- `StoreBadge`
- `OneTimeTokenCard`

## Pages checked

- `/`
- `/login`
- `/dashboard`
- `/bills`
- `/bills/failed`
- `/agents`
- `/whatsapp-providers`
- `/stores`
- `/billing-sources`
- `/parser-profiles`
- `/templates`
- `/business`
- `/settings`
- `/subscription`
- `/onboarding`

## Live vs placeholder areas

Live-connected areas remain:

- Dashboard summary
- Bills list and failed bills
- Provider credentials read/write
- Settings CRUD pages
- Agent create/rotate one-time token display
- Business context and switcher

Placeholder or partial areas:

- Provider runtime health API
- Parser testing status
- Template validation/test-send flow
- Bill details/PDF/timeline
- Full edit/delete UI for CRUD resources
- Team and subscription management

## Remaining UI gaps

- Real dashboard screenshots for public homepage.
- Rich mobile drawer behavior for navigation.
- Resource edit drawers/modals.
- Bill details page with event timeline and PDF access.
- Team/users and subscription screens.
