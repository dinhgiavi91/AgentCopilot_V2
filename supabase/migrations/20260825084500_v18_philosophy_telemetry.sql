-- V18: Hệ Điều Hành Chống Rụng Số.
-- Chỉ tổng hợp dữ liệu không định danh; không trả về tên, ID hoặc nội dung ghi chú cá nhân.

CREATE OR REPLACE FUNCTION public.get_app_philosophy_metrics_v1()
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
DECLARE
  v_recovery_rate numeric := 0;
  v_tti_hours numeric := 0;
  v_peer_gifts bigint := 0;
  v_closed_policies bigint := 0;
  v_learning_touches bigint := 0;
  v_total_d7 bigint := 0;
  v_recovered_d7 bigint := 0;
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = auth.uid()
      AND role = 'super_admin'
  ) THEN
    RAISE EXCEPTION 'Telemetry chỉ dành cho Super Admin.' USING ERRCODE = '42501';
  END IF;

  SELECT
    count(*),
    count(*) FILTER (WHERE recovery_status = 'recovered')
  INTO v_total_d7, v_recovered_d7
  FROM public.intervention_outcomes
  WHERE checkpoint_day = 'd7';

  IF v_total_d7 > 0 THEN
    v_recovery_rate := round((v_recovered_d7::numeric / v_total_d7::numeric) * 100, 1);
  END IF;

  SELECT COALESCE(
    round(avg(extract(epoch FROM (i.created_at - s.detected_at)) / 3600)::numeric, 1),
    0
  )
  INTO v_tti_hours
  FROM public.interventions AS i
  INNER JOIN public.signals AS s ON s.id = i.signal_id
  WHERE i.action_status = 'done'
    AND i.created_at >= s.detected_at;

  SELECT count(*)
  INTO v_peer_gifts
  FROM public.xp_gifts AS g
  INNER JOIN public.profiles AS giver ON giver.id = g.giver_id
  INNER JOIN public.profiles AS recipient ON recipient.id = g.recipient_id
  WHERE giver.role = 'advisor'
    AND recipient.role = 'advisor'
    AND g.created_at >= current_timestamp - interval '30 days';

  SELECT count(*)
  INTO v_closed_policies
  FROM public.daily_logs
  WHERE action_result IN ('Ký Hợp Đồng', 'Chốt HĐ')
    AND created_at >= current_timestamp - interval '30 days';

  SELECT count(*)
  INTO v_learning_touches
  FROM public.activity_events
  WHERE event_type = 'learning_session'
    AND event_timestamp >= current_timestamp - interval '30 days';

  RETURN jsonb_build_object(
    'recovery_rate', v_recovery_rate,
    'tti_hours', v_tti_hours,
    'peer_gifts_30d', v_peer_gifts,
    'closed_policies_30d', v_closed_policies,
    'learning_touches_30d', v_learning_touches
  );
END;
$$;

REVOKE ALL ON FUNCTION public.get_app_philosophy_metrics_v1() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.get_app_philosophy_metrics_v1() FROM anon;
GRANT EXECUTE ON FUNCTION public.get_app_philosophy_metrics_v1() TO authenticated;
