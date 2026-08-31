REVOKE ALL ON FUNCTION public.upsert_team_goal_defaults_v1(uuid, integer, bigint, integer, bigint) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.upsert_team_goal_defaults_v1(uuid, integer, bigint, integer, bigint) FROM anon;
GRANT EXECUTE ON FUNCTION public.upsert_team_goal_defaults_v1(uuid, integer, bigint, integer, bigint) TO authenticated;
REVOKE ALL ON FUNCTION public.publish_daily_quiz_v1(text, text, text, text, text, text, integer) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.publish_daily_quiz_v1(text, text, text, text, text, text, integer) FROM anon;
GRANT EXECUTE ON FUNCTION public.publish_daily_quiz_v1(text, text, text, text, text, text, integer) TO authenticated;
