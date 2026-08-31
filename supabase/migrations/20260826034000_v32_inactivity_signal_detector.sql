-- V32: persist a Zero-PII Ghosting signal at Radar read time so the intervention flow has a real signal_id.

create or replace function public.get_leader_radar_signals_v2()
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
begin
  select p.role::text, p.primary_team_id into v_role, v_team_id
  from public.profiles p
  where p.id = v_actor_id;

  if v_actor_id is null or v_role not in ('leader', 'director', 'super_admin') or v_team_id is null then
    raise exception 'Leader, Director or Super Admin access is required for Radar.' using errcode = '42501';
  end if;

  with advisor_activity as (
    select
      p.id as user_id,
      p.primary_team_id as team_id,
      coalesce(up.current_streak, 0)::integer as current_streak,
      (select count(*)::integer from public.activity_events ae where ae.user_id = p.id and ae.team_id = p.primary_team_id and ae.event_timestamp >= v_now - interval '24 hours' and ae.event_type <> 'other'::public.pilot_activity_event_type) as activity_events_24h,
      (select count(*)::integer from public.daily_logs dl where dl.user_id = p.id and dl.created_at >= v_now - interval '24 hours') as daily_logs_24h
    from public.profiles p
    left join public.users_profile up on up.user_id = p.id
    where p.primary_team_id = v_team_id and p.role = 'advisor' and p.is_active
  )
  insert into public.signals (user_id, team_id, signal_type, window_days, threshold_version, severity, summary, metadata)
  select
    candidate.user_id,
    candidate.team_id,
    'low_activity'::public.pilot_signal_type,
    1,
    'v32-inactivity-24h',
    'high'::public.pilot_signal_severity,
    'Mất nhịp hoạt động: Chuỗi bền bỉ về 0 hoặc chưa có tương tác học tập/khách hàng mới trong 24 giờ.',
    jsonb_build_object(
      'rule_key', 'inactivity_24h_v32',
      'evaluation_window_hours', 24,
      'current_streak', candidate.current_streak,
      'activity_events_24h', candidate.activity_events_24h,
      'daily_logs_24h', candidate.daily_logs_24h,
      'activity_count', candidate.activity_events_24h + candidate.daily_logs_24h,
      'evaluated_at', v_now
    )
  from advisor_activity candidate
  where (candidate.current_streak = 0 or (candidate.activity_events_24h = 0 and candidate.daily_logs_24h = 0))
    and not exists (
      select 1
      from public.signals existing
      where existing.user_id = candidate.user_id
        and existing.signal_type in ('low_activity'::public.pilot_signal_type, 'streak_break'::public.pilot_signal_type)
        and existing.status in ('new'::public.pilot_signal_status, 'reviewed'::public.pilot_signal_status)
    );

  return coalesce((
    select jsonb_agg(jsonb_build_object(
      'id', signal.id,
      'user_id', signal.user_id,
      'team_id', signal.team_id,
      'signal_type', signal.signal_type,
      'window_days', signal.window_days,
      'threshold_version', signal.threshold_version,
      'severity', signal.severity,
      'summary', signal.summary,
      'detected_at', signal.detected_at,
      'status', signal.status,
      'metadata', signal.metadata,
      'created_at', signal.created_at,
      'advisor_display_name', coalesce(nullif(profile.display_name, ''), 'TVV trong Team')
    ) order by
      case signal.severity when 'critical' then 0 when 'high' then 1 when 'medium' then 2 else 3 end,
      signal.detected_at desc)
    from public.signals signal
    left join public.profiles profile on profile.id = signal.user_id
    where signal.team_id = v_team_id
  ), '[]'::jsonb);
end;
$$;

revoke all on function public.get_leader_radar_signals_v2() from public, anon;
grant execute on function public.get_leader_radar_signals_v2() to authenticated;
