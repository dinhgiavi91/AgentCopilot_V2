-- V68: one live configuration row controls the client feedback survey UI.
create table if not exists public.feedback_config (
  id smallint primary key check (id = 1),
  headline text not null check (char_length(btrim(headline)) between 3 and 180),
  dropdown_options jsonb not null check (jsonb_typeof(dropdown_options) = 'array' and jsonb_array_length(dropdown_options) between 1 and 20),
  question_label text not null check (char_length(btrim(question_label)) between 3 and 180),
  updated_at timestamptz not null default now()
);

insert into public.feedback_config (id, headline, dropdown_options, question_label)
values (
  1,
  'Nói thật. Xây tốt hơn.',
  '["Bảo Bối Thực Chiến", "Ngôn Ngữ Thấu Cảm", "Marketing 1-Chạm", "Trạm Đăng Kiểm", "Radar Giữ Quân"]'::jsonb,
  'Đề xuất phát triển'
)
on conflict (id) do nothing;

alter table public.feedback_config enable row level security;
drop policy if exists "v68_feedback_config_read" on public.feedback_config;
drop policy if exists "v68_feedback_config_super_admin_update" on public.feedback_config;
create policy "v68_feedback_config_read" on public.feedback_config for select to anon, authenticated using (true);
create policy "v68_feedback_config_super_admin_update" on public.feedback_config for update to authenticated using (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'super_admin' and is_active = true)
) with check (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'super_admin' and is_active = true)
);

grant select on public.feedback_config to anon, authenticated;
grant update on public.feedback_config to authenticated;
