-- Notion write idempotency + job queue (DB-backed)

create table if not exists public.notion_idempotency (
  idempotency_key text primary key,
  user_id uuid not null references public.user_profiles(id) on delete cascade,
  workspace_id text not null,
  target_id text not null,
  insertion_mode text,
  request_hash text not null,
  job_id uuid,
  status text not null check (status in ('queued', 'running', 'succeeded', 'failed')),
  error_code text,
  result_metadata jsonb,
  retry_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.notion_write_jobs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.user_profiles(id) on delete cascade,
  workspace_id text not null,
  idempotency_key text not null references public.notion_idempotency(idempotency_key) on delete cascade,
  operation text not null,
  target_id text not null,
  insertion_mode text,
  payload jsonb not null,
  status text not null check (status in ('queued', 'running', 'succeeded', 'failed')),
  attempt_count integer not null default 0,
  max_attempts integer not null default 8,
  retry_at timestamptz,
  error_code text,
  result_metadata jsonb,
  started_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists notion_write_jobs_status_retry_idx on public.notion_write_jobs(status, retry_at);
create unique index if not exists notion_write_jobs_idem_unique on public.notion_write_jobs(idempotency_key);

create or replace function public.set_notion_write_jobs_timestamp()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists notion_write_jobs_set_timestamp on public.notion_write_jobs;
create trigger notion_write_jobs_set_timestamp
before update on public.notion_write_jobs
for each row
execute function public.set_notion_write_jobs_timestamp();

create or replace function public.claim_notion_write_jobs(p_limit integer default 10)
returns setof public.notion_write_jobs
language plpgsql
as $$
declare
  v_limit integer := greatest(1, least(coalesce(p_limit,10), 100));
begin
  return query
  with cte as (
    select id
    from public.notion_write_jobs
    where status = 'queued'
      and (retry_at is null or retry_at <= now())
    order by created_at
    for update skip locked
    limit v_limit
  )
  update public.notion_write_jobs j
  set status = 'running',
      started_at = coalesce(j.started_at, now()),
      updated_at = now(),
      attempt_count = j.attempt_count + 1
  from cte
  where j.id = cte.id
  returning j.*;
end;
$$;
