-- V24: Agent Mirror meeting aggregation and Team-scoped Smart Tarot rotation.
-- No customer identifiers are read, stored, or returned.

create table if not exists public.team_tarot_draw_history (
  id uuid primary key default gen_random_uuid(),
  team_id uuid not null references public.teams(id) on delete cascade,
  week_start date not null,
  card_id uuid not null references public.cosmic_tarot_cards(id) on delete restrict,
  drawn_by uuid not null references public.profiles(id) on delete restrict,
  created_at timestamptz not null default now(),
  unique (team_id, week_start)
);

create index if not exists team_tarot_draw_history_team_week_idx
  on public.team_tarot_draw_history(team_id, week_start desc);

alter table public.team_tarot_draw_history enable row level security;

create or replace function public.get_my_agent_mirror_v1()
returns jsonb
language plpgsql
stable
security definer
set search_path = pg_catalog, public
as $$
declare
  v_user_id uuid := auth.uid();
  v_role text;
  v_week_start timestamptz := date_trunc('week', current_timestamp at time zone 'utc') at time zone 'utc';
  v_xp_earned bigint := 0;
  v_learning_tools bigint := 0;
  v_gifts_received bigint := 0;
  v_recognitions_received bigint := 0;
  v_customer_meetings bigint := 0;
  v_closed_deals bigint := 0;
  v_tip text;
begin
  select p.role::text into v_role from public.profiles p where p.id = v_user_id;
  if v_user_id is null or v_role <> 'advisor' then
    raise exception 'Hành trình cá nhân chỉ dành cho TVV.' using errcode = '42501';
  end if;

  select coalesce(sum(x.xp_amount) filter (where x.xp_amount > 0), 0) into v_xp_earned
  from public.xp_ledger x where x.user_id = v_user_id and x.created_at >= v_week_start;
  select count(*) into v_learning_tools
  from public.activity_events a where a.user_id = v_user_id and a.event_type = 'learning_session' and a.event_timestamp >= v_week_start;
  select count(*) into v_gifts_received
  from public.xp_gifts g where g.recipient_id = v_user_id and g.created_at >= v_week_start;
  select count(*) into v_recognitions_received
  from public.recognitions r where r.receiver_id = v_user_id and r.created_at >= v_week_start;
  select count(*) into v_customer_meetings
  from public.daily_logs d
  where d.user_id = v_user_id
    and d.created_at >= v_week_start
    and lower(coalesce(trim(d.action_result), '')) not in ('dời lịch', 'hủy');
  select count(*) into v_closed_deals
  from public.daily_logs d
  where d.user_id = v_user_id
    and d.created_at >= v_week_start
    and lower(coalesce(trim(d.action_result), '')) = 'ký hợp đồng';

  v_tip := case
    when v_customer_meetings > 5 and v_closed_deals = 0 then 'Bạn đã có nhịp gặp gỡ tốt nhưng chưa ghi nhận hợp đồng trong tuần. Mở Bảo Bối: Xử lý từ chối để rà lại câu hỏi, phản hồi và bước follow-up tiếp theo.'
    when v_learning_tools = 0 then 'Chọn một Bảo Bối hoặc role-play ngắn trong tuần mới để tạo thêm một nhịp học có chủ đích.'
    when v_xp_earned = 0 then 'Bạn đã bắt đầu tích lũy nhịp học. Hãy ghi một hành động thực chiến nhỏ để Copilot nhìn thấy tiến độ.'
    when v_gifts_received + v_recognitions_received > 0 then 'Bạn đang được đội ngũ ghi nhận. Hãy chọn một hành động tiếp nối để biến động lực thành kết quả.'
    else 'Giữ một nhịp học, một nhịp phục vụ và một hành động thực chiến để tuần mới có thêm dữ liệu phát triển.'
  end;

  return jsonb_build_object(
    'week_start', v_week_start,
    'xp_earned', v_xp_earned,
    'learning_tools_used', v_learning_tools,
    'gifts_received', v_gifts_received,
    'recognitions_received', v_recognitions_received,
    'customer_meetings', v_customer_meetings,
    'closed_deals', v_closed_deals,
    'next_tip', v_tip
  );
end;
$$;

create or replace function public.draw_smart_tarot_v1(
  p_team_signal text default null,
  p_last_card_id uuid default null
)
returns jsonb
language plpgsql
volatile
security definer
set search_path = pg_catalog, public
as $$
declare
  v_user_id uuid := auth.uid();
  v_role text;
  v_team_id uuid;
  v_week_start date := date_trunc('week', current_timestamp at time zone 'utc')::date;
  v_signal_type text;
  v_trigger text;
  v_last_card_id uuid;
  v_card public.cosmic_tarot_cards%rowtype;
begin
  select p.role::text, p.primary_team_id into v_role, v_team_id
  from public.profiles p where p.id = v_user_id;
  if v_user_id is null or v_role <> 'leader' or v_team_id is null then
    raise exception 'Smart Tarot chỉ dành cho Leader của Team.' using errcode = '42501';
  end if;

  select h.card_id into v_last_card_id
  from public.team_tarot_draw_history h
  where h.team_id = v_team_id and h.week_start = (v_week_start - 7)
  limit 1;

  select h.card_id into v_last_card_id
  from public.team_tarot_draw_history h
  where h.team_id = v_team_id and h.week_start = v_week_start
  limit 1;
  if v_last_card_id is not null then
    select c.* into v_card from public.cosmic_tarot_cards c where c.id = v_last_card_id;
    return jsonb_build_object('signal_trigger', c.signal_trigger, 'card', to_jsonb(c), 'reused_this_week', true)
    from public.cosmic_tarot_cards c where c.id = v_last_card_id;
  end if;

  select s.signal_type into v_signal_type
  from public.signals s
  where s.team_id = v_team_id and s.status not in ('dismissed', 'acted_on')
  order by case s.severity when 'critical' then 0 when 'high' then 1 when 'medium' then 2 else 3 end, s.detected_at desc
  limit 1;
  v_trigger := case
    when v_signal_type in ('followup_overdue') then 'needs_empathy'
    when v_signal_type in ('low_activity', 'streak_break', 'conversion_drop', 'high_rejection') then 'team_slow'
    else 'team_momentum'
  end;
  if p_team_signal is not null and p_team_signal <> v_trigger then
    raise exception 'Signal Tarot không khớp tín hiệu Team hiện tại.' using errcode = '42501';
  end if;

  select c.* into v_card
  from public.cosmic_tarot_cards c
  where c.signal_trigger = v_trigger and (v_last_card_id is null or c.id <> v_last_card_id)
  order by random()
  limit 1;
  if not found then
    select c.* into v_card
    from public.cosmic_tarot_cards c
    where c.signal_trigger = v_trigger
    order by random()
    limit 1;
  end if;
  if not found then
    raise exception 'Chưa có bài Tarot phù hợp tín hiệu Team.' using errcode = 'P0002';
  end if;

  insert into public.team_tarot_draw_history(team_id, week_start, card_id, drawn_by)
  values (v_team_id, v_week_start, v_card.id, v_user_id);
  return jsonb_build_object('signal_trigger', v_trigger, 'card', to_jsonb(v_card), 'reused_this_week', false);
end;
$$;

revoke all on table public.team_tarot_draw_history from public, anon, authenticated;
revoke all on function public.get_my_agent_mirror_v1() from public, anon;
grant execute on function public.get_my_agent_mirror_v1() to authenticated;
revoke all on function public.draw_smart_tarot_v1(text, uuid) from public, anon;
grant execute on function public.draw_smart_tarot_v1(text, uuid) to authenticated;
