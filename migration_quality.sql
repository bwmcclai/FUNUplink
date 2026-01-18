-- Migration: Add Quality Support (Space Age)

-- 1. Add quality column to pending_deliveries if it doesn't exist
do $$
begin
  if not exists (select 1 from information_schema.columns where table_name = 'pending_deliveries' and column_name = 'quality') then
    alter table public.pending_deliveries add column quality text default 'normal';
  end if;
end $$;

-- 2. Update process_export to handle quality from JSON payload
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
