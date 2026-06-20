-- ABD Post Pilot — Supabase Postgres schema
-- Run via Supabase SQL editor or `supabase db push`.
-- All tables use RLS so each user only ever sees their own rows.

create extension if not exists "uuid-ossp";

-- ---------- Profiles (1:1 with auth.users) ----------
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  created_at timestamptz default now()
);

-- ---------- Instagram Accounts ----------
create table if not exists instagram_accounts (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null,
  ig_user_id text not null,
  username text not null,
  access_token text not null, -- encrypt at rest via Supabase Vault in production
  token_expires_at timestamptz not null,
  is_active boolean default true,
  created_at timestamptz default now()
);

-- ---------- Post Batches ----------
create table if not exists post_batches (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null,
  instagram_account_id uuid references instagram_accounts(id) on delete cascade not null,
  caption text not null,
  hashtags text[] default '{}',
  location text default 'Lahore, Punjab, Pakistan',
  status text not null default 'pending'
    check (status in ('pending','scheduled','publishing','published','failed')),
  scheduled_at timestamptz,
  interval_minutes int,
  created_at timestamptz default now()
);

-- ---------- Batch Images ----------
create table if not exists batch_images (
  id uuid primary key default uuid_generate_v4(),
  batch_id uuid references post_batches(id) on delete cascade not null,
  storage_path text not null,
  order_index int not null default 0
);

-- ---------- Scheduled Posts (the queue) ----------
create table if not exists scheduled_posts (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null,
  batch_id uuid references post_batches(id) on delete cascade not null,
  instagram_account_id uuid references instagram_accounts(id) on delete cascade not null,
  status text not null default 'scheduled'
    check (status in ('pending','scheduled','publishing','published','failed')),
  scheduled_at timestamptz not null,
  interval_minutes int,
  attempts int default 0,
  last_error text,
  created_at timestamptz default now()
);
create index if not exists idx_scheduled_posts_due on scheduled_posts (status, scheduled_at);

-- ---------- Published Posts ----------
create table if not exists published_posts (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null,
  batch_id uuid references post_batches(id) on delete cascade not null,
  ig_media_id text,
  status text not null default 'published',
  created_at timestamptz default now()
);

-- ---------- Logs ----------
create table if not exists logs (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade,
  level text not null,
  message text not null,
  context jsonb,
  created_at timestamptz default now()
);

-- ---------- Settings ----------
create table if not exists settings (
  user_id uuid primary key references auth.users(id) on delete cascade,
  default_location text default 'Lahore, Punjab, Pakistan',
  timezone text default 'Asia/Karachi',
  notify_on_failure boolean default true,
  updated_at timestamptz default now()
);

-- ============== Row Level Security ==============
alter table profiles enable row level security;
alter table instagram_accounts enable row level security;
alter table post_batches enable row level security;
alter table batch_images enable row level security;
alter table scheduled_posts enable row level security;
alter table published_posts enable row level security;
alter table logs enable row level security;
alter table settings enable row level security;

create policy "own profile" on profiles for all using (auth.uid() = id);
create policy "own accounts" on instagram_accounts for all using (auth.uid() = user_id);
create policy "own batches" on post_batches for all using (auth.uid() = user_id);
create policy "own batch images" on batch_images for all using (
  auth.uid() = (select user_id from post_batches where post_batches.id = batch_images.batch_id)
);
create policy "own queue" on scheduled_posts for all using (auth.uid() = user_id);
create policy "own history" on published_posts for all using (auth.uid() = user_id);
create policy "own logs" on logs for all using (auth.uid() = user_id);
create policy "own settings" on settings for all using (auth.uid() = user_id);

-- ---------- Storage bucket for batch images ----------
insert into storage.buckets (id, name, public) values ('batch-images', 'batch-images', true)
on conflict (id) do nothing;
