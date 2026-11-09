-- =========================================================================
-- Marketing effectiveness app — initial schema
-- Covers: users, roles and brand scope (NF-102-001/002, FR-204-002),
-- activations with drafts (FR-101-009), unique Activity ID (FR-101-007),
-- submission / validation / rejection / cancellation (FR-101-012..015),
-- and history of status changes and post-rejection edits (FR-101-016).
-- =========================================================================

create extension if not exists pgcrypto;
create schema if not exists app;

-- ---------- Types ----------
create type public.app_role as enum ('brand_manager', 'brand_lead', 'management', 'owner_admin');
-- Register lifecycle (FR-101-015). 'rejected' keeps the reason visible and lets the owner edit and resubmit.
create type public.activity_status as enum ('draft', 'submitted', 'validated', 'rejected', 'in_progress', 'completed', 'cancelled');

-- ---------- Referentials (FR-101-003, FR-203-001: logical deactivation only) ----------
create table public.brands (
  id smallint generated always as identity primary key,
  name text not null unique,
  active boolean not null default true
);
create table public.divisions (
  id smallint generated always as identity primary key,
  name text not null unique,
  active boolean not null default true
);

-- ---------- People ----------
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text not null,
  short_name text,
  initials text,
  role public.app_role not null default 'brand_manager',
  active boolean not null default true,
  created_at timestamptz not null default now()
);
create table public.profile_brands (
  profile_id uuid not null references public.profiles (id) on delete cascade,
  brand_id smallint not null references public.brands (id),
  primary key (profile_id, brand_id)
);
-- The employee ID is the field user's sign-in secret: never readable through the API.
create table public.field_credentials (
  profile_id uuid primary key references public.profiles (id) on delete cascade,
  employee_id text not null unique check (employee_id = upper(employee_id))
);
create table public.login_attempts (
  id bigint generated always as identity primary key,
  ip text,
  success boolean not null,
  at timestamptz not null default now()
);
create index login_attempts_ip_at on public.login_attempts (ip, at);

-- ---------- Activations ----------
create sequence public.activity_code_seq;
create table public.activities (
  id uuid primary key default gen_random_uuid(),
  code text not null unique default ('HBA-' || lpad(nextval('public.activity_code_seq')::text, 6, '0')),
  owner_id uuid not null references public.profiles (id),
  activity_type text not null,
  activity_name text,
  brand text references public.brands (name) on update cascade,
  division text[] not null default '{}',
  city text,
  start_date date,
  end_date date,
  status public.activity_status not null default 'draft',
  stage smallint not null default 0,
  answers jsonb not null default '{}'::jsonb,
  submitted_at timestamptz,
  decided_at timestamptz,
  decided_by uuid references public.profiles (id),
  decision_comment text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint activity_dates_ordered check (start_date is null or end_date is null or end_date >= start_date)
);
create index activities_owner on public.activities (owner_id);
create index activities_status on public.activities (status);
create index activities_brand on public.activities (brand);

create table public.activity_history (
  id bigint generated always as identity primary key,
  activity_id uuid not null references public.activities (id) on delete cascade,
  event text not null,
  actor_id uuid references public.profiles (id),
  comment text,
  old_status public.activity_status,
  new_status public.activity_status,
  changes jsonb,
  at timestamptz not null default now()
);
create index activity_history_activity on public.activity_history (activity_id, at);

-- ---------- Helper functions (private schema, not exposed by the API) ----------
create or replace function app.my_role() returns public.app_role
language sql stable security definer set search_path = public as $$
  select role from public.profiles where id = auth.uid() and active
$$;

create or replace function app.my_brands() returns text[]
language sql stable security definer set search_path = public as $$
  select coalesce(array_agg(b.name), '{}')
  from public.profile_brands pb join public.brands b on b.id = pb.brand_id
  where pb.profile_id = auth.uid()
$$;

-- NF-102-002 / FR-201-001: Management and Owner/Admin see everything; others see their assigned brands.
create or replace function app.can_see_brand(p_brand text) returns boolean
language sql stable security definer set search_path = public, app as $$
  select case
    when app.my_role() is null then false
    when app.my_role() in ('management', 'owner_admin') then true
    else p_brand = any (app.my_brands())
  end
$$;

create or replace function app.is_approver() returns boolean
language sql stable security definer set search_path = public, app as $$
  select coalesce(app.my_role() in ('brand_lead', 'management', 'owner_admin'), false)
$$;

grant usage on schema app to authenticated;
grant execute on all functions in schema app to authenticated;

