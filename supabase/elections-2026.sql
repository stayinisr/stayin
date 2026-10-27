-- Knesset 2026 forecast page (/elections-2026)
-- Run once in Supabase → SQL Editor. Safe to re-run.

create table if not exists public.election_predictions_2026 (
  user_id      uuid primary key default auth.uid() references auth.users (id) on delete cascade,
  display_name text not null check (char_length(display_name) between 1 and 40),
  seats        jsonb not null,
  updated_at   timestamptz not null default now()
);

-- seats = {"likud": 30, "shas": 0, ...}: whole numbers, 0 or 4..120, total exactly 120
create or replace function public.valid_election_seats(s jsonb)
returns boolean
language plpgsql
immutable
as $$
declare
  k text; v jsonb; n numeric; total numeric := 0; cnt int := 0;
begin
  if jsonb_typeof(s) <> 'object' then return false; end if;
  for k, v in select * from jsonb_each(s) loop
    cnt := cnt + 1;
    if cnt > 40 or char_length(k) > 30 or jsonb_typeof(v) <> 'number' then return false; end if;
    n := (v #>> '{}')::numeric;
    if n <> trunc(n) or n < 0 or n > 120 or (n between 1 and 3) then return false; end if;
    total := total + n;
  end loop;
  return total = 120;
end $$;

alter table public.election_predictions_2026
  drop constraint if exists election_seats_valid;
alter table public.election_predictions_2026
  add constraint election_seats_valid check (public.valid_election_seats(seats));

alter table public.election_predictions_2026 enable row level security;

-- Each person sees and edits only their own forecast, and only until polls close (22:00 Israel time).
drop policy if exists "own forecast read"   on public.election_predictions_2026;
drop policy if exists "own forecast insert" on public.election_predictions_2026;
drop policy if exists "own forecast update" on public.election_predictions_2026;

create policy "own forecast read" on public.election_predictions_2026
  for select to authenticated using (auth.uid() = user_id);

create policy "own forecast insert" on public.election_predictions_2026
  for insert to authenticated
  with check (auth.uid() = user_id and now() < timestamptz '2026-10-27 22:00:00+02');

create policy "own forecast update" on public.election_predictions_2026
  for update to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id and now() < timestamptz '2026-10-27 22:00:00+02');

-- Public summary: participant count + average seats per party. No names or emails leave the table.
create or replace function public.election_summary_2026()
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
  with c as (select count(*)::numeric as n from public.election_predictions_2026)
  select jsonb_build_object(
    'count', (select n from c),
    'avg', coalesce((
      select jsonb_object_agg(k, round(total / nullif((select n from c), 0), 3))
      from (
        select key as k, sum((value #>> '{}')::numeric) as total
        from public.election_predictions_2026, jsonb_each(seats)
        group by key
      ) t
    ), '{}'::jsonb)
  );
$$;

revoke all on function public.election_summary_2026() from public;
grant execute on function public.election_summary_2026() to anon, authenticated;
