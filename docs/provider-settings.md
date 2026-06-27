# Provider Settings

`/whatsapp-providers` is connected to:

- `GET /api/provider-credentials?business_id=...`
- `POST /api/provider-credentials`
- `PATCH /api/provider-credentials/:id`

## Implemented UI

- MSG91 credential fields: `auth_key`, `integrated_number`, `namespace`
- Custom API credential fields: `endpoint`, `method`, `headers`
- Default provider toggle
- Enable/disable action
- Redacted saved status after load
- "Saved securely" confirmation after successful save

## Security notes

- Saved secret values are never rendered back into inputs.
- Provider credentials are submitted only to server routes.
- Service role keys and provider secrets must remain server-side.
- Coming soon providers are visible but disabled: Interakt, WATI, AiSensy, Gupshup, and Zoko.

MSG91 is the first implemented provider option, but the UI and backend route payloads use generic `provider_key` values so MSG91 is not hardcoded as the only provider.
