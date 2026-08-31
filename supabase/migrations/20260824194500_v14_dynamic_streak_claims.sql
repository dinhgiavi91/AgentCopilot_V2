ALTER TABLE public.streak_milestones
  ADD COLUMN IF NOT EXISTS xp_reward integer NOT NULL DEFAULT 0 CHECK (xp_reward >= 0 AND xp_reward <= 1000000);

UPDATE public.streak_milestones
SET xp_reward = CASE milestone_day
  WHEN 7 THEN 50
  WHEN 14 THEN 150
  WHEN 21 THEN 300
  WHEN 30 THEN 500
  ELSE xp_reward
END
WHERE xp_reward = 0;

CREATE TABLE IF NOT EXISTS public.streak_milestone_claims (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  milestone_id uuid NOT NULL REFERENCES public.streak_milestones(id) ON DELETE RESTRICT,
  xp_awarded integer NOT NULL CHECK (xp_awarded >= 0),
  claimed_at timestamptz NOT NULL DEFAULT timezone('utc'::text, now()),
  UNIQUE (user_id, milestone_id)
);

CREATE INDEX IF NOT EXISTS streak_milestone_claims_user_claimed_idx
  ON public.streak_milestone_claims (user_id, claimed_at DESC);

ALTER TABLE public.streak_milestone_claims ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS streak_milestone_claims_owner_read ON public.streak_milestone_claims;
CREATE POLICY streak_milestone_claims_owner_read
  ON public.streak_milestone_claims FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE OR REPLACE FUNCTION public.create_streak_milestone_v1(
  p_milestone_day integer,
  p_title text,
  p_xp_reward integer
)
RETURNS public.streak_milestones
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public, private
AS $$
DECLARE
  result public.streak_milestones;
BEGIN
  IF auth.uid() IS NULL OR NOT private.is_super_admin() THEN
    RAISE EXCEPTION 'Only Super Admin may create streak milestones' USING ERRCODE = '42501';
  END IF;
  IF p_milestone_day IS NULL OR p_milestone_day < 1 OR p_milestone_day > 1000000
    OR char_length(trim(p_title)) NOT BETWEEN 3 AND 100
    OR p_xp_reward IS NULL OR p_xp_reward < 0 OR p_xp_reward > 1000000 THEN
    RAISE EXCEPTION 'Invalid streak milestone input' USING ERRCODE = '22023';
  END IF;
  INSERT INTO public.streak_milestones (milestone_day, title, reward_label, xp_reward, sort_order, is_active, updated_at)
  VALUES (p_milestone_day, trim(p_title), format('+%s XP', p_xp_reward), p_xp_reward, p_milestone_day, true, timezone('utc'::text, now()))
  ON CONFLICT (milestone_day) DO UPDATE
  SET title = EXCLUDED.title,
      reward_label = EXCLUDED.reward_label,
      xp_reward = EXCLUDED.xp_reward,
      sort_order = EXCLUDED.sort_order,
      is_active = true,
      updated_at = EXCLUDED.updated_at
  RETURNING * INTO result;
  RETURN result;
END;
$$;

CREATE OR REPLACE FUNCTION public.claim_streak_milestone_v1(
  p_milestone_id uuid
)
RETURNS TABLE (
  claimed boolean,
  xp_amount integer,
  current_streak integer,
  total_xp integer,
  milestone_id uuid
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public, private
AS $$
DECLARE
  target_user uuid := auth.uid();
  current_days integer;
  current_total_xp integer;
  milestone record;
  inserted_claim uuid;
BEGIN
  IF target_user IS NULL THEN
    RAISE EXCEPTION 'Authentication required to claim streak milestone' USING ERRCODE = '42501';
  END IF;
  SELECT current_streak, total_xp INTO current_days, current_total_xp
  FROM public.users_profile WHERE user_id = target_user FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Streak profile unavailable' USING ERRCODE = 'P0002';
  END IF;
  SELECT id, milestone_day, xp_reward, title INTO milestone
  FROM public.streak_milestones
  WHERE id = p_milestone_id AND is_active = true;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Streak milestone not found' USING ERRCODE = 'P0002';
  END IF;
  IF current_days < milestone.milestone_day THEN
    RAISE EXCEPTION 'Streak milestone has not been reached' USING ERRCODE = '22023';
  END IF;
  INSERT INTO public.streak_milestone_claims (user_id, milestone_id, xp_awarded)
  VALUES (target_user, milestone.id, milestone.xp_reward)
  ON CONFLICT (user_id, milestone_id) DO NOTHING
  RETURNING id INTO inserted_claim;
  IF inserted_claim IS NULL THEN
    RETURN QUERY SELECT false, 0, current_days, current_total_xp, milestone.id;
    RETURN;
  END IF;
  INSERT INTO public.xp_ledger (user_id, xp_amount, reason, description, auto_source, auto_source_key)
  VALUES (target_user, milestone.xp_reward, 'streak_milestone', format('Nhận thưởng chuỗi %s ngày · %s', milestone.milestone_day, milestone.title), 'streak_milestone', milestone.id::text);
  UPDATE public.users_profile SET total_xp = total_xp + milestone.xp_reward WHERE user_id = target_user RETURNING total_xp INTO current_total_xp;
  UPDATE public.profiles SET xp_balance = xp_balance + milestone.xp_reward WHERE id = target_user;
  RETURN QUERY SELECT true, milestone.xp_reward, current_days, current_total_xp, milestone.id;
END;
$$;

REVOKE ALL ON FUNCTION public.create_streak_milestone_v1(integer, text, integer) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.create_streak_milestone_v1(integer, text, integer) FROM anon;
GRANT EXECUTE ON FUNCTION public.create_streak_milestone_v1(integer, text, integer) TO authenticated;
REVOKE ALL ON FUNCTION public.claim_streak_milestone_v1(uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.claim_streak_milestone_v1(uuid) FROM anon;
GRANT EXECUTE ON FUNCTION public.claim_streak_milestone_v1(uuid) TO authenticated;