-- ---------- Triggers ----------
-- Direct API writes (role "authenticated") can never set workflow fields; only the functions below can.
create or replace function app.guard_activity() returns trigger
language plpgsql as $$
begin
  if current_user in ('authenticated', 'anon') then
    if tg_op = 'INSERT' then
      new.owner_id := auth.uid();
      new.status := 'draft';
      new.submitted_at := null;
      new.decided_at := null;
      new.decided_by := null;
      new.decision_comment := null;
    else
      new.id := old.id;
      new.code := old.code;
      new.owner_id := old.owner_id;
      new.status := old.status;
      new.submitted_at := old.submitted_at;
      new.decided_at := old.decided_at;
      new.decided_by := old.decided_by;
      new.decision_comment := old.decision_comment;
      new.created_at := old.created_at;
    end if;
  end if;
  new.updated_at := now();
  return new;
end $$;
create trigger activities_guard before insert or update on public.activities
for each row execute function app.guard_activity();

create or replace function app.log_activity_change() returns trigger
language plpgsql security definer set search_path = public as $$
declare
  diff jsonb;
begin
  if tg_op = 'INSERT' then
    insert into public.activity_history (activity_id, event, actor_id, new_status)
    values (new.id, 'Created', auth.uid(), new.status);
  -- Edits after a rejection are traced field by field (draft autosaves are not).
  elsif old.status = 'rejected' and new.status = 'rejected' and new.answers is distinct from old.answers then
    select jsonb_object_agg(k, jsonb_build_object('old', old.answers -> k, 'new', new.answers -> k))
      into diff
    from jsonb_object_keys(old.answers || new.answers) as k
    where old.answers -> k is distinct from new.answers -> k;
    insert into public.activity_history (activity_id, event, actor_id, changes)
    values (new.id, 'Edited', auth.uid(), diff);
  end if;
  return null;
end $$;
create trigger activities_log after insert or update on public.activities
for each row execute function app.log_activity_change();

-- ---------- Row-level security ----------
alter table public.brands enable row level security;
alter table public.divisions enable row level security;
alter table public.profiles enable row level security;
alter table public.profile_brands enable row level security;
alter table public.field_credentials enable row level security;
alter table public.login_attempts enable row level security;
alter table public.activities enable row level security;
alter table public.activity_history enable row level security;

revoke all on all tables in schema public from anon, authenticated;
grant select on public.brands, public.divisions, public.profiles, public.profile_brands to authenticated;
grant select, insert, update, delete on public.activities to authenticated;
grant select on public.activity_history to authenticated;
grant usage, select on sequence public.activity_code_seq to authenticated;
-- field_credentials and login_attempts: no grants, no policies (service role only).

create policy "active users read referentials" on public.brands for select to authenticated using (app.my_role() is not null);
create policy "active users read divisions" on public.divisions for select to authenticated using (app.my_role() is not null);
create policy "active users read profiles" on public.profiles for select to authenticated using (app.my_role() is not null);
create policy "active users read brand assignments" on public.profile_brands for select to authenticated using (app.my_role() is not null);

-- Drafts are private to their owner; everything else follows brand scope.
create policy "read activities in scope" on public.activities for select to authenticated
  using (owner_id = auth.uid() and app.my_role() is not null or status <> 'draft' and app.can_see_brand(brand));

create policy "brand managers create drafts for their brands" on public.activities for insert to authenticated
  with check (app.my_role() is not null and (brand is null or app.can_see_brand(brand)));

-- FR-101-012: editable by the owner only while draft or rejected.
create policy "owners edit drafts and rejected activities" on public.activities for update to authenticated
  using (owner_id = auth.uid() and status in ('draft', 'rejected') and app.my_role() is not null)
  with check (owner_id = auth.uid() and (brand is null or app.can_see_brand(brand)));

create policy "owners delete their drafts" on public.activities for delete to authenticated
  using (owner_id = auth.uid() and status = 'draft');

create policy "read history of visible activities" on public.activity_history for select to authenticated
  using (exists (select 1 from public.activities a where a.id = activity_id));

-- ---------- Workflow functions (the only way to change status) ----------
create or replace function public.submit_activity(p_activity uuid) returns public.activities
language plpgsql security definer set search_path = public, app as $$
declare
  a public.activities;
  previous public.activity_status;
  missing text[] := '{}';
