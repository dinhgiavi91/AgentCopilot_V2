-- Existing redemption RPCs power the O2O flow and must never be callable anonymously.

revoke execute on function public.redeem_xp_reward_v1(text, uuid) from public, anon;
revoke execute on function public.list_reward_redemptions_v1() from public, anon;
grant execute on function public.redeem_xp_reward_v1(text, uuid) to authenticated;
grant execute on function public.list_reward_redemptions_v1() to authenticated;
