-- V22: Dynamic Cosmic Tarot CMS, Super Admin Leadership Radar, and Advisor-only personal growth mirror.
-- All reporting is aggregate/team-scoped or self-scoped. No customer identifiers are introduced or returned.

create table if not exists public.cosmic_tarot_cards (
  id uuid primary key default gen_random_uuid(),
  signal_trigger text not null check (char_length(trim(signal_trigger)) between 3 and 80),
  card_title text not null check (char_length(trim(card_title)) between 3 and 120),
  cryptic_quote text not null check (char_length(trim(cryptic_quote)) between 3 and 600),
  actionable_advice text not null check (char_length(trim(actionable_advice)) between 3 and 800),
  created_at timestamptz not null default now(),
  constraint cosmic_tarot_cards_no_contact_pii check (
    concat_ws(' ', signal_trigger, card_title, cryptic_quote, actionable_advice) !~* '[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}'
    and concat_ws(' ', signal_trigger, card_title, cryptic_quote, actionable_advice) !~ '(\+?84|0)[0-9]{8,10}'
  )
);

create unique index if not exists cosmic_tarot_cards_trigger_title_key
  on public.cosmic_tarot_cards (signal_trigger, card_title);

alter table public.cosmic_tarot_cards enable row level security;
drop policy if exists tarot_read_authenticated on public.cosmic_tarot_cards;
create policy tarot_read_authenticated on public.cosmic_tarot_cards
  for select to authenticated using (true);
drop policy if exists tarot_write_super_admin on public.cosmic_tarot_cards;
create policy tarot_write_super_admin on public.cosmic_tarot_cards
  for all to authenticated
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'super_admin'))
  with check (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'super_admin'));

insert into public.cosmic_tarot_cards (signal_trigger, card_title, cryptic_quote, actionable_advice) values
  ('team_momentum', 'HỎA LONG XUẤT TRẬN', 'Trời quang mây tạnh, sao Chốt Sale rọi thẳng vào đỉnh đầu. Khách hàng tuần này bỗng dưng cởi mở lạ thường...', 'Data cho thấy đà thực chiến đang tốt. Hãy động viên Team chăm sóc các cơ hội ở phễu cuối và ghi nhận nỗ lực nhỏ ngay hôm nay.'),
  ('team_slow', 'RÙA BỌC THÉP', 'Tuần này số mệnh mờ ảo. Khách chốt hay không còn tùy vào độ nhẫn nại và duyên ngầm của Team.', 'Nhịp học có thể đang nhiều hơn thực chiến. Hãy tổ chức một buổi role-play ngắn để hâm nóng kỹ năng và tạo bước đi cụ thể.'),
  ('needs_empathy', 'SAO THỦY NGHỊCH HÀNH', 'Vũ trụ gửi tín hiệu kẹt mạng. Khách dễ seen không rep, anh em dễ chùng bước khi áp lực quá cao.', 'Động lực Team đang cần được nâng đỡ. Ưu tiên một cuộc trò chuyện 1:1 không phán xét và một lời động viên có căn cứ.')
on conflict (signal_trigger, card_title) do nothing;

create or replace function public.get_admin_leadership_radar_v1()
returns jsonb
language plpgsql
stable
security definer
set search_path = pg_catalog, public
as $$
begin
  if not exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'super_admin') then
    raise exception 'Leadership Radar chỉ dành cho Super Admin.' using errcode = '42501';
  end if;

  return (
    with active_teams as (
      select t.id, t.name
      from public.teams t
      where t.status = 'active'
    ), team_leaders as (
      select distinct on (p.primary_team_id) p.primary_team_id as team_id, p.display_name
      from public.profiles p
      where p.role = 'leader' and p.is_active = true
      order by p.primary_team_id, p.created_at asc
    ), advisors as (
      select p.primary_team_id as team_id, count(*)::integer as active_advisors
      from public.profiles p
      where p.role = 'advisor' and p.is_active = true
      group by p.primary_team_id
    ), supported_advisors as (
      select x.team_id, count(distinct x.user_id)::integer as supported_count
      from (
        select i.team_id, i.user_id
        from public.interventions i
        where i.action_status = 'done' and i.created_at >= current_timestamp - interval '30 days'
        union
        select g.team_id, g.recipient_id
        from public.xp_gifts g
        join public.profiles recipient on recipient.id = g.recipient_id
        where recipient.role = 'advisor' and g.created_at >= current_timestamp - interval '30 days'
      ) x
      group by x.team_id
    ), closures as (
      select a.team_id, count(*)::integer as closed_policies
      from public.activity_events a
      where a.event_type = 'policy_closed' and a.event_timestamp >= current_timestamp - interval '30 days'
      group by a.team_id
    )
    select jsonb_build_object(
      'window_days', 30,
      'teams', coalesce(jsonb_agg(jsonb_build_object(
        'team_id', t.id,
        'team_name', t.name,
        'leader_name', coalesce(l.display_name, 'Chưa phân công Leader'),
        'active_advisors', coalesce(a.active_advisors, 0),
        'supported_advisors', coalesce(s.supported_count, 0),
        'closed_policies', coalesce(c.closed_policies, 0),
        'empathy_score', case when coalesce(a.active_advisors, 0) > 0 then round((coalesce(s.supported_count, 0)::numeric / a.active_advisors::numeric) * 100) else 0 end,
        'performance_score', case when coalesce(a.active_advisors, 0) > 0 then least(100, round((coalesce(c.closed_policies, 0)::numeric / a.active_advisors::numeric) * 100)) else 0 end
      ) order by t.name), '[]'::jsonb)
    )
    from active_teams t
    left join team_leaders l on l.team_id = t.id
    left join advisors a on a.team_id = t.id
    left join supported_advisors s on s.team_id = t.id
    left join closures c on c.team_id = t.id
  );
end;
$$;

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

  v_tip := case
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
    'next_tip', v_tip
  );
end;
$$;

revoke all on function public.get_admin_leadership_radar_v1() from public, anon;
grant execute on function public.get_admin_leadership_radar_v1() to authenticated;
revoke all on function public.get_my_agent_mirror_v1() from public, anon;
grant execute on function public.get_my_agent_mirror_v1() to authenticated;
