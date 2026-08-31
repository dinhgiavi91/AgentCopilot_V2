-- DISC completion earns one idempotent automated reward for the persisted assessment.
-- The function only accepts the caller's own assessment and stores no customer PII.
create or replace function public.award_disc_assessment_xp_v1(p_assessment_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = pg_catalog, public, private
as $$
declare
  v_user_id uuid := auth.uid();
  v_team_id uuid := private.current_team_id();
  v_transaction_id uuid;
  v_total_xp integer;
  v_streak integer;
begin
  if v_user_id is null or v_team_id is null or private.current_profile_role() <> 'advisor'::public.pilot_role then
    raise exception 'Chỉ TVV Pilot đã đăng nhập mới có thể nhận XP DISC.' using errcode = '42501';
  end if;
  if p_assessment_id is null or not exists (
    select 1 from public.disc_assessments where assessment_id = p_assessment_id and user_id = v_user_id
  ) then
    raise exception 'Không tìm thấy kết quả DISC hợp lệ để cấp XP.' using errcode = '42501';
  end if;
  insert into public.users_profile (user_id) values (v_user_id) on conflict (user_id) do nothing;
  insert into public.xp_ledger (user_id, xp_amount, reason, description, auto_source, auto_source_key)
  values (v_user_id, 20, 'manual_adjustment', 'Trạm Đăng Kiểm · Hoàn tất DISC', 'disc_assessment', p_assessment_id::text)
  on conflict (user_id, auto_source, auto_source_key) where auto_source is not null and auto_source_key is not null do nothing
  returning transaction_id into v_transaction_id;
  if v_transaction_id is null then
    select total_xp, current_streak into v_total_xp, v_streak from public.users_profile where user_id = v_user_id;
    return jsonb_build_object('awarded', false, 'xp_amount', 0, 'total_xp', coalesce(v_total_xp, 0), 'current_streak', coalesce(v_streak, 0), 'source', 'disc_assessment');
  end if;
  update public.users_profile set total_xp = total_xp + 20, last_active_at = now()
  where user_id = v_user_id returning total_xp, current_streak into v_total_xp, v_streak;
  return jsonb_build_object('awarded', true, 'xp_amount', 20, 'total_xp', v_total_xp, 'current_streak', v_streak, 'source', 'disc_assessment');
end;
$$;

revoke all on function public.award_disc_assessment_xp_v1(uuid) from public;
revoke execute on function public.award_disc_assessment_xp_v1(uuid) from anon;
grant execute on function public.award_disc_assessment_xp_v1(uuid) to authenticated;
