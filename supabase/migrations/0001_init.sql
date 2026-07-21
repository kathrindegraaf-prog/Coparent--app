-- Samen — databaseschema voor de gedeelde gezinsopslag.
--
-- Model: één gezin (household) met twee ouder-"slots" (profiles: parent_a /
-- parent_b), kinderen, een terugkerende schema-regel, eenmalige aanpassingen
-- (overrides), afspraken en taken. Toegang loopt via anonieme aanmelding
-- (Supabase Anonymous Auth) + lidmaatschappen (memberships). Alleen wie via de
-- uitnodigingscode lid is geworden, kan de gegevens van dat gezin zien/wijzigen
-- (afgedwongen met Row Level Security).
--
-- Dit script is idempotent bedoeld voor een vers project: plak het in de
-- Supabase SQL Editor en klik Run.

-- 1. Tabellen ---------------------------------------------------------------

create table if not exists public.households (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  timezone    text not null default 'Europe/Amsterdam',
  plan        text not null default 'free',
  join_code   text not null unique,
  created_at  timestamptz not null default now()
);

create table if not exists public.profiles (
  id            uuid primary key default gen_random_uuid(),
  household_id  uuid not null references public.households(id) on delete cascade,
  display_name  text not null,
  role          text not null check (role in ('parent_a', 'parent_b')),
  color         text not null,
  is_owner      boolean not null default false,
  created_at    timestamptz not null default now()
);

create table if not exists public.children (
  id            uuid primary key default gen_random_uuid(),
  household_id  uuid not null references public.households(id) on delete cascade,
  name          text not null,
  created_at    timestamptz not null default now()
);

create table if not exists public.schedule_rules (
  id                     uuid primary key default gen_random_uuid(),
  household_id           uuid not null references public.households(id) on delete cascade,
  active_from            date not null,
  weekday_assignment     jsonb not null default '{}'::jsonb,
  weekend_enabled        boolean not null default true,
  weekend_days           int[] not null default '{5,6,7}',
  friday_handover        boolean not null default true,
  weekend_anchor_date    date not null,
  weekend_anchor_parent  uuid,
  created_at             timestamptz not null default now()
);

create table if not exists public.schedule_overrides (
  id                    uuid primary key default gen_random_uuid(),
  household_id          uuid not null references public.households(id) on delete cascade,
  date                  date not null,
  assigned_to           uuid,
  child_assignments     jsonb,
  extra_meal_parent_id  uuid,
  is_star               boolean not null default false,
  logistics             text,
  reason                text,
  note                  text,
  created_by            uuid,
  created_at            timestamptz not null default now(),
  unique (household_id, date)
);

create table if not exists public.appointments (
  id                    uuid primary key default gen_random_uuid(),
  household_id          uuid not null references public.households(id) on delete cascade,
  title                 text not null,
  date                  date not null,
  start_time            text,
  end_time              text,
  child_ids             uuid[] not null default '{}',
  location              text,
  responsible_parent_id uuid,
  brought_by_id         uuid,
  picked_up_by_id       uuid,
  note                  text,
  linked_task_id        uuid,
  created_at            timestamptz not null default now()
);

create table if not exists public.tasks (
  id                    uuid primary key default gen_random_uuid(),
  household_id          uuid not null references public.households(id) on delete cascade,
  title                 text not null,
  child_id              uuid,
  responsible_parent_id uuid,
  deadline              date,
  status                text not null default 'open' check (status in ('open', 'done')),
  linked_appointment_id uuid,
  created_at            timestamptz not null default now()
);

create table if not exists public.memberships (
  id            uuid primary key default gen_random_uuid(),
  household_id  uuid not null references public.households(id) on delete cascade,
  user_id       uuid not null references auth.users(id) on delete cascade,
  profile_id    uuid references public.profiles(id) on delete set null,
  display_name  text not null,
  created_at    timestamptz not null default now(),
  unique (household_id, user_id)
);

-- 2. Hulpfunctie: is de ingelogde (anonieme) gebruiker lid van dit gezin? -----

create or replace function public.is_member(hh uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.memberships m
    where m.household_id = hh and m.user_id = auth.uid()
  );
$$;

-- 3. Row Level Security ------------------------------------------------------

alter table public.households        enable row level security;
alter table public.profiles          enable row level security;
alter table public.children          enable row level security;
alter table public.schedule_rules    enable row level security;
alter table public.schedule_overrides enable row level security;
alter table public.appointments      enable row level security;
alter table public.tasks             enable row level security;
alter table public.memberships       enable row level security;

-- Gezin zelf: leden mogen lezen en (naam e.d.) bijwerken.
drop policy if exists households_select on public.households;
create policy households_select on public.households
  for select using (public.is_member(id));
drop policy if exists households_update on public.households;
create policy households_update on public.households
  for update using (public.is_member(id)) with check (public.is_member(id));

