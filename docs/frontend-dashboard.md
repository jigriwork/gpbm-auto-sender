# Frontend Dashboard

## Live API-connected pages

- `/dashboard` calls `GET /api/dashboard/summary?business_id=...` and renders loading, empty-ish metric, auth, and generic API error states.
- `/bills` calls `GET /api/bills` with store, status, date range, customer mobile, and bill number filters.
- `/bills/failed` calls `GET /api/bills` for `failed`, `invalid_mobile`, `parsing_failed`, and `retrying` queues.

The browser reads a temporary dashboard bearer token from `localStorage.gpbm_dashboard_access_token` and a tenant id from `localStorage.gpbm_business_id`. If those are not present, the UI still loads and shows the safe message: "Backend is ready. Sign-in/session wiring is required to load live data."

## Safe frontend behavior

- Customer names and mobile numbers are redacted in bill lists.
- Raw API errors and stack traces are never displayed.
- Resend is only shown for `failed`, `queued`, and `retrying` bills.
- Already sent bills do not show force resend.

## Placeholder pages

- `/templates` is a frontend placeholder until template CRUD endpoints are implemented.
- `/stores`, `/agents`, `/billing-sources`, and `/parser-profiles` show demo/seed-aware SaaS structure and setup placeholders.

## Backend endpoints still needed

- Store CRUD: `GET/POST/PATCH /api/stores`
- Agent dashboard read/setup flow: `GET /api/agents`, `POST /api/agents/setup-token`
- Template CRUD: `GET/POST/PATCH /api/templates`
- Optional read endpoints for billing sources and parser profiles.
