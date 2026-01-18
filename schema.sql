-- 1. PROFILES (Extends Supabase Auth)
create table public.profiles (
  id uuid references auth.users not null primary key,
  username text unique,
  credits bigint default 0, -- The currency
  created_at timestamptz default now()
);

-- 2. INVENTORY (The "Cloud Storage")
create table public.inventory (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) not null,
  item_name text not null, -- e.g., "advanced-circuit"
  quality text default 'normal', -- e.g., "legendary"
  amount bigint default 0 check (amount >= 0),
  unique(user_id, item_name, quality) -- Prevent duplicate rows
);

-- 3. MARKET_ORDERS (The "Grand Exchange")
create table public.market_orders (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) not null,
  item_name text not null,
  quality text default 'normal',
  order_type text not null check (order_type in ('buy', 'sell')),
  price_per_unit bigint not null check (price_per_unit > 0),
  amount_remaining bigint not null check (amount_remaining > 0),
  active boolean default true,
  created_at timestamptz default now()
);

-- 4. PENDING DELIVERIES (Items bought/imported waiting to be sent to game)
create table public.pending_deliveries (
    id uuid default gen_random_uuid() primary key,
    user_id uuid references public.profiles(id) not null,
    item_name text not null,
    quality text default 'normal',
    amount bigint not null,
    claimed boolean default false,
    created_at timestamptz default now()
);

-- 5. AUDIT LOGS (Anti-Cheat & History)
create table public.audit_logs (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id),
  action_type text, -- 'export', 'import', 'trade'
  details jsonb, -- { "item": "iron-plate", "delta": 500 }
  created_at timestamptz default now()
);

-- RLS POLICIES
alter table public.profiles enable row level security;
alter table public.inventory enable row level security;
alter table public.market_orders enable row level security;
alter table public.pending_deliveries enable row level security;
alter table public.audit_logs enable row level security;

-- Profiles: Users can read all profiles, but only update their own
create policy "Public profiles are viewable by everyone." on public.profiles for select using (true);
create policy "Users can update own profile." on public.profiles for update using (auth.uid() = id);

-- Inventory: Users can view their own inventory
create policy "Users can view own inventory." on public.inventory for select using (auth.uid() = user_id);

-- Pending Deliveries: Users can view their own
create policy "Users can view own deliveries." on public.pending_deliveries for select using (auth.uid() = user_id);
create policy "Users can update own deliveries (mark claimed)." on public.pending_deliveries for update using (auth.uid() = user_id);

-- TRIGGER: Auto-create profile on signup
create function public.handle_new_user() 
returns trigger as $$
begin
  insert into public.profiles (id, username)
  values (new.id, new.raw_user_meta_data->>'username');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- RPC: Process Export (Securely add items to inventory)
create or replace function process_export(payload jsonb)
returns void
language plpgsql
security definer
as $$
declare
  item record;
  _user_id uuid;
begin
  _user_id := auth.uid();
  
  if _user_id is null then
    raise exception 'Not authenticated';
  end if;

  for item in select * from jsonb_to_recordset(payload) as x(name text, count int, quality text)
  loop
    -- Upsert inventory
    insert into public.inventory (user_id, item_name, amount, quality)
    values (_user_id, item.name, item.count, coalesce(item.quality, 'normal'))
    on conflict (user_id, item_name, quality)
    do update set amount = inventory.amount + item.count;
    
    -- Log it
    insert into public.audit_logs (user_id, action_type, details)
    values (_user_id, 'export', jsonb_build_object('item', item.name, 'delta', item.count, 'quality', coalesce(item.quality, 'normal')));
  end loop;
end;
$$;