-- Data-tabellen: volledige toegang voor leden van het gezin.
do $$
declare t text;
begin
  foreach t in array array[
    'profiles', 'children', 'schedule_rules', 'schedule_overrides',
    'appointments', 'tasks'
  ]
  loop
    execute format('drop policy if exists %I_all on public.%I;', t, t);
    execute format(
      'create policy %I_all on public.%I for all
         using (public.is_member(household_id))
         with check (public.is_member(household_id));', t, t);
  end loop;
end $$;

-- Lidmaatschappen: je ziet de leden van je eigen gezin(nen).
drop policy if exists memberships_select on public.memberships;
create policy memberships_select on public.memberships
  for select using (public.is_member(household_id) or user_id = auth.uid());

-- 4. RPC's: gezin aanmaken en je aansluiten via de code --------------------

-- Maakt een nieuw gezin, twee ouder-slots, een standaard schema-regel en een
-- lidmaatschap voor de aanmaker (parent_a). Geeft het gezin-id + de code terug.
create or replace function public.create_household(
  p_household_name text,
  p_parent_a_name  text,
  p_parent_b_name  text,
  p_child_names    text[] default '{}'
)
returns table (household_id uuid, join_code text)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid       uuid := auth.uid();
  v_hh        uuid;
  v_code      text;
  v_parent_a  uuid;
  v_parent_b  uuid;
  v_anchor    date;
  v_child     text;
begin
  if v_uid is null then
    raise exception 'Niet aangemeld';
  end if;

  v_code := substr(replace(gen_random_uuid()::text, '-', ''), 1, 12);
  -- Aankomende zaterdag als ankerpunt voor de weekendrotatie.
  v_anchor := current_date + ((6 - extract(dow from current_date)::int + 7) % 7);

  insert into public.households (name, join_code)
  values (coalesce(nullif(p_household_name, ''), 'Ons gezin'), v_code)
  returning id into v_hh;

  insert into public.profiles (household_id, display_name, role, color, is_owner)
  values (v_hh, coalesce(nullif(p_parent_a_name, ''), 'Ouder A'), 'parent_a', '#C1765A', true)
  returning id into v_parent_a;

  insert into public.profiles (household_id, display_name, role, color, is_owner)
  values (v_hh, coalesce(nullif(p_parent_b_name, ''), 'Ouder B'), 'parent_b', '#5F7E9B', false)
  returning id into v_parent_b;

  foreach v_child in array coalesce(p_child_names, '{}')
  loop
    if nullif(v_child, '') is not null then
      insert into public.children (household_id, name) values (v_hh, v_child);
    end if;
  end loop;

  insert into public.schedule_rules (
    household_id, active_from, weekday_assignment, weekend_enabled,
    weekend_days, friday_handover, weekend_anchor_date, weekend_anchor_parent
  )
  values (
    v_hh, current_date,
    jsonb_build_object(
      '1', v_parent_b::text, '2', v_parent_b::text,
      '3', v_parent_a::text, '4', v_parent_a::text
    ),
    true, '{5,6,7}', true, v_anchor, v_parent_b
  );

  insert into public.memberships (household_id, user_id, profile_id, display_name)
  values (v_hh, v_uid, v_parent_a, coalesce(nullif(p_parent_a_name, ''), 'Ouder A'));

  return query select v_hh, v_code;
end $$;

-- Sluit de ingelogde gebruiker aan bij een bestaand gezin op basis van de code.
-- p_role bepaalt welk ouder-slot je bent (meestal 'parent_b').
create or replace function public.join_household(
  p_code         text,
  p_role         text default 'parent_b',
  p_display_name text default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid     uuid := auth.uid();
  v_hh      uuid;
  v_profile uuid;
  v_name    text;
begin
  if v_uid is null then
    raise exception 'Niet aangemeld';
  end if;

  select id into v_hh from public.households where join_code = lower(trim(p_code));
  if v_hh is null then
    raise exception 'Ongeldige uitnodigingscode';
  end if;

  select id into v_profile
  from public.profiles
  where household_id = v_hh and role = p_role
  limit 1;

  v_name := coalesce(nullif(p_display_name, ''), 'Ouder');
  if v_profile is not null then
    update public.profiles set display_name = v_name where id = v_profile;
  end if;

  insert into public.memberships (household_id, user_id, profile_id, display_name)
  values (v_hh, v_uid, v_profile, v_name)
  on conflict (household_id, user_id)
  do update set profile_id = excluded.profile_id, display_name = excluded.display_name;

  return v_hh;
end $$;

grant execute on function public.create_household(text, text, text, text[]) to anon, authenticated;
grant execute on function public.join_household(text, text, text) to anon, authenticated;

-- 5. Realtime: laat wijzigingen live doorkomen ------------------------------

do $$
declare t text;
begin
  foreach t in array array[
    'households', 'profiles', 'children', 'schedule_rules',
    'schedule_overrides', 'appointments', 'tasks', 'memberships'
  ]
  loop
    begin
      execute format('alter publication supabase_realtime add table public.%I;', t);
    exception when duplicate_object then
      null; -- staat er al in
    end;
  end loop;
end $$;
