-- Oakmont personal recordkeeping demo setup for Supabase
-- This stores illustrative user-entered records only; it does not hold or move money.
-- Safe to re-run for this schema: policies and trigger are replaced by name.

create extension if not exists pgcrypto;

create table if not exists public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default 'Account holder'
    check (char_length(full_name) <= 80),
  created_at timestamptz not null default now()
);

create table if not exists public.accounts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  balance numeric(14,2) not null default 0 check (balance >= 0),
  currency text not null default 'CAD' check (currency = 'CAD'),
  created_at timestamptz not null default now()
);

create table if not exists public.transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  kind text not null check (kind in ('credit', 'debit', 'request')),
  description text not null check (char_length(description) between 1 and 120),
  amount numeric(14,2) not null check (amount > 0),
  created_at timestamptz not null default now()
);

-- Turn on row-level security for every table exposed to the website.
alter table public.profiles enable row level security;
alter table public.accounts enable row level security;
alter table public.transactions enable row level security;

-- Remove/recreate only this setup's policies, so re-running the script is supported.
drop policy if exists "oakmont_profiles_select_own" on public.profiles;
create policy "oakmont_profiles_select_own"
  on public.profiles for select to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "oakmont_profiles_insert_own" on public.profiles;
create policy "oakmont_profiles_insert_own"
  on public.profiles for insert to authenticated
  with check ((select auth.uid()) = user_id);

drop policy if exists "oakmont_profiles_update_own" on public.profiles;
create policy "oakmont_profiles_update_own"
  on public.profiles for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

drop policy if exists "oakmont_accounts_select_own" on public.accounts;
create policy "oakmont_accounts_select_own"
  on public.accounts for select to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "oakmont_transactions_select_own" on public.transactions;
create policy "oakmont_transactions_select_own"
  on public.transactions for select to authenticated
  using ((select auth.uid()) = user_id);

-- Create a personal profile and zero-value record when a new user signs up.
create or replace function public.create_user_records()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (user_id, full_name)
  values (
    new.id,
    coalesce(nullif(new.raw_user_meta_data ->> 'full_name', ''), 'Account holder')
  )
  on conflict (user_id) do nothing;

  insert into public.accounts (user_id, balance, currency)
  values (new.id, 0, 'CAD')
  on conflict (user_id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created_oakmont on auth.users;
create trigger on_auth_user_created_oakmont
after insert on auth.users
for each row execute function public.create_user_records();

-- Record a demo entry for the signed-in user only.
create or replace function public.record_account_entry(
  p_kind text,
  p_description text,
  p_amount numeric
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := auth.uid();
  v_amount numeric(14,2);
  v_balance numeric(14,2);
begin
  if v_user_id is null then
    return jsonb_build_object('ok', false, 'error', 'Please sign in first.');
  end if;

  if p_kind is null or p_kind not in ('credit', 'debit', 'request') then
    return jsonb_build_object('ok', false, 'error', 'Invalid entry type.');
  end if;

  if p_description is null
     or char_length(trim(p_description)) < 1
     or char_length(trim(p_description)) > 120 then
    return jsonb_build_object('ok', false, 'error', 'Enter a description up to 120 characters.');
  end if;

  if p_amount is null or p_amount <= 0 or p_amount > 100000000 then
    return jsonb_build_object('ok', false, 'error', 'Enter a valid positive amount.');
  end if;

  v_amount := round(p_amount, 2);
  if v_amount <= 0 then
    return jsonb_build_object('ok', false, 'error', 'Amount must be at least 0.01.');
  end if;

  select balance into v_balance
  from public.accounts
  where user_id = v_user_id
  for update;

  if not found then
    return jsonb_build_object('ok', false, 'error', 'No personal record exists for this user.');
  end if;

  if p_kind = 'debit' and v_balance < v_amount then
    return jsonb_build_object('ok', false, 'error', 'This entry would make the recorded balance negative.');
  end if;

  if p_kind = 'credit' then
    update public.accounts
    set balance = balance + v_amount
    where user_id = v_user_id;
  elsif p_kind = 'debit' then
    update public.accounts
    set balance = balance - v_amount
    where user_id = v_user_id;
  end if;

  insert into public.transactions (user_id, kind, description, amount)
  values (v_user_id, p_kind, trim(p_description), v_amount);

  return jsonb_build_object('ok', true);
end;
$$;

-- Allow signed-in users to read their own rows and save their own profile.
grant usage on schema public to authenticated;
grant select on public.profiles, public.accounts, public.transactions to authenticated;
grant insert, update on public.profiles to authenticated;

-- Do not expose this function to anonymous visitors.
revoke all on function public.record_account_entry(text, text, numeric) from public;
revoke all on function public.record_account_entry(text, text, numeric) from anon;
grant execute on function public.record_account_entry(text, text, numeric) to authenticated;
