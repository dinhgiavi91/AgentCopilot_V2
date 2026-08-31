-- V88: Khớp contract dữ liệu phẳng để renderer phân biệt tuyệt đối nguyên tắc và coaching script.
alter table public.leader_playbook
  add column if not exists prefix text;

-- Bỏ constraint cũ trước khi chuẩn hóa giá trị type đang có.
alter table public.leader_playbook
  drop constraint if exists leader_playbook_type_check;

-- Chuẩn hóa dữ liệu cũ trước khi siết constraint mới.
update public.leader_playbook
set type = 'coaching_script'
where type = 'coaching';

alter table public.leader_playbook
  drop constraint if exists leader_playbook_prefix_length;
alter table public.leader_playbook
  add constraint leader_playbook_prefix_length
  check (prefix is null or char_length(btrim(prefix)) between 2 and 32);

alter table public.leader_playbook
  add constraint leader_playbook_type_check
  check (type in ('principle', 'coaching_script'));
