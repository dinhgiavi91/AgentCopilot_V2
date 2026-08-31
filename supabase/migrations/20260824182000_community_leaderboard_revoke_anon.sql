-- Defense in depth: prevent unauthenticated RPC access to the Team leaderboard.
REVOKE ALL ON FUNCTION public.get_weekly_leaderboard_v1(uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.get_weekly_leaderboard_v1(uuid) FROM anon;
GRANT EXECUTE ON FUNCTION public.get_weekly_leaderboard_v1(uuid) TO authenticated;
