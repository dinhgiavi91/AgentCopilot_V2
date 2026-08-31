-- V66 canonical identifier for the existing empathy dictionary, preserving legacy code references.
alter table public.empathy_dictionary add column if not exists id uuid default gen_random_uuid();
update public.empathy_dictionary set id = gen_random_uuid() where id is null;
alter table public.empathy_dictionary alter column id set not null;
create unique index if not exists empathy_dictionary_id_idx on public.empathy_dictionary(id);
