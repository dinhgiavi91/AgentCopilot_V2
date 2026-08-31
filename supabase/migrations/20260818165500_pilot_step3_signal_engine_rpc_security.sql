-- Step 3 hotfix for already-applied Signal Engine migration.
-- Keep evaluation server-side in Postgres while preserving caller identity so
-- RLS and the explicit Super Admin guard both participate in authorization.

drop policy if exists signal_engine_runs_super_admin_insert on public.signal_engine_runs;
create policy signal_engine_runs_super_admin_insert on public.signal_engine_runs for insert to authenticated
  with check ((select private.is_super_admin()) and triggered_by = (select auth.uid()));

alter function public.run_signal_engine_v1(boolean) security invoker;
revoke all on function public.run_signal_engine_v1(boolean) from public;
revoke execute on function public.run_signal_engine_v1(boolean) from anon;
grant execute on function public.run_signal_engine_v1(boolean) to authenticated;
