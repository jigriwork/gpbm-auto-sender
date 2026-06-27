# Platform super admin

Migration `supabase/migrations/202606270002_platform_admins.sql` adds SaaS-level platform admin support.

## Table

`platform_admins`

- `id uuid primary key default gen_random_uuid()`
- `user_id uuid references auth.users(id) on delete cascade unique not null`
- `email text not null`
- `role text not null check role in ('super_admin','support_admin')`
- `status text default 'active'`
- `created_at timestamptz default now()`
- `updated_at timestamptz default now()`

## Helper functions

- `is_platform_admin(user_uuid uuid)`
- `is_super_admin(user_uuid uuid)`

## RLS

- RLS is enabled on `platform_admins`.
- Active super admins can read platform admin records.
- Normal users cannot read platform admin records.
- Server/service-role operations can manage records through scripts and migrations.

## Current admin user

The migration idempotently upserts:

- Email: `admin@gpbm.in`
- UID: `ba777d45-4af0-4659-8cb3-edd8e0d204a2`
- Platform role: `super_admin`
- Status: `active`

It also idempotently inserts or upgrades the GPBM `business_users` membership to `owner` for business slug `gpbm`.

## Scripts

Future owner/platform admin linking does not require manual SQL:

```bash
npm run owner:link -- --email admin@gpbm.in --business gpbm --role owner
npm run owner:link -- --uid ba777d45-4af0-4659-8cb3-edd8e0d204a2 --business gpbm --role owner
npm run platform-admin:add -- --uid ba777d45-4af0-4659-8cb3-edd8e0d204a2 --email admin@gpbm.in --role super_admin
```

Scripts use the service role key server-side only, do not print secrets, and do not create duplicate auth users.
