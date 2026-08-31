-- V69: optional operational tagline for a principle or coaching script.
alter table public.leader_playbook add column if not exists note text;
alter table public.leader_playbook drop constraint if exists leader_playbook_note_length;
alter table public.leader_playbook add constraint leader_playbook_note_length check (note is null or char_length(btrim(note)) <= 280);
