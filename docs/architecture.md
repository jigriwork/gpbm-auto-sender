# Architecture

GPBM Auto Sender is designed as a multi-tenant SaaS from day one. GPBM, Go Planet, Brand Mark, MSG91, and Logic are demo or first implementation examples only.

## Layers

- Web Dashboard: tenant onboarding, stores, sources, parser profiles, providers, templates, bill logs, agents, settings, and subscriptions.
- Local Folder Watcher Agent: Windows Node.js process watching configurable PDF folders.
- WhatsApp Provider Layer: server-side provider adapters implementing `sendBillMessage`.
- PDF Parser Layer: parser profiles with extraction rules and confidence checks.
- Billing Source Layer: source type abstraction beginning with Generic PDF Folder Watcher.
- Tenant Layer: every tenant-safe record includes `business_id`.
- Store Layer: each business owns its stores and store-specific agent/source/parser links.
- Bill Logs Layer: bill documents and events track every status transition.

## Planned Tenant Tables

- `businesses`
- `business_users`
- `stores`
- `billing_sources`
- `parser_profiles`
- `whatsapp_providers`
- `provider_credentials`
- `whatsapp_templates`
- `agent_devices`
- `bill_documents`
- `bill_events`
- `audit_logs`
- `plans` / `subscriptions`

## Security Rules

Provider credentials, Supabase service role keys, and tokens must remain server-side. The browser should only receive public configuration and redacted provider status.

## Bill Flow

1. Agent detects a PDF in a configured incoming folder.
2. Agent extracts PDF text through the parser layer.
3. Parser returns structured fields with confidence and missing-field details.
4. Agent computes duplicate key from bill number, bill date, mobile, store ID, and PDF hash.
5. Agent uploads the PDF and parsed metadata to the backend.
6. Backend stores private PDF, logs events, and calls selected WhatsApp provider.
7. Provider result updates bill status and retry queue.
