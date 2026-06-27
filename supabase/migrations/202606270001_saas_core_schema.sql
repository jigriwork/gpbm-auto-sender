-- GPBM Auto Sender SaaS core schema.
-- GPBM, Go Planet, Brand Mark, MSG91, and Logic are seed/demo data only.

create extension if not exists "pgcrypto";

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function public.is_business_member(target_business_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.business_users bu
    where bu.business_id = target_business_id
      and bu.user_id = auth.uid()
  );
$$;

create or replace function public.has_business_role(target_business_id uuid, allowed_roles text[])
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.business_users bu
    where bu.business_id = target_business_id
      and bu.user_id = auth.uid()
      and bu.role = any(allowed_roles)
  );
$$;

create table public.businesses (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique,
  status text default 'active',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table public.business_users (
  id uuid primary key default gen_random_uuid(),
  business_id uuid references public.businesses(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  role text not null check (role in ('owner','admin','staff','viewer')),
  created_at timestamptz default now(),
  unique (business_id, user_id)
);

create table public.stores (
  id uuid primary key default gen_random_uuid(),
  business_id uuid references public.businesses(id) on delete cascade,
  name text not null,
  code text,
  status text default 'active',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create unique index stores_business_code_unique_idx
  on public.stores (business_id, code)
  where code is not null;

create table public.billing_sources (
  id uuid primary key default gen_random_uuid(),
  business_id uuid references public.businesses(id) on delete cascade,
  store_id uuid references public.stores(id) on delete set null,
  name text not null,
  source_type text not null,
  software_name text,
  config jsonb default '{}'::jsonb,
  status text default 'active',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table public.parser_profiles (
  id uuid primary key default gen_random_uuid(),
  business_id uuid references public.businesses(id) on delete cascade,
  store_id uuid references public.stores(id) on delete set null,
  billing_source_id uuid references public.billing_sources(id) on delete set null,
  name text not null,
  parser_key text not null,
  config jsonb default '{}'::jsonb,
  status text default 'active',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table public.whatsapp_providers (
  id uuid primary key default gen_random_uuid(),
  provider_key text unique not null,
  display_name text not null,
  status text default 'active',
  config_schema jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);

create table public.provider_credentials (
  id uuid primary key default gen_random_uuid(),
  business_id uuid references public.businesses(id) on delete cascade,
  provider_key text not null,
  display_name text,
  encrypted_credentials jsonb not null default '{}'::jsonb,
  is_default boolean default false,
  status text default 'active',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create unique index provider_credentials_one_default_idx
  on public.provider_credentials (business_id)
  where is_default is true and status = 'active';

create table public.whatsapp_templates (
  id uuid primary key default gen_random_uuid(),
  business_id uuid references public.businesses(id) on delete cascade,
  store_id uuid references public.stores(id) on delete set null,
  provider_key text not null,
  template_name text not null,
  template_id text,
  language text default 'en',
  category text,
  variable_mapping jsonb default '{}'::jsonb,
  status text default 'active',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table public.agent_devices (
  id uuid primary key default gen_random_uuid(),
  business_id uuid references public.businesses(id) on delete cascade,
  store_id uuid references public.stores(id) on delete cascade,
  name text not null,
  device_code text unique,
  agent_token_hash text not null,
  status text default 'active',
  last_seen_at timestamptz,
  app_version text,
  machine_name text,
  config jsonb default '{}'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table public.bill_documents (
  id uuid primary key default gen_random_uuid(),
  business_id uuid references public.businesses(id) on delete cascade,
  store_id uuid references public.stores(id) on delete cascade,
  agent_device_id uuid references public.agent_devices(id) on delete set null,
  billing_source_id uuid references public.billing_sources(id) on delete set null,
  parser_profile_id uuid references public.parser_profiles(id) on delete set null,
  customer_name text,
  customer_mobile text,
  bill_number text,
  bill_date date,
  bill_amount numeric,
  currency text default 'INR',
  pdf_storage_path text,
  pdf_hash text,
  source_file_name text,
  source_file_path text,
  extraction_confidence numeric,
  status text not null check (status in ('detected','parsing','parsed','parsing_failed','invalid_mobile','duplicate','queued','uploading','sending','sent','failed','retrying')),
  provider_key text,
  provider_message_id text,
  error_message text,
  retry_count integer default 0,
  sent_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create unique index bill_documents_business_store_bill_mobile_unique_idx
  on public.bill_documents (business_id, store_id, bill_number, bill_date, customer_mobile)
  where bill_number is not null and customer_mobile is not null;

create index bill_documents_pdf_hash_idx on public.bill_documents (pdf_hash);
create index bill_documents_business_status_idx on public.bill_documents (business_id, status);
create index bill_documents_business_created_at_idx on public.bill_documents (business_id, created_at desc);
create index bill_documents_business_store_created_at_idx on public.bill_documents (business_id, store_id, created_at desc);

create table public.bill_events (
  id uuid primary key default gen_random_uuid(),
  business_id uuid references public.businesses(id) on delete cascade,
  bill_document_id uuid references public.bill_documents(id) on delete cascade,
  event_type text not null,
  status_from text,
  status_to text,
  message text,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);

create table public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  business_id uuid references public.businesses(id) on delete set null,
  user_id uuid references auth.users(id) on delete set null,
  action text not null,
  entity_type text,
  entity_id uuid,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);

create table public.subscription_plans (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  code text unique not null,
  price_monthly numeric,
  price_yearly numeric,
  limits jsonb default '{}'::jsonb,
  status text default 'active',
  created_at timestamptz default now()
);

create table public.business_subscriptions (
  id uuid primary key default gen_random_uuid(),
  business_id uuid references public.businesses(id) on delete cascade,
  plan_id uuid references public.subscription_plans(id) on delete set null,
  status text default 'trial',
  started_at timestamptz default now(),
  ends_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create view public.provider_credentials_safe as
select
  id,
  business_id,
  provider_key,
  display_name,
  is_default,
  status,
  created_at,
  updated_at,
  true as credentials_configured
from public.provider_credentials
where public.has_business_role(business_id, array['owner','admin']);

create trigger businesses_updated_at before update on public.businesses for each row execute function public.set_updated_at();
create trigger stores_updated_at before update on public.stores for each row execute function public.set_updated_at();
create trigger billing_sources_updated_at before update on public.billing_sources for each row execute function public.set_updated_at();
create trigger parser_profiles_updated_at before update on public.parser_profiles for each row execute function public.set_updated_at();
create trigger provider_credentials_updated_at before update on public.provider_credentials for each row execute function public.set_updated_at();
create trigger whatsapp_templates_updated_at before update on public.whatsapp_templates for each row execute function public.set_updated_at();
create trigger agent_devices_updated_at before update on public.agent_devices for each row execute function public.set_updated_at();
create trigger bill_documents_updated_at before update on public.bill_documents for each row execute function public.set_updated_at();
create trigger business_subscriptions_updated_at before update on public.business_subscriptions for each row execute function public.set_updated_at();

alter table public.businesses enable row level security;
alter table public.business_users enable row level security;
alter table public.stores enable row level security;
alter table public.billing_sources enable row level security;
alter table public.parser_profiles enable row level security;
alter table public.whatsapp_providers enable row level security;
alter table public.provider_credentials enable row level security;
alter table public.whatsapp_templates enable row level security;
alter table public.agent_devices enable row level security;
alter table public.bill_documents enable row level security;
alter table public.bill_events enable row level security;
alter table public.audit_logs enable row level security;
alter table public.subscription_plans enable row level security;
alter table public.business_subscriptions enable row level security;

create policy businesses_member_select on public.businesses for select to authenticated using (public.is_business_member(id));
create policy businesses_admin_update on public.businesses for update to authenticated using (public.has_business_role(id, array['owner','admin'])) with check (public.has_business_role(id, array['owner','admin']));

create policy business_users_member_select on public.business_users for select to authenticated using (public.is_business_member(business_id));
create policy business_users_admin_manage on public.business_users for all to authenticated using (public.has_business_role(business_id, array['owner','admin'])) with check (public.has_business_role(business_id, array['owner','admin']));

create policy stores_member_select on public.stores for select to authenticated using (public.is_business_member(business_id));
create policy stores_admin_manage on public.stores for all to authenticated using (public.has_business_role(business_id, array['owner','admin'])) with check (public.has_business_role(business_id, array['owner','admin']));

create policy billing_sources_member_select on public.billing_sources for select to authenticated using (public.is_business_member(business_id));
create policy billing_sources_admin_manage on public.billing_sources for all to authenticated using (public.has_business_role(business_id, array['owner','admin'])) with check (public.has_business_role(business_id, array['owner','admin']));

create policy parser_profiles_member_select on public.parser_profiles for select to authenticated using (public.is_business_member(business_id));
create policy parser_profiles_admin_manage on public.parser_profiles for all to authenticated using (public.has_business_role(business_id, array['owner','admin'])) with check (public.has_business_role(business_id, array['owner','admin']));

create policy whatsapp_providers_authenticated_select on public.whatsapp_providers for select to authenticated using (true);

create policy provider_credentials_admin_only on public.provider_credentials for all to authenticated using (public.has_business_role(business_id, array['owner','admin'])) with check (public.has_business_role(business_id, array['owner','admin']));

create policy whatsapp_templates_member_select on public.whatsapp_templates for select to authenticated using (public.is_business_member(business_id));
create policy whatsapp_templates_admin_manage on public.whatsapp_templates for all to authenticated using (public.has_business_role(business_id, array['owner','admin'])) with check (public.has_business_role(business_id, array['owner','admin']));

create policy agent_devices_member_select on public.agent_devices for select to authenticated using (public.is_business_member(business_id));
create policy agent_devices_admin_manage on public.agent_devices for all to authenticated using (public.has_business_role(business_id, array['owner','admin'])) with check (public.has_business_role(business_id, array['owner','admin']));

create policy bill_documents_member_select on public.bill_documents for select to authenticated using (public.is_business_member(business_id));
create policy bill_documents_staff_insert on public.bill_documents for insert to authenticated with check (public.has_business_role(business_id, array['owner','admin','staff']));
create policy bill_documents_staff_update on public.bill_documents for update to authenticated using (public.has_business_role(business_id, array['owner','admin','staff'])) with check (public.has_business_role(business_id, array['owner','admin','staff']));

create policy bill_events_member_select on public.bill_events for select to authenticated using (public.is_business_member(business_id));
create policy bill_events_staff_insert on public.bill_events for insert to authenticated with check (public.has_business_role(business_id, array['owner','admin','staff']));

create policy audit_logs_member_select on public.audit_logs for select to authenticated using (public.is_business_member(business_id));
create policy audit_logs_admin_insert on public.audit_logs for insert to authenticated with check (business_id is null or public.has_business_role(business_id, array['owner','admin']));

create policy subscription_plans_authenticated_select on public.subscription_plans for select to authenticated using (true);
create policy business_subscriptions_member_select on public.business_subscriptions for select to authenticated using (public.is_business_member(business_id));
create policy business_subscriptions_admin_manage on public.business_subscriptions for all to authenticated using (public.has_business_role(business_id, array['owner','admin'])) with check (public.has_business_role(business_id, array['owner','admin']));

insert into public.whatsapp_providers (provider_key, display_name, status, config_schema)
values
  ('msg91', 'MSG91', 'active', '{"credential_fields":["auth_key","integrated_number","namespace"]}'::jsonb),
  ('custom_api', 'Custom API', 'active', '{"credential_fields":["endpoint","method","headers"]}'::jsonb),
  ('interakt_coming_soon', 'Interakt Coming Soon', 'disabled', '{}'::jsonb),
  ('wati_coming_soon', 'WATI Coming Soon', 'disabled', '{}'::jsonb),
  ('aisensy_coming_soon', 'AiSensy Coming Soon', 'disabled', '{}'::jsonb),
  ('gupshup_coming_soon', 'Gupshup Coming Soon', 'disabled', '{}'::jsonb),
  ('zoko_coming_soon', 'Zoko Coming Soon', 'disabled', '{}'::jsonb)
on conflict (provider_key) do update set display_name = excluded.display_name, status = excluded.status, config_schema = excluded.config_schema;

insert into public.subscription_plans (name, code, price_monthly, price_yearly, limits, status)
values
  ('Starter', 'starter', 0, 0, '{"stores":2,"agents":2,"bills_per_month":1000}'::jsonb, 'active'),
  ('Growth', 'growth', null, null, '{"stores":10,"agents":10,"bills_per_month":10000}'::jsonb, 'active'),
  ('Scale', 'scale', null, null, '{"stores":50,"agents":50,"bills_per_month":100000}'::jsonb, 'active'),
  ('Enterprise', 'enterprise', null, null, '{"stores":"custom","agents":"custom","bills_per_month":"custom"}'::jsonb, 'active')
on conflict (code) do update set name = excluded.name, limits = excluded.limits, status = excluded.status;

with demo_business as (
  insert into public.businesses (name, slug, status)
  values ('GPBM', 'gpbm', 'active')
  on conflict (slug) do update set name = excluded.name, status = excluded.status
  returning id
), demo_stores as (
  insert into public.stores (business_id, name, code, status)
  select id, 'Go Planet', 'GP', 'active' from demo_business
  union all
  select id, 'Brand Mark', 'BM', 'active' from demo_business
  on conflict (business_id, code) where code is not null do update set name = excluded.name, status = excluded.status
  returning id, business_id, code
), demo_sources as (
  insert into public.billing_sources (business_id, store_id, name, source_type, software_name, config, status)
  select business_id, id, 'Generic PDF Folder Watcher', 'generic_pdf_folder', null, '{"watcher":"folder_pdf"}'::jsonb, 'active'
  from demo_stores
  on conflict do nothing
  returning id, business_id, store_id
), demo_plan as (
  select id from public.subscription_plans where code = 'starter'
)
insert into public.business_subscriptions (business_id, plan_id, status)
select demo_business.id, demo_plan.id, 'trial'
from demo_business, demo_plan
where not exists (select 1 from public.business_subscriptions bs where bs.business_id = demo_business.id);

insert into public.parser_profiles (business_id, store_id, billing_source_id, name, parser_key, config, status)
select b.id, null, null, profile.name, profile.parser_key, profile.config, 'active'
from public.businesses b
cross join (values
  ('generic_pdf_v1', 'generic_pdf_v1', '{"required_fields":["customer_mobile","bill_number","bill_date"],"confidence_threshold":0.75}'::jsonb),
  ('logic_pdf_v1', 'logic_pdf_v1', '{"placeholder":true,"note":"Future Logic PDF profile; generic folder watcher remains source-agnostic."}'::jsonb)
) as profile(name, parser_key, config)
where b.slug = 'gpbm'
  and not exists (select 1 from public.parser_profiles pp where pp.business_id = b.id and pp.name = profile.name);

insert into public.parser_profiles (business_id, store_id, billing_source_id, name, parser_key, config, status)
select s.business_id, s.id, bs.id, profile.name, profile.parser_key, profile.config, 'active'
from public.stores s
left join public.billing_sources bs on bs.store_id = s.id and bs.source_type = 'generic_pdf_folder'
cross join lateral (
  values (
    case when s.code = 'GP' then 'gpbm_go_planet_demo' else 'gpbm_brand_mark_demo' end,
    'generic_pdf_v1',
    jsonb_build_object('demo', true, 'store_code', s.code)
  )
) as profile(name, parser_key, config)
join public.businesses b on b.id = s.business_id and b.slug = 'gpbm'
where s.code in ('GP','BM')
  and not exists (select 1 from public.parser_profiles pp where pp.business_id = s.business_id and pp.name = profile.name);

insert into public.provider_credentials (business_id, provider_key, display_name, encrypted_credentials, is_default, status)
select id, 'msg91', 'MSG91 Demo Placeholder', '{}'::jsonb, true, 'active'
from public.businesses
where slug = 'gpbm'
  and not exists (select 1 from public.provider_credentials pc where pc.business_id = businesses.id and pc.provider_key = 'msg91');

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('bill-pdfs', 'bill-pdfs', false, 52428800, array['application/pdf'])
on conflict (id) do update set public = false, file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;

create policy bill_pdfs_member_read on storage.objects
  for select to authenticated
  using (
    bucket_id = 'bill-pdfs'
    and public.is_business_member((storage.foldername(name))[1]::uuid)
  );

create policy bill_pdfs_admin_write on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'bill-pdfs'
    and public.has_business_role((storage.foldername(name))[1]::uuid, array['owner','admin'])
  );

grant usage on schema public to anon, authenticated;
revoke all on public.provider_credentials from anon, authenticated;
grant select (id, business_id, provider_key, display_name, is_default, status, created_at, updated_at) on public.provider_credentials to authenticated;
grant select on public.provider_credentials_safe to authenticated;