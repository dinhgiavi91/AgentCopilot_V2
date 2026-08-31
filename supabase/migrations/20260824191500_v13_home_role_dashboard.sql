-- V13: role-aware Home data foundation. All defaults are non-PII operational parameters.
CREATE TABLE IF NOT EXISTS public.streak_milestones (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  milestone_day integer NOT NULL UNIQUE CHECK (milestone_day > 0),
  title text NOT NULL CHECK (char_length(title) BETWEEN 1 AND 100),
  reward_label text NOT NULL CHECK (char_length(reward_label) BETWEEN 1 AND 100),
  sort_order integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at timestamptz NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS streak_milestones_active_sort_idx
  ON public.streak_milestones (is_active, sort_order, milestone_day);

ALTER TABLE public.streak_milestones ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS streak_milestones_public_read ON public.streak_milestones;
DROP POLICY IF EXISTS streak_milestones_super_admin_manage ON public.streak_milestones;
CREATE POLICY streak_milestones_public_read
  ON public.streak_milestones FOR SELECT TO anon, authenticated
  USING (is_active = true);
CREATE POLICY streak_milestones_super_admin_manage
  ON public.streak_milestones FOR ALL TO authenticated
  USING (private.is_super_admin())
  WITH CHECK (private.is_super_admin());

INSERT INTO public.streak_milestones (milestone_day, title, reward_label, sort_order, is_active)
VALUES
  (7, 'Khởi Động Hoàn Hảo', '+50 XP', 10, true),
  (14, 'Giữ Vững Phong Độ', '+150 XP', 20, true),
  (21, 'Thói Quen Chiến Thắng', '+300 XP & Bùa', 30, true),
  (30, 'Kỷ Luật Thép', '+500 XP', 40, true)
ON CONFLICT (milestone_day) DO UPDATE
SET title = EXCLUDED.title,
    reward_label = EXCLUDED.reward_label,
    sort_order = EXCLUDED.sort_order,
    is_active = EXCLUDED.is_active,
    updated_at = timezone('utc'::text, now());

CREATE TABLE IF NOT EXISTS public.team_goal_defaults (
  team_id uuid PRIMARY KEY REFERENCES public.teams(id) ON DELETE CASCADE,
  bhnt_commission_percent integer NOT NULL DEFAULT 40 CHECK (bhnt_commission_percent BETWEEN 0 AND 100),
  bhnt_contract_size bigint NOT NULL DEFAULT 25000000 CHECK (bhnt_contract_size >= 0),
  pnt_commission_percent integer NOT NULL DEFAULT 15 CHECK (pnt_commission_percent BETWEEN 0 AND 100),
  pnt_contract_size bigint NOT NULL DEFAULT 8000000 CHECK (pnt_contract_size >= 0),
  updated_at timestamptz NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL
);

ALTER TABLE public.team_goal_defaults ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS team_goal_defaults_team_read ON public.team_goal_defaults;
DROP POLICY IF EXISTS team_goal_defaults_super_admin_manage ON public.team_goal_defaults;
CREATE POLICY team_goal_defaults_team_read
  ON public.team_goal_defaults FOR SELECT TO authenticated
  USING (team_id = private.current_team_id() OR private.is_super_admin());
CREATE POLICY team_goal_defaults_super_admin_manage
  ON public.team_goal_defaults FOR ALL TO authenticated
  USING (private.is_super_admin())
  WITH CHECK (private.is_super_admin());

INSERT INTO public.team_goal_defaults (
  team_id, bhnt_commission_percent, bhnt_contract_size, pnt_commission_percent, pnt_contract_size
)
SELECT id, 40, 25000000, 15, 8000000
FROM public.teams
ON CONFLICT (team_id) DO NOTHING;

ALTER TABLE public.daily_quizzes
  ADD COLUMN IF NOT EXISTS is_active boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT timezone('utc'::text, now());

DROP POLICY IF EXISTS sprint6_read_daily_quizzes ON public.daily_quizzes;
DROP POLICY IF EXISTS daily_quizzes_active_read ON public.daily_quizzes;
CREATE POLICY daily_quizzes_active_read
  ON public.daily_quizzes FOR SELECT TO anon, authenticated
  USING (is_active = true);

DROP POLICY IF EXISTS daily_quizzes_super_admin_manage ON public.daily_quizzes;
CREATE POLICY daily_quizzes_super_admin_manage
  ON public.daily_quizzes FOR ALL TO authenticated
  USING (private.is_super_admin())
  WITH CHECK (private.is_super_admin());

CREATE OR REPLACE FUNCTION public.publish_daily_quiz_v1(
  p_question text,
  p_option_a text,
  p_option_b text,
  p_option_c text,
  p_correct_option text,
  p_explanation text,
  p_xp_reward integer
)
RETURNS public.daily_quizzes
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public, private
AS $$
DECLARE
  result public.daily_quizzes;
  next_sort_order integer;
BEGIN
  IF auth.uid() IS NULL OR NOT private.is_super_admin() THEN
    RAISE EXCEPTION 'Only Super Admin may publish Daily Quiz' USING ERRCODE = '42501';
  END IF;
  IF char_length(trim(p_question)) NOT BETWEEN 5 AND 1000
    OR char_length(trim(p_option_a)) NOT BETWEEN 1 AND 300
    OR char_length(trim(p_option_b)) NOT BETWEEN 1 AND 300
    OR char_length(trim(p_option_c)) NOT BETWEEN 1 AND 300
    OR char_length(trim(p_explanation)) NOT BETWEEN 5 AND 2000
    OR p_correct_option NOT IN ('A', 'B', 'C')
    OR p_xp_reward NOT BETWEEN 0 AND 1000
    OR p_question ~* '[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}'
    OR p_question ~ '(\+?84|0)[0-9]{8,10}' THEN
    RAISE EXCEPTION 'Invalid Daily Quiz payload' USING ERRCODE = '22023';
  END IF;
  UPDATE public.daily_quizzes SET is_active = false, updated_at = timezone('utc'::text, now()) WHERE is_active = true;
  SELECT COALESCE(MAX(sort_order), 0) + 1 INTO next_sort_order FROM public.daily_quizzes;
  INSERT INTO public.daily_quizzes (
    code, question, option_a, option_b, option_c, correct_option, explanation, xp_reward, sort_order, is_active, updated_at
  ) VALUES (
    format('Q-%s-%s', to_char(timezone('utc'::text, now()), 'YYYYMMDD'), substr(gen_random_uuid()::text, 1, 6)),
    trim(p_question), trim(p_option_a), trim(p_option_b), trim(p_option_c), p_correct_option, trim(p_explanation), p_xp_reward, next_sort_order, true, timezone('utc'::text, now())
  ) RETURNING * INTO result;
  RETURN result;
END;
$$;

CREATE OR REPLACE FUNCTION public.upsert_team_goal_defaults_v1(
  p_team_id uuid,
  p_bhnt_commission_percent integer,
  p_bhnt_contract_size bigint,
  p_pnt_commission_percent integer,
  p_pnt_contract_size bigint
)
RETURNS public.team_goal_defaults
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public, private
AS $$
DECLARE
  result public.team_goal_defaults;
BEGIN
  IF auth.uid() IS NULL OR NOT private.is_super_admin() THEN
    RAISE EXCEPTION 'Only Super Admin may update Team defaults' USING ERRCODE = '42501';
  END IF;
  IF p_team_id IS NULL
    OR p_bhnt_commission_percent NOT BETWEEN 0 AND 100
    OR p_pnt_commission_percent NOT BETWEEN 0 AND 100
    OR p_bhnt_contract_size < 0
    OR p_pnt_contract_size < 0 THEN
    RAISE EXCEPTION 'Invalid Team default values' USING ERRCODE = '22023';
  END IF;
  INSERT INTO public.team_goal_defaults (
    team_id, bhnt_commission_percent, bhnt_contract_size, pnt_commission_percent, pnt_contract_size, updated_at, updated_by
  ) VALUES (
    p_team_id, p_bhnt_commission_percent, p_bhnt_contract_size, p_pnt_commission_percent, p_pnt_contract_size, timezone('utc'::text, now()), auth.uid()
  )
  ON CONFLICT (team_id) DO UPDATE
  SET bhnt_commission_percent = EXCLUDED.bhnt_commission_percent,
      bhnt_contract_size = EXCLUDED.bhnt_contract_size,
      pnt_commission_percent = EXCLUDED.pnt_commission_percent,
      pnt_contract_size = EXCLUDED.pnt_contract_size,
      updated_at = EXCLUDED.updated_at,
      updated_by = EXCLUDED.updated_by
  RETURNING * INTO result;
  RETURN result;
END;
$$;

REVOKE ALL ON FUNCTION public.upsert_team_goal_defaults_v1(uuid, integer, bigint, integer, bigint) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.upsert_team_goal_defaults_v1(uuid, integer, bigint, integer, bigint) FROM anon;
GRANT EXECUTE ON FUNCTION public.upsert_team_goal_defaults_v1(uuid, integer, bigint, integer, bigint) TO authenticated;
REVOKE ALL ON FUNCTION public.publish_daily_quiz_v1(text, text, text, text, text, text, integer) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.publish_daily_quiz_v1(text, text, text, text, text, text, integer) FROM anon;
GRANT EXECUTE ON FUNCTION public.publish_daily_quiz_v1(text, text, text, text, text, text, integer) TO authenticated;
