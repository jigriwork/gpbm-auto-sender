# Frontend Auth and Business Context

## Shared API helper

Protected dashboard calls use `apps/web/lib/client-data.ts`.

- `getSupabaseAccessToken()` reads the current browser Supabase Auth session.
- `apiRequest()` attaches `Authorization: Bearer <access_token>` for protected requests.
- `readApi()` wraps protected GET calls.
- `writeApi()` wraps protected POST, PATCH, and DELETE calls.
- Tokens are never logged, stored in URLs, or rendered.
- If no Supabase session exists, helpers return a safe auth-required result instead of throwing.

The old localStorage dashboard token is no longer used for protected API headers.

## Business context

`apps/web/lib/business-context.tsx` provides the browser business context.

- It loads `/api/me` after app shell startup.
- It merges normal business memberships and super-admin visible businesses.
- It stores only the selected business id in `localStorage.gpbm_selected_business_id`.
- If one business is available, it is selected automatically.
- If multiple businesses are available, the shell shows a business switcher.
- No secrets, tokens, or provider credentials are stored as business context.

## Shell UI

`AppShell` shows:

- Logged-in email
- Current business name
- Current role
- Super Admin badge when returned by `/api/me`
- Business switcher when multiple businesses are available
- Logout
- Active sidebar route

## Pages using selected business context

- `/dashboard`
- `/business`
- `/stores`
- `/billing-sources`
- `/parser-profiles`
- `/templates`
- `/agents`
- `/bills`
- `/bills/failed`
- `/whatsapp-providers`

Settings CRUD pages pass the selected `business_id` to list/create requests. Bills resend and provider credential writes now use `writeApi()` so normal Supabase login sessions work.

## Agent token UI

Agent create and rotate responses may return `one_time_token`. The UI displays it in a one-time card with a copy button and warning. The token is not saved in localStorage and disappears after hide/refresh. Agent GET responses must never return tokens or hashes.

## Remaining UI gaps

- Full edit forms for stores, billing sources, parser profiles, templates, and agents.
- Rich business switcher placement for mobile polish.
- Team/users and subscription pages are still placeholders.
- Super-admin tenant management dashboard is still missing.
- Bill details, PDF view, and status timeline are still missing.
