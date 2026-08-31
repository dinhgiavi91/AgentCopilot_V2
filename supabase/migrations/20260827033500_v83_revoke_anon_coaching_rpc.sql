revoke execute on function public.list_my_coaching_advisors_v1() from public, anon;
revoke execute on function public.log_my_coaching_application_v1(uuid, uuid, text) from public, anon;
grant execute on function public.list_my_coaching_advisors_v1() to authenticated;
grant execute on function public.log_my_coaching_application_v1(uuid, uuid, text) to authenticated;
