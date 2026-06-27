# Settings CRUD APIs

The following dashboard settings APIs are implemented and protected by Supabase Auth bearer tokens:

- `GET /api/stores`
- `POST /api/stores`
- `PATCH /api/stores/:id`
- `GET /api/billing-sources`
- `POST /api/billing-sources`
- `PATCH /api/billing-sources/:id`
- `GET /api/parser-profiles`
- `POST /api/parser-profiles`
- `PATCH /api/parser-profiles/:id`
- `GET /api/templates`
- `POST /api/templates`
- `PATCH /api/templates/:id`
- `GET /api/agents`
- `POST /api/agents`
- `PATCH /api/agents/:id`
- `POST /api/agents/:id/rotate-token`

## Authorization

- Reads allow `owner`, `admin`, `staff`, `viewer`, or `super_admin`.
- Writes allow `owner`, `admin`, or `super_admin`.
- Super admin access is explicit through `platform_admins` and server-side context checks.

## Business scoping

- Requests may include `business_id`.
- If omitted, server context resolves the user's first accessible business, or first platform business for super admins.
- The server validates membership/super-admin status before querying or mutating tenant data.

## Frontend pages connected

The existing UI style is preserved and these pages now call the new APIs with loading/empty/error states and basic create forms:

- `/stores`
- `/billing-sources`
- `/parser-profiles`
- `/templates`
- `/agents`

Full edit forms and a business switcher are still recommended follow-up UI work.
