-- Referral Navigator starter schema.
-- Referrals are stored as patient-owned JSON payloads while the prototype's
-- data model is validated. Do not use real patient information until all
-- required HIPAA agreements and security controls are in place.

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text not null default '',
  preferred_language text not null default 'en',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.referrals (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users (id) on delete cascade,
  referral_key text not null,
  data jsonb not null check (jsonb_typeof(data) = 'object'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint referrals_owner_key_unique unique (owner_id, referral_key)
);

create index if not exists referrals_owner_created_at_idx
  on public.referrals (owner_id, created_at desc);

alter table public.profiles enable row level security;
alter table public.referrals enable row level security;

revoke all on public.profiles from anon;
revoke all on public.referrals from anon;
grant select, insert, update, delete on public.profiles to authenticated;
grant select, insert, update, delete on public.referrals to authenticated;

create policy "Patients can view their own profile"
  on public.profiles for select to authenticated
  using ((select auth.uid()) = id);

create policy "Patients can update their own profile"
  on public.profiles for update to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

create policy "Patients can view their own referrals"
  on public.referrals for select to authenticated
  using ((select auth.uid()) = owner_id);

create policy "Patients can create their own referrals"
  on public.referrals for insert to authenticated
  with check ((select auth.uid()) = owner_id);

create policy "Patients can update their own referrals"
  on public.referrals for update to authenticated
  using ((select auth.uid()) = owner_id)
  with check ((select auth.uid()) = owner_id);

create policy "Patients can delete their own referrals"
  on public.referrals for delete to authenticated
  using ((select auth.uid()) = owner_id);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

create trigger referrals_set_updated_at
  before update on public.referrals
  for each row execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, display_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', '')
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
