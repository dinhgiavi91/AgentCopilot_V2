-- V70: Bind Player-Coach monthly goals to the Leader Radar without storing customer PII.
-- Goal signals remain first-class rows in public.signals. They use the existing `other`
-- enum value and are identified by metadata.rule_key so no enum migration is required.

create or replace function public.evaluate_my_leader_goal_radar_v1()
returns jsonb
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  v_actor_id uuid := auth.uid();
  v_role text;
  v_team_id uuid;
  v_now timestamptz := current_timestamp;
  v_month_start date := date_trunc('month', current_timestamp)::date;
  v_next_month_start date := (date_trunc('month', current_timestamp) + interval '1 month')::date;
  v_month_days numeric := extract(day from (date_trunc('month', current_timestamp) + interval '1 month - 1 day'));
  v_elapsed_ratio numeric;
  v_goal public.player_coach_goals%rowtype;
  v_personal_income_actual numeric := 0;
  v_recruitment_actual integer := 0;
  v_active_advisors integer := 0;
  v_active_advisors_actual integer := 0;
  v_active_rate_actual numeric := 0;
  v_coaching_actual integer := 0;
  v_metric_key text;
  v_target numeric;
  v_actual numeric;
  v_expected_minimum numeric;
  v_is_behind boolean;
  v_severity public.pilot_signal_severity;
  v_summary text;
  v_metadata jsonb;
  v_updated integer := 0;
  v_open_goal_signals jsonb := '[]'::jsonb;
