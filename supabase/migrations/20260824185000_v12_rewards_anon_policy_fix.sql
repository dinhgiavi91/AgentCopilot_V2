-- Corrects V12's mixed anon/auth policy: anon cannot call private role helpers.
DROP POLICY IF EXISTS xp_rewards_global_or_team_read ON public.xp_rewards;
DROP POLICY IF EXISTS xp_rewards_global_read ON public.xp_rewards;
DROP POLICY IF EXISTS xp_rewards_authenticated_global_or_team_read ON public.xp_rewards;

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
