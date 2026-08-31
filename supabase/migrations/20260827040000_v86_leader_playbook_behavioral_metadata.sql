alter table public.leader_playbook
  add column if not exists share_text text,
  add column if not exists roleplay_prompt text;

alter table public.leader_playbook
  drop constraint if exists leader_playbook_share_text_length;
alter table public.leader_playbook
  add constraint leader_playbook_share_text_length
  check (share_text is null or char_length(btrim(share_text)) between 3 and 1600);

alter table public.leader_playbook
  drop constraint if exists leader_playbook_roleplay_prompt_length;
alter table public.leader_playbook
  add constraint leader_playbook_roleplay_prompt_length
  check (roleplay_prompt is null or char_length(btrim(roleplay_prompt)) between 3 and 3000);
