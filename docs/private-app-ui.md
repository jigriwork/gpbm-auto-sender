# Private App UI

The private app is designed as a command center for retail bill automation.

## Shell

- Desktop sidebar is fixed and no longer scrolls with the main page.
- Sidebar navigation is grouped into Overview, Setup, and Business.
- Mobile uses a sticky header and drawer navigation.
- Account context shows user email, selected business, role, and setup status.

## Dashboard

The dashboard now focuses on operational readiness:

- Sent, failed, retry, duplicate, invalid mobile, and agent metrics.
- Bill flow overview from detected to tracked.
- Store-wise cards for Go Planet, Brand Mark, and future stores.
- System health cards for agent, provider, parser, and storage.
- Setup warnings before live customer sending.

## Operational Pages

- Bills: tabs, filters, responsive table/cards, redacted customer data, retry actions, and detail drawer.
- Failed bills: failure queue summary and mobile-friendly retry cards.
- Agents: token safety, setup guide, one-time token UI, and no-manual-entry messaging.
- Providers: provider selection cards, safe secret inputs, redacted saved state, and live-send warning.
- Templates: variable list, preview, and clear note that provider testing is pending.

## Safety

Provider credentials are not displayed after save. Agent tokens are only shown after create/rotate. Customer names and mobile numbers are redacted in bill lists.
