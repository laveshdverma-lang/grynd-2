-- ═══════════════════════════════════════════════════════════
-- GRYND DATABASE SCHEMA
-- Run this in: Supabase Dashboard → SQL Editor → New Query
-- ═══════════════════════════════════════════════════════════

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ─── PROFILES ────────────────────────────────────────────────
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  name text,
  age integer,
  weight_kg numeric,
  height_cm numeric,
  training_years integer,
  fitness_level text default 'intermediate',
  goals text[],
  race_type text,
  race_date date,
  race_target text,
  race_name text,
  days_per_week integer default 6,
  session_length integer default 90,
  gym_access text,
  equipment text[],
  schedule text,
  constraints text,
  injuries text,
  dietary_prefs text,
  wearable text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ─── PROGRAMS ─────────────────────────────────────────────────
create table if not exists public.programs (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete cascade not null,
  program_json jsonb not null,
  current_phase integer default 1,
  current_week integer default 1,
  generated_at timestamptz default now(),
  is_active boolean default true
);

-- ─── STAT HISTORY ─────────────────────────────────────────────
create table if not exists public.stat_history (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete cascade not null,
  label text,
  vo2max numeric,
  resting_hr numeric,
  weight_kg numeric,
  bf_pct numeric,
  muscle_kg numeric,
  five_k_time text,
  bench_kg numeric,
  squat_kg numeric,
  logged_at timestamptz default now()
);

-- ─── WORKOUT LOG ──────────────────────────────────────────────
create table if not exists public.workout_logs (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete cascade not null,
  session_type text not null,
  session_date text,
  notes text,
  rpe integer check (rpe >= 1 and rpe <= 10),
  duration text,
  distance text,
  logged_at timestamptz default now()
);

-- ─── EXERCISE TICKS ───────────────────────────────────────────
create table if not exists public.exercise_ticks (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete cascade not null,
  tick_key text not null,
  is_done boolean default true,
  updated_at timestamptz default now(),
  unique(user_id, tick_key)
);

-- ─── PROGRAM EDITS ────────────────────────────────────────────
create table if not exists public.program_edits (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete cascade not null,
  edit_key text not null,
  exercise_name text,
  sets text,
  reps text,
  note text,
  updated_at timestamptz default now(),
  unique(user_id, edit_key)
);

-- ─── RACES ────────────────────────────────────────────────────
create table if not exists public.races (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete cascade not null,
  race_name text not null,
  race_date text,
  target_time text,
  result_time text,
  color text default '#00C896',
  notes text,
  created_at timestamptz default now()
);

-- ═══════════════════════════════════════════════════════════
-- ROW LEVEL SECURITY — Users can only access their own data
-- ═══════════════════════════════════════════════════════════

alter table public.profiles enable row level security;
alter table public.programs enable row level security;
alter table public.stat_history enable row level security;
alter table public.workout_logs enable row level security;
alter table public.exercise_ticks enable row level security;
alter table public.program_edits enable row level security;
alter table public.races enable row level security;

-- Profiles
create policy "Users can view own profile" on public.profiles for select using (auth.uid() = id);
create policy "Users can insert own profile" on public.profiles for insert with check (auth.uid() = id);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);

-- Programs
create policy "Users can manage own programs" on public.programs for all using (auth.uid() = user_id);

-- Stat history
create policy "Users can manage own stats" on public.stat_history for all using (auth.uid() = user_id);

-- Workout logs
create policy "Users can manage own logs" on public.workout_logs for all using (auth.uid() = user_id);

-- Exercise ticks
create policy "Users can manage own ticks" on public.exercise_ticks for all using (auth.uid() = user_id);

-- Program edits
create policy "Users can manage own edits" on public.program_edits for all using (auth.uid() = user_id);

-- Races
create policy "Users can manage own races" on public.races for all using (auth.uid() = user_id);

-- ═══════════════════════════════════════════════════════════
-- AUTO-CREATE PROFILE ON SIGNUP
-- ═══════════════════════════════════════════════════════════

create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, name)
  values (new.id, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
