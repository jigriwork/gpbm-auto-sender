# Onboarding Flow

The SaaS onboarding UI uses these steps:

1. Create business
2. Add stores
3. Choose billing source
4. Choose WhatsApp provider
5. Add template
6. Install local agent
7. Test bill sending

## GPBM demo seed view

- Business: GPBM
- Stores: Go Planet, Brand Mark
- Provider: MSG91 test mode
- Source: Generic PDF Folder Watcher

## Placeholder areas

- Template save requires `GET/POST/PATCH /api/templates`.
- Store add/edit requires store management APIs.
- Agent setup must use a server-generated one-time setup token displayed only once.
- Parser accuracy requires sample PDFs and is intentionally not implemented in this UI task.

No frontend onboarding screen exposes service role keys, provider secrets, or agent tokens.
