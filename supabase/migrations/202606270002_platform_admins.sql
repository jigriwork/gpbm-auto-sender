-- SaaS platform admin support and idempotent GPBM owner link for the existing admin user.

create table if not exists public.platform_admins (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade unique not null,
  email text not null,
  role text not null check (role in ('super_admin','support_admin')),
  status text default 'active',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

drop trigger if exists platform_admins_set_updated_at on public.platform_admins;
create trigger platform_admins_set_updated_at
  before update on public.platform_admins
  for each row execute function public.set_updated_at();

create or replace function public.is_platform_admin(user_uuid uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.platform_admins pa
    where pa.user_id = user_uuid
      and pa.status = 'active'
      and pa.role in ('super_admin','support_admin')
  );
$$;

create or replace function public.is_super_admin(user_uuid uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.platform_admins pa
    where pa.user_id = user_uuid
      and pa.status = 'active'
      and pa.role = 'super_admin'
  );
$$;

alter table public.platform_admins enable row level security;

drop policy if exists platform_admins_super_admin_read on public.platform_admins;
create policy platform_admins_super_admin_read on public.platform_admins
  for select to authenticated
  using (public.is_super_admin(auth.uid()));

insert into public.platform_admins (user_id, email, role, status)
values ('ba777d45-4af0-4659-8cb3-edd8e0d204a2', 'admin@gpbm.in', 'super_admin', 'active')
on conflict (user_id) do update set
  email = excluded.email,
  role = 'super_admin',
  status = 'active',
  updated_at = now();

insert into public.business_users (business_id, user_id, role)
select b.id, 'ba777d45-4af0-4659-8cb3-edd8e0d204a2', 'owner'
from public.businesses b
where b.slug = 'gpbm'
on conflict (business_id, user_id) do update set role = 'owner';

grant select on public.platform_admins to authenticated;