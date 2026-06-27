# Auth and dashboard session flow

The web dashboard uses Supabase Auth email/password sessions in the browser.

## Browser session

- `apps/web/lib/supabase-browser.ts` creates a browser-only Supabase client with `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
- The service role key is never used in browser code.
- `/login` calls `supabase.auth.signInWithPassword({ email, password })`.
- Supabase persists and refreshes the user session in browser storage.
- Logout calls `supabase.auth.signOut()` and clears the legacy dashboard token key.

## API bearer tokens

- Frontend helper `readApi` / `writeApi` obtains the current Supabase access token with `supabase.auth.getSession()`.
- Dashboard API requests send `Authorization: Bearer <access_token>` automatically.
- Tokens are not logged and are not placed in URLs.

## Server validation

- Server routes call `authenticateDashboardUser()` in `apps/web/lib/server/dashboard-auth.ts`.
- That function validates the bearer token with Supabase Auth `/auth/v1/user` using the public anon key.
- Business membership and platform admin status are checked server-side before data is returned.

## Protected APIs

Dashboard APIs require a valid Supabase Auth bearer token. Agent APIs continue to use separate agent tokens.
