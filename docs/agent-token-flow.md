# Agent token flow

Agent devices authenticate with a separate bearer token, not a Supabase user session.

## Create

- `POST /api/agents` requires owner/admin/super-admin dashboard auth.
- The server generates a strong random token with `crypto.randomBytes`.
- The token is hashed with `AGENT_TOKEN_PEPPER` using the existing SHA-256 helper.
- Only `agent_token_hash` is stored in `agent_devices`.
- The plaintext token is returned once as `one_time_token` in the create response.

## Rotate

- `POST /api/agents/:id/rotate-token` requires owner/admin/super-admin dashboard auth.
- A new token is generated and replaces the stored hash.
- The old token is invalid immediately.
- The new plaintext token is returned once as `one_time_token`.

## Reads

- `GET /api/agents` never returns `agent_token_hash` or plaintext tokens.
- Plain tokens are not printed by normal dashboard reads.

## Pepper

`AGENT_TOKEN_PEPPER` must remain server-side only and must not be committed.
