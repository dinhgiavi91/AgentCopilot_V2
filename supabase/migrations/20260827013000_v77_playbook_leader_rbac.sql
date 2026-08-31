-- V77: Leader-only Playbook cards remain invisible to advisor/TVV at the data boundary.
-- Rookie, Pro and Master content remains readable by every existing reader role.
drop policy if exists "content_library_read_playbook" on public.playbook_cards;

create policy "content_library_read_playbook" on public.playbook_cards
for select to anon, authenticated
using (
  coalesce(lower(required_level), 'rookie') <> 'leader'
  or (
    auth.uid() is not null
    and exists (
      select 1
      from public.profiles
      where profiles.id = auth.uid()
        and profiles.role in ('leader', 'super_admin')
    )
  )
);
