-- V24 strict rule: never repeat a Team's prior-week card for the same signal.

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
  v_previous_card_id uuid;
  v_current_card_id uuid;
  v_card public.cosmic_tarot_cards%rowtype;
begin
  select p.role::text, p.primary_team_id into v_role, v_team_id
  from public.profiles p where p.id = v_user_id;
  if v_user_id is null or v_role <> 'leader' or v_team_id is null then
    raise exception 'Smart Tarot chỉ dành cho Leader của Team.' using errcode = '42501';
  end if;

  select h.card_id into v_current_card_id
  from public.team_tarot_draw_history h
  where h.team_id = v_team_id and h.week_start = v_week_start
  limit 1;
  if v_current_card_id is not null then
    return jsonb_build_object('signal_trigger', c.signal_trigger, 'card', to_jsonb(c), 'reused_this_week', true)
    from public.cosmic_tarot_cards c where c.id = v_current_card_id;
  end if;

  select h.card_id into v_previous_card_id
  from public.team_tarot_draw_history h
  where h.team_id = v_team_id and h.week_start = (v_week_start - 7)
  limit 1;
  v_previous_card_id := coalesce(v_previous_card_id, p_last_card_id);

  select s.signal_type into v_signal_type
  from public.signals s
  where s.team_id = v_team_id and s.status not in ('dismissed', 'acted_on')
  order by case s.severity when 'critical' then 0 when 'high' then 1 when 'medium' then 2 else 3 end, s.detected_at desc
  limit 1;
  v_trigger := case
    when v_signal_type = 'followup_overdue' then 'needs_empathy'
    when v_signal_type in ('low_activity', 'streak_break', 'conversion_drop', 'high_rejection') then 'team_slow'
    else 'team_momentum'
  end;
  if p_team_signal is not null and p_team_signal <> v_trigger then
    raise exception 'Signal Tarot không khớp tín hiệu Team hiện tại.' using errcode = '42501';
  end if;

  select c.* into v_card
  from public.cosmic_tarot_cards c
  where c.signal_trigger = v_trigger and (v_previous_card_id is null or c.id <> v_previous_card_id)
  order by random()
  limit 1;
  if not found then
    raise exception 'Kho Tarot cho tín hiệu này cần ít nhất hai lá bài để không lặp lại tuần trước.' using errcode = 'P0002';
  end if;

  insert into public.team_tarot_draw_history(team_id, week_start, card_id, drawn_by)
  values (v_team_id, v_week_start, v_card.id, v_user_id);
  return jsonb_build_object('signal_trigger', v_trigger, 'card', to_jsonb(v_card), 'reused_this_week', false);
end;
$$;

revoke all on function public.draw_smart_tarot_v1(text, uuid) from public, anon;
grant execute on function public.draw_smart_tarot_v1(text, uuid) to authenticated;
