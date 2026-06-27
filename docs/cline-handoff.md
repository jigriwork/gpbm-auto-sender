# Cline Handoff

Cline should connect the technical backend without requiring the owner to run manual SQL or migrations.

## Next Work

1. Create Supabase migrations for the tenant tables listed in `docs/architecture.md`.
2. Add RLS policies so every tenant-safe table is filtered by `business_id`.
3. Create server-side Supabase service functions for dashboard reads and agent writes.
4. Add private Supabase Storage bucket for bill PDFs.
5. Implement agent token authentication and heartbeat endpoints.
6. Implement `provider_credentials` encryption or vault-backed storage.
7. Replace `PlaceholderDatabaseService` with Supabase queries.
8. Implement MSG91 server-side adapter using environment-only credentials.
9. Add durable local SQLite queue in the agent.
10. Add real PDF text extraction and parser profile rule storage.

## Do Not Do

- Do not place service role keys or provider keys in frontend code.
- Do not hardcode GPBM, Go Planet, Brand Mark, MSG91, Logic, or local folder paths as platform logic.
- Do not add cashier manual-entry workflows.
