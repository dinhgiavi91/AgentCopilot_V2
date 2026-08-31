-- V12: team-scoped rewards and Super Admin Central Bank.
-- Reuses public.xp_ledger and public.profiles; no XP table is created.

ALTER TABLE public.xp_rewards
  ADD COLUMN IF NOT EXISTS team_id uuid REFERENCES public.teams(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS xp_rewards_team_status_sort_idx
  ON public.xp_rewards (team_id, status, sort_order);

DROP POLICY IF EXISTS sprint6_read_xp_rewards ON public.xp_rewards;
CREATE POLICY xp_rewards_global_read
  ON public.xp_rewards
  FOR SELECT
  TO anon
  USING (team_id IS NULL);

CREATE POLICY xp_rewards_authenticated_global_or_team_read
  ON public.xp_rewards
  FOR SELECT
  TO authenticated
  USING (team_id IS NULL OR private.is_super_admin() OR private.is_active_team_member(team_id));

CREATE POLICY xp_rewards_super_admin_write
  ON public.xp_rewards
  FOR ALL
  TO authenticated
  USING (private.is_super_admin())
  WITH CHECK (private.is_super_admin());

CREATE OR REPLACE FUNCTION public.admin_fund_leader_v1(
  p_leader_id uuid,
  p_amount integer,
  p_reason text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public, private
AS $$
DECLARE
  v_new_balance integer;
  v_leader_team_id uuid;
  v_reason text := trim(coalesce(p_reason, ''));
BEGIN
  IF NOT private.is_super_admin() THEN
    RAISE EXCEPTION 'Chỉ Super Admin được cấp ngân sách.' USING ERRCODE = '42501';
  END IF;

  IF p_amount IS NULL OR p_amount < 1 OR p_amount > 50000 THEN
    RAISE EXCEPTION 'Ngân sách phải nằm trong khoảng 1 đến 50.000 XP.' USING ERRCODE = '22023';
  END IF;

  IF char_length(v_reason) < 3 OR char_length(v_reason) > 240
    OR v_reason ~* '([a-z0-9._%+\-]+@[a-z0-9.\-]+\.[a-z]{2,}|(\+?84|0)[0-9 .\-]{8,})' THEN
    RAISE EXCEPTION 'Lý do cần 3–240 ký tự và không chứa email hoặc số điện thoại.' USING ERRCODE = '22023';
  END IF;

  SELECT primary_team_id
  INTO v_leader_team_id
  FROM public.profiles
  WHERE id = p_leader_id
    AND role = 'leader'::public.pilot_role
    AND is_active = true
  FOR UPDATE;

  IF v_leader_team_id IS NULL THEN
    RAISE EXCEPTION 'Leader hoạt động không tồn tại.' USING ERRCODE = 'P0002';
  END IF;

  UPDATE public.profiles
  SET xp_balance = coalesce(xp_balance, 0) + p_amount
  WHERE id = p_leader_id
  RETURNING xp_balance INTO v_new_balance;

  INSERT INTO public.xp_ledger (user_id, xp_amount, reason, description)
  VALUES (
    p_leader_id,
    p_amount,
    'admin_funding',
    concat('Cấp ngân sách Super Admin: ', v_reason)
  );

  RETURN jsonb_build_object(
    'success', true,
    'leader_id', p_leader_id,
    'team_id', v_leader_team_id,
    'new_balance', v_new_balance
  );
END;
$$;

REVOKE ALL ON FUNCTION public.admin_fund_leader_v1(uuid, integer, text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.admin_fund_leader_v1(uuid, integer, text) FROM anon;
GRANT EXECUTE ON FUNCTION public.admin_fund_leader_v1(uuid, integer, text) TO authenticated;
