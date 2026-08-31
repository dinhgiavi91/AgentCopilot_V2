-- V66 compatibility: retain the existing public.empathy_dictionary table as the canonical station table.
alter table public.empathy_dictionary add column if not exists technical_term text;
alter table public.empathy_dictionary add column if not exists category text not null default 'Chung';

update public.empathy_dictionary
set technical_term = legal_term
where technical_term is null or btrim(technical_term) = '';

alter table public.empathy_dictionary alter column technical_term set not null;
alter table public.empathy_dictionary drop constraint if exists empathy_dictionary_technical_term_length;
alter table public.empathy_dictionary add constraint empathy_dictionary_technical_term_length check (char_length(btrim(technical_term)) between 2 and 200);
alter table public.empathy_dictionary drop constraint if exists empathy_dictionary_category_length;
alter table public.empathy_dictionary add constraint empathy_dictionary_category_length check (char_length(btrim(category)) between 2 and 80);

drop policy if exists "v66_empathy_super_admin_write" on public.empathy_dictionary;
create policy "v66_empathy_super_admin_write" on public.empathy_dictionary for all to authenticated using (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'super_admin' and is_active = true)
) with check (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'super_admin' and is_active = true)
);

grant select, insert, update, delete on public.empathy_dictionary to authenticated;
