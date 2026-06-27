# Agent Configuration Examples

These examples are seed/demo configurations for the GPBM tenant only. The agent is designed to support any business slug, store code, parser profile, and folder layout.

Generate each token with `npm run agent:create`; do not commit the generated token.

## Go Planet demo

```env
API_BASE_URL=http://localhost:3000
AGENT_TOKEN=
BUSINESS_SLUG=gpbm
STORE_CODE=GP
INCOMING_FOLDER=
SENT_FOLDER=
FAILED_FOLDER=
DUPLICATE_FOLDER=
PARSER_PROFILE_KEY=gpbm_go_planet_demo
APP_VERSION=0.1.0
```

## Brand Mark demo

```env
API_BASE_URL=http://localhost:3000
AGENT_TOKEN=
BUSINESS_SLUG=gpbm
STORE_CODE=BM
INCOMING_FOLDER=
SENT_FOLDER=
FAILED_FOLDER=
DUPLICATE_FOLDER=
PARSER_PROFILE_KEY=gpbm_brand_mark_demo
APP_VERSION=0.1.0
```

Folder paths are intentionally blank in the template. Choose folders per machine/store during installation; do not hardcode GPBM, Logic, MSG91, or any fixed billing software/folder as the only supported option.
