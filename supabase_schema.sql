-- 1. Create invitation_settings table (stores page configs)
create table if not exists invitation_settings (
  id text primary key, -- e.g., 'default', 'sevinch'
  settings jsonb not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Create invitation_responses table (stores RSVP responses)
create table if not exists invitation_responses (
  id uuid default gen_random_uuid() primary key,
  invite_id text not null,
  location text not null,
  date_time text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Row Level Security (RLS) & Policies
-- This enables public selects for config, public inserts for RSVPs, and full admin dashboard access.

alter table invitation_settings enable row level security;
alter table invitation_responses enable row level security;

-- Policies for invitation_settings
create policy "Allow public select on settings" 
  on invitation_settings for select 
  using (true);

create policy "Allow public insert/update on settings" 
  on invitation_settings for all 
  using (true)
  with check (true);

-- Policies for invitation_responses
create policy "Allow public insert on responses" 
  on invitation_responses for insert 
  with check (true);

create policy "Allow public select/delete on responses" 
  on invitation_responses for all 
  using (true)
  with check (true);
