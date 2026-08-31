-- V28: Director can operate a direct Team without widening the existing Agency matrix scope.

create or replace function public.get_team_recovery_watchlist_v1()
returns jsonb
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  v_actor_id uuid := auth.uid();
  v_role text;
  v_team_id uuid;
  v_payload jsonb;
begin
  if v_actor_id is null then
    raise exception 'Authentication is required';
  end if;

  select lower(p.role::text), p.primary_team_id into v_role, v_team_id
  from public.profiles p where p.id = v_actor_id;

  if v_role not in ('leader', 'director', 'super_admin') then
    raise exception 'Recovery Watchlist is restricted to Leader, Director or Super Admin';
  end if;
  if v_team_id is null and v_role <> 'super_admin' then
    raise exception 'A primary Team is required for direct operational Radar';
  end if;

  with scoped_interventions as (
    select i.* from public.interventions i
    where i.action_status <> 'cancelled'
      and (v_role = 'super_admin' or i.team_id = v_team_id)
  ), latest_outcomes as (
    select distinct on (o.intervention_id) o.intervention_id, o.recovery_status::text as recovery_status, o.measured_at
    from public.intervention_outcomes o join scoped_interventions i on i.id = o.intervention_id
    order by o.intervention_id, o.checkpoint_day desc, o.measured_at desc
  ), watchlist as (
    select i.id, coalesce(nullif(p.display_name, ''), 'TVV trong Team') as member_name,
      coalesce(s.signal_type::text, 'support') as signal_type,
      coalesce(nullif(s.summary, ''), 'Ca hỗ trợ được ghi nhận') as signal_summary,
      i.intervention_type::text as intervention_type, i.action_status::text as action_status,
      i.action_date, lo.recovery_status, lo.measured_at, i.created_at
    from scoped_interventions i join public.profiles p on p.id = i.user_id
    left join public.signals s on s.id = i.signal_id left join latest_outcomes lo on lo.intervention_id = i.id
    order by coalesce(lo.measured_at, i.created_at) desc limit 30
  ), totals as (
    select count(*)::integer as total_interventions,
      count(*) filter (where recovery_status = 'recovered')::integer as recovered_count,
      count(*) filter (where recovery_status is not null and recovery_status <> 'insufficient_data')::integer as measurable_outcomes
    from watchlist
  ) select jsonb_build_object(
    'total_interventions', totals.total_interventions, 'recovered_count', totals.recovered_count,
    'measurable_outcomes', totals.measurable_outcomes,
    'recovery_rate', case when totals.measurable_outcomes > 0 then round((totals.recovered_count::numeric / totals.measurable_outcomes::numeric) * 100) else null end,
    'items', coalesce((select jsonb_agg(jsonb_build_object(
      'id', id, 'member_name', member_name, 'signal_type', signal_type, 'signal_summary', signal_summary,
      'intervention_type', intervention_type, 'action_status', action_status, 'action_date', action_date,
      'recovery_status', coalesce(recovery_status, case when action_status = 'planned' then 'monitoring' else 'pending_measurement' end),
      'measured_at', measured_at
    ) order by coalesce(measured_at, created_at) desc) from watchlist), '[]'::jsonb)
  ) into v_payload from totals;
  return v_payload;
end;
$$;

create or replace function public.draw_smart_tarot_v1(p_team_signal text default null, p_last_card_id uuid default null)
returns jsonb
language plpgsql
volatile
security definer
set search_path = pg_catalog, public
as $$
declare
  v_user_id uuid := auth.uid(); v_role text; v_team_id uuid;
  v_week_start date := date_trunc('week', current_timestamp at time zone 'utc')::date;
  v_signal_type text; v_trigger text; v_previous_card_id uuid; v_current_card_id uuid;
  v_card public.cosmic_tarot_cards%rowtype;
begin
  select p.role::text, p.primary_team_id into v_role, v_team_id from public.profiles p where p.id = v_user_id;
  if v_user_id is null or v_role not in ('leader', 'director') or v_team_id is null then
    raise exception 'Smart Tarot chỉ dành cho Leader hoặc Director của Team.' using errcode = '42501';
  end if;
  select h.card_id into v_current_card_id from public.team_tarot_draw_history h where h.team_id = v_team_id and h.week_start = v_week_start limit 1;
  if v_current_card_id is not null then
    return jsonb_build_object('signal_trigger', c.signal_trigger, 'card', to_jsonb(c), 'reused_this_week', true) from public.cosmic_tarot_cards c where c.id = v_current_card_id;
  end if;
  select h.card_id into v_previous_card_id from public.team_tarot_draw_history h where h.team_id = v_team_id and h.week_start = (v_week_start - 7) limit 1;
  v_previous_card_id := coalesce(v_previous_card_id, p_last_card_id);
  select s.signal_type into v_signal_type from public.signals s where s.team_id = v_team_id and s.status not in ('dismissed', 'acted_on') order by case s.severity when 'critical' then 0 when 'high' then 1 when 'medium' then 2 else 3 end, s.detected_at desc limit 1;
  v_trigger := case when v_signal_type = 'followup_overdue' then 'needs_empathy' when v_signal_type in ('low_activity', 'streak_break', 'conversion_drop', 'high_rejection') then 'team_slow' else 'team_momentum' end;
  if p_team_signal is not null and p_team_signal <> v_trigger then raise exception 'Signal Tarot không khớp tín hiệu Team hiện tại.' using errcode = '42501'; end if;
  select c.* into v_card from public.cosmic_tarot_cards c where c.signal_trigger = v_trigger and (v_previous_card_id is null or c.id <> v_previous_card_id) order by random() limit 1;
  if not found then raise exception 'Kho Tarot cho tín hiệu này cần ít nhất hai lá bài để không lặp lại tuần trước.' using errcode = 'P0002'; end if;
  insert into public.team_tarot_draw_history(team_id, week_start, card_id, drawn_by) values (v_team_id, v_week_start, v_card.id, v_user_id);
  return jsonb_build_object('signal_trigger', v_trigger, 'card', to_jsonb(v_card), 'reused_this_week', false);
end;
$$;

revoke all on function public.get_team_recovery_watchlist_v1() from public, anon;
grant execute on function public.get_team_recovery_watchlist_v1() to authenticated;
revoke all on function public.draw_smart_tarot_v1(text, uuid) from public, anon;
grant execute on function public.draw_smart_tarot_v1(text, uuid) to authenticated;
