-- Defense in depth: explicitly remove function execute from anon.
-- The app grants only authenticated callers access to O2O read/mutation RPCs.

revoke execute on function public.list_my_notifications_v1() from public, anon;
revoke execute on function public.mark_my_notification_read_v1(uuid) from public, anon;
revoke execute on function public.list_my_reward_redemptions_v1() from public, anon;
revoke execute on function public.list_team_pending_reward_redemptions_v1() from public, anon;
revoke execute on function public.fulfill_team_reward_redemption_v1(uuid) from public, anon;
revoke execute on function public.notify_xp_ledger_insert_v1() from public, anon, authenticated;
revoke execute on function public.notify_reward_redemption_insert_v1() from public, anon, authenticated;
revoke execute on function public.notify_community_comment_insert_v1() from public, anon, authenticated;
revoke execute on function public.notify_community_reaction_insert_v1() from public, anon, authenticated;

grant execute on function public.list_my_notifications_v1() to authenticated;
grant execute on function public.mark_my_notification_read_v1(uuid) to authenticated;
grant execute on function public.list_my_reward_redemptions_v1() to authenticated;
grant execute on function public.list_team_pending_reward_redemptions_v1() to authenticated;
grant execute on function public.fulfill_team_reward_redemption_v1(uuid) to authenticated;