begin
  select p.role::text, p.primary_team_id
    into v_role, v_team_id
  from public.profiles p
  where p.id = v_actor_id;

  if v_actor_id is null or v_role not in ('leader', 'director') or v_team_id is null then
    raise exception 'Leader or Director access is required for goal Radar evaluation.' using errcode = '42501';
  end if;

  select *
    into v_goal
  from public.player_coach_goals
  where user_id = v_actor_id;

  -- Personal-income telemetry is deliberately limited to the Leader's own outcome logs.
  select coalesce(sum(dl.revenue_amount), 0)
    into v_personal_income_actual
  from public.daily_logs dl
  where dl.user_id = v_actor_id
    and dl.created_at >= v_month_start
    and dl.created_at < v_next_month_start
    and dl.action_result in ('Ký Hợp Đồng', 'Chốt HĐ');

  -- Recruitment events use only explicit, non-PII operational metadata when the
  -- recruitment workflow records them. Other activity events cannot inflate this metric.
  select count(*)::integer
    into v_recruitment_actual
  from public.activity_events ae
  where ae.user_id = v_actor_id
    and ae.team_id = v_team_id
    and ae.event_timestamp >= v_month_start
    and ae.event_timestamp < v_next_month_start
    and (
      ae.metadata ->> 'goal_metric' = 'recruitment_outreach'
      or ae.metadata ->> 'source' in ('recruitment_outreach', 'recruitment_interview')
    );

  select count(*)::integer
    into v_active_advisors
  from public.profiles p
  where p.primary_team_id = v_team_id
    and p.role = 'advisor'
    and p.is_active;

  -- A TVV is Active when at least one real operational touch was logged this month.
  select count(*)::integer
    into v_active_advisors_actual
  from public.profiles p
  where p.primary_team_id = v_team_id
    and p.role = 'advisor'
    and p.is_active
    and (
      exists (
        select 1
        from public.activity_events ae
        where ae.user_id = p.id
          and ae.team_id = v_team_id
          and ae.event_timestamp >= v_month_start
          and ae.event_timestamp < v_next_month_start
      )
      or exists (
        select 1
        from public.daily_logs dl
        where dl.user_id = p.id
          and dl.created_at >= v_month_start
          and dl.created_at < v_next_month_start
      )
    );

  v_active_rate_actual := case
    when v_active_advisors > 0 then round((v_active_advisors_actual::numeric * 100) / v_active_advisors, 1)
    else 0
  end;

  -- A completed coaching session is a completed 1:1 intervention recorded by this Leader.
  select count(*)::integer
    into v_coaching_actual
  from public.interventions i
  where i.team_id = v_team_id
    and i.leader_id = v_actor_id
    and i.intervention_type = 'coaching_1on1'::public.pilot_intervention_type
    and i.action_status = 'done'::public.pilot_intervention_status
    and i.action_date >= v_month_start
    and i.action_date < v_next_month_start;

  v_elapsed_ratio := least(1::numeric, greatest(0.05::numeric, extract(day from v_now)::numeric / nullif(v_month_days, 0)));

  foreach v_metric_key in array array['personal_income', 'recruitment_outreach', 'active_rate', 'coaching_sessions'] loop
    if v_metric_key = 'personal_income' then
      v_target := coalesce(v_goal.personal_income, 0);
      v_actual := v_personal_income_actual;
      v_expected_minimum := ceil(v_target * v_elapsed_ratio * 0.80);
      v_summary := format(
        'Tiến độ thu nhập cá nhân đang chậm: %s/%s VND trong tháng, thấp hơn mốc nhịp %s VND.',
        round(v_actual)::bigint,
        round(v_target)::bigint,
        round(v_expected_minimum)::bigint
      );
    elsif v_metric_key = 'recruitment_outreach' then
      v_target := coalesce(v_goal.recruitment_outreach_target, 0);
      v_actual := v_recruitment_actual;
      v_expected_minimum := ceil(v_target * v_elapsed_ratio * 0.80);
      v_summary := format(
        'Tuyển dụng đang chậm nhịp: %s/%s lượt tiếp cận hoặc phỏng vấn trong tháng; mốc nhịp hiện tại là %s.',
        round(v_actual)::integer,
        round(v_target)::integer,
        round(v_expected_minimum)::integer
      );
    elsif v_metric_key = 'active_rate' then
      v_target := coalesce(v_goal.active_rate_target_percent, 0);
      v_actual := v_active_rate_actual;
      -- Active Rate is a current health measure, so allow a five-point operating tolerance.
      v_expected_minimum := greatest(0, v_target - 5);
      v_summary := format(
        'Active Rate đang thấp: %s%% (%s/%s TVV active), dưới ngưỡng theo mục tiêu %s%%.',
        trim(to_char(v_actual, 'FM999999990.0')),
        v_active_advisors_actual,
        v_active_advisors,
        trim(to_char(v_expected_minimum, 'FM999999990.0'))
      );
    else
      v_target := coalesce(v_goal.coaching_1on1_target, 0);
      v_actual := v_coaching_actual;
      v_expected_minimum := ceil(v_target * v_elapsed_ratio * 0.80);
      v_summary := format(
        'Low Coaching: đã hoàn tất %s/%s ca Coaching 1:1 trong tháng; mốc nhịp hiện tại là %s ca.',
        round(v_actual)::integer,
        round(v_target)::integer,
        round(v_expected_minimum)::integer
      );
    end if;

    v_is_behind := v_target > 0 and v_actual < v_expected_minimum;
    if v_is_behind then
      v_severity := case
        when v_actual = 0 and v_expected_minimum > 0 then 'high'::public.pilot_signal_severity
        when v_actual / greatest(v_expected_minimum, 1) < 0.55 then 'high'::public.pilot_signal_severity
        else 'medium'::public.pilot_signal_severity
      end;
      v_metadata := jsonb_build_object(
        'rule_key', 'leader_goal_pace_v70',
        'scope', 'team_goal',
        'metric_key', v_metric_key,
        'month_start', v_month_start,
        'goal', v_target,
        'actual', v_actual,
        'expected_minimum', v_expected_minimum,
        'active_advisors', v_active_advisors,
        'active_advisors_actual', v_active_advisors_actual,
        'evaluated_at', v_now
      );

      update public.signals s
      set severity = v_severity,
          summary = v_summary,
          detected_at = v_now,
          metadata = v_metadata
      where s.user_id = v_actor_id
        and s.team_id = v_team_id
        and s.signal_type = 'other'::public.pilot_signal_type
        and s.metadata ->> 'rule_key' = 'leader_goal_pace_v70'
        and s.metadata ->> 'metric_key' = v_metric_key
        and s.metadata ->> 'month_start' = v_month_start::text
        and s.status in ('new'::public.pilot_signal_status, 'reviewed'::public.pilot_signal_status);
      get diagnostics v_updated = row_count;

      if v_updated = 0 then
        insert into public.signals (
          user_id, team_id, signal_type, window_days, threshold_version, severity, summary, metadata
        ) values (
          v_actor_id,
          v_team_id,
          'other'::public.pilot_signal_type,
          (v_next_month_start - v_month_start)::integer,
          'v70-leader-goal-pace',
          v_severity,
          v_summary,
          v_metadata
        );
      end if;
    else
      -- Resolved goal signals stay auditable but do not remain active on the Radar.
      update public.signals s
      set status = 'dismissed'::public.pilot_signal_status,
          metadata = s.metadata || jsonb_build_object('resolved_at', v_now, 'resolution', 'goal pace recovered')
      where s.user_id = v_actor_id
        and s.team_id = v_team_id
        and s.signal_type = 'other'::public.pilot_signal_type
        and s.metadata ->> 'rule_key' = 'leader_goal_pace_v70'
        and s.metadata ->> 'metric_key' = v_metric_key
        and s.metadata ->> 'month_start' = v_month_start::text
        and s.status in ('new'::public.pilot_signal_status, 'reviewed'::public.pilot_signal_status);
    end if;
  end loop;

  select coalesce(jsonb_agg(jsonb_build_object(
    'metric_key', s.metadata ->> 'metric_key',
    'severity', s.severity,
    'summary', s.summary,
    'actual', s.metadata -> 'actual',
    'goal', s.metadata -> 'goal'
  ) order by case s.severity when 'high' then 0 when 'medium' then 1 else 2 end), '[]'::jsonb)
    into v_open_goal_signals
  from public.signals s
  where s.user_id = v_actor_id
    and s.team_id = v_team_id
    and s.metadata ->> 'rule_key' = 'leader_goal_pace_v70'
    and s.metadata ->> 'month_start' = v_month_start::text
    and s.status in ('new'::public.pilot_signal_status, 'reviewed'::public.pilot_signal_status);

  return jsonb_build_object(
    'month_start', v_month_start,
    'month_end', v_next_month_start - 1,
    'goals', jsonb_build_object(
      'personal_income', coalesce(v_goal.personal_income, 0),
      'recruitment_outreach', coalesce(v_goal.recruitment_outreach_target, 0),
      'active_rate_percent', coalesce(v_goal.active_rate_target_percent, 0),
      'coaching_sessions', coalesce(v_goal.coaching_1on1_target, 0)
    ),
    'actuals', jsonb_build_object(
      'personal_income', v_personal_income_actual,
      'recruitment_outreach', v_recruitment_actual,
      'active_rate_percent', v_active_rate_actual,
      'active_advisors', v_active_advisors,
      'active_advisors_actual', v_active_advisors_actual,
      'coaching_sessions', v_coaching_actual
    ),
    'open_signals', v_open_goal_signals
  );
end;
$$;

revoke all on function public.evaluate_my_leader_goal_radar_v1() from public, anon;
grant execute on function public.evaluate_my_leader_goal_radar_v1() to authenticated;
