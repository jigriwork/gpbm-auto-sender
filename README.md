# GPBM Auto Sender

GPBM Auto Sender is a SaaS-ready, multi-tenant platform for sending customer bill PDFs through a business-selected WhatsApp provider.

The first demo tenant is GPBM with Go Planet and Brand Mark stores, but the app is structured for any business, billing software, PDF parser profile, and WhatsApp provider.

## Apps and Packages

- `apps/web` - Next.js dashboard and onboarding UI.
- `apps/agent` - Node.js/TypeScript local Windows folder watcher skeleton.
- `packages/shared` - Tenant-safe shared domain types and demo data.
- `packages/providers` - WhatsApp provider abstraction and placeholder adapters.
- `packages/parsers` - PDF parser profile abstraction and placeholder parser.
- `supabase/migrations` - Reserved for Cline-managed database migrations.
- `docs` - Architecture and Cline handoff notes.

## Local Development

```bash
npm install
npm run dev
```

The web app runs from `apps/web`. Supabase is planned but not required for local UI development yet.

## Security

Do not commit Supabase secret keys, service role keys, WhatsApp provider keys, API tokens, or customer data. Provider credentials must remain server-side only.
