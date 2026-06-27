# Business context

Business context is SaaS/multi-tenant and is never hardcoded to GPBM.

## Resolution rules

- `/api/me` returns safe user info, platform role, memberships, platform-visible businesses for super admins, and selected/current business.
- `/api/businesses` returns the businesses the user can access.
- `/api/businesses/current` returns the validated current business.
- If a user belongs to one business, the frontend stores that selected business id in local storage as `gpbm_selected_business_id`.
- Only ids/slugs are stored client-side. No secrets are stored as business context.

## Access checks

- Normal users must have a row in `business_users` for the requested business.
- Super admins can select/read/manage across businesses through server-validated endpoints.
- For `admin@gpbm.in`, migration `202606270002_platform_admins.sql` links UID `ba777d45-4af0-4659-8cb3-edd8e0d204a2` to GPBM (`slug = 'gpbm'`) as `owner`.

## Future switching UI

The backend supports multiple businesses. A full switcher UI can be added later by calling `/api/businesses`, storing the selected id, and refreshing dashboard data.