begin
  select * into a from public.activities where id = p_activity for update;
  if not found or a.owner_id <> auth.uid() or app.my_role() is null then
    raise exception 'Activity not found.' using errcode = 'P0002';
  end if;
  if a.status not in ('draft', 'rejected') then
    raise exception 'Only a draft or rejected activity can be submitted.' using errcode = 'P0001';
  end if;
  -- FR-101-008: name every missing mandatory field.
  if coalesce(trim(a.activity_name), '') = '' then missing := array_append(missing, 'activity name'); end if;
  if a.brand is null then missing := array_append(missing, 'brand'); end if;
  if cardinality(a.division) = 0 then missing := array_append(missing, 'division'); end if;
  if coalesce(trim(a.city), '') = '' then missing := array_append(missing, 'city'); end if;
  if a.start_date is null then missing := array_append(missing, 'start date'); end if;
  if a.end_date is null then missing := array_append(missing, 'end date'); end if;
  if cardinality(missing) > 0 then
    raise exception 'Missing mandatory fields: %.', array_to_string(missing, ', ') using errcode = 'P0001';
  end if;
  if not app.can_see_brand(a.brand) then
    raise exception 'You can only submit activities for your assigned brands.' using errcode = '42501';
  end if;
  previous := a.status;

  update public.activities
     set status = 'submitted', submitted_at = now(), decided_at = null, decided_by = null, decision_comment = null
   where id = a.id
   returning * into a;
  insert into public.activity_history (activity_id, event, actor_id, old_status, new_status)
  values (a.id, case when exists (select 1 from public.activity_history h where h.activity_id = a.id and h.event in ('Submitted', 'Resubmitted')) then 'Resubmitted' else 'Submitted' end,
          auth.uid(), previous, 'submitted');
  return a;
end $$;

-- FR-101-013 / FR-101-014: approve, or reject with a mandatory reason.
create or replace function public.decide_activity(p_activity uuid, p_outcome text, p_comment text default null) returns public.activities
language plpgsql security definer set search_path = public, app as $$
declare
  a public.activities;
  reason text := nullif(trim(coalesce(p_comment, '')), '');
begin
  if not app.is_approver() then
    raise exception 'You are not allowed to decide on activities.' using errcode = '42501';
  end if;
  if p_outcome not in ('validated', 'rejected') then
    raise exception 'Unknown decision.' using errcode = 'P0001';
  end if;
  select * into a from public.activities where id = p_activity for update;
  if not found or not app.can_see_brand(a.brand) then
    raise exception 'Activity not found.' using errcode = 'P0002';
  end if;
  if a.status <> 'submitted' then
    raise exception 'Only a submitted activity can be approved or rejected.' using errcode = 'P0001';
  end if;
  if p_outcome = 'rejected' and reason is null then
    raise exception 'A reason is required to reject this activity.' using errcode = 'P0001';
  end if;

  update public.activities
     set status = p_outcome::public.activity_status, decided_at = now(), decided_by = auth.uid(), decision_comment = reason
   where id = a.id
   returning * into a;
  insert into public.activity_history (activity_id, event, actor_id, comment, old_status, new_status)
  values (a.id, case when p_outcome = 'validated' then 'Approved' else 'Rejected' end, auth.uid(), reason, 'submitted', a.status);
  return a;
end $$;

create or replace function public.cancel_activity(p_activity uuid, p_comment text default null) returns public.activities
language plpgsql security definer set search_path = public, app as $$
declare
  a public.activities;
  previous public.activity_status;
begin
  select * into a from public.activities where id = p_activity for update;
  if not found or not (a.owner_id = auth.uid() and app.my_role() is not null or (app.is_approver() and app.can_see_brand(a.brand))) then
    raise exception 'Activity not found.' using errcode = 'P0002';
  end if;
  if a.status not in ('submitted', 'validated', 'rejected') then
    raise exception 'This activity can no longer be cancelled.' using errcode = 'P0001';
  end if;
  previous := a.status;
  update public.activities set status = 'cancelled' where id = a.id returning * into a;
  insert into public.activity_history (activity_id, event, actor_id, comment, old_status, new_status)
  values (a.id, 'Cancelled', auth.uid(), nullif(trim(coalesce(p_comment, '')), ''), previous, 'cancelled');
  return a;
end $$;

-- The signed-in user's own profile, including their own employee ID.
create or replace function public.get_my_profile() returns jsonb
language sql stable security definer set search_path = public, app as $$
  select jsonb_build_object(
    'id', p.id, 'full_name', p.full_name, 'short_name', p.short_name, 'initials', p.initials,
    'role', p.role, 'active', p.active, 'brands', app.my_brands(),
    'employee_id', (select employee_id from public.field_credentials c where c.profile_id = p.id)
  )
  from public.profiles p where p.id = auth.uid() and p.active
$$;

revoke execute on function public.submit_activity(uuid), public.decide_activity(uuid, text, text),
  public.cancel_activity(uuid, text), public.get_my_profile() from public, anon;
grant execute on function public.submit_activity(uuid), public.decide_activity(uuid, text, text),
  public.cancel_activity(uuid, text), public.get_my_profile() to authenticated;