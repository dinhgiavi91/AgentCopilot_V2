-- Recognition cards are internal Team acknowledgements. They carry no customer PII.
create table public.recognitions (
  id uuid primary key default gen_random_uuid(),
  sender_id uuid not null references public.profiles(id) on delete restrict,
  receiver_id uuid not null references public.profiles(id) on delete restrict,
  team_id uuid not null references public.teams(id) on delete restrict,
  card_type text not null default 'recognition' check (card_type = 'recognition'),
  reward_name text,
  leader_message text,
  created_at timestamptz not null default now(),
  is_claimed boolean not null default false,
  claimed_at timestamptz,
  constraint recognitions_distinct_sender_receiver check (sender_id <> receiver_id),
  constraint recognitions_reward_name_length check (reward_name is null or char_length(trim(reward_name)) between 1 and 120),
  constraint recognitions_leader_message_length check (leader_message is null or char_length(trim(leader_message)) between 1 and 1000)
);

comment on table public.recognitions is 'Team-scoped Leader recognition cards. Customer names, phone numbers and emails are prohibited.';

create index recognitions_receiver_created_idx on public.recognitions (receiver_id, created_at desc);
create index recognitions_sender_created_idx on public.recognitions (sender_id, created_at desc);

alter table public.recognitions enable row level security;

revoke all on public.recognitions from public, anon;
grant select, insert on public.recognitions to authenticated;
grant update (is_claimed, claimed_at) on public.recognitions to authenticated;

create policy recognitions_sender_receiver_select
on public.recognitions
for select
to authenticated
using (
  sender_id = (select auth.uid())
  or receiver_id = (select auth.uid())
  or (select private.is_super_admin())
);

create policy recognitions_leader_team_insert
on public.recognitions
for insert
to authenticated
with check (
  sender_id = (select auth.uid())
  and (select private.can_manage_team(team_id))
  and exists (
    select 1
    from public.profiles as receiver
    where receiver.id = recognitions.receiver_id
      and receiver.primary_team_id = recognitions.team_id
      and receiver.role = 'advisor'
      and receiver.is_active = true
  )
);

create policy recognitions_receiver_claim
on public.recognitions
for update
to authenticated
using (
  receiver_id = (select auth.uid())
  and is_claimed = false
)
with check (
  receiver_id = (select auth.uid())
  and is_claimed = true
);

do $$
begin
  alter publication supabase_realtime add table public.recognitions;
exception
  when duplicate_object then null;
end;
$$;
