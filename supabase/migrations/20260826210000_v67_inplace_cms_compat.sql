-- V67 compatibility: preserve V66 data while matching the in-place CMS field contract.
alter table public.news_90s add column if not exists video_url text;

alter table public.leader_playbook drop constraint if exists leader_playbook_type_check;
update public.leader_playbook set type = 'coaching' where type = 'coaching_script';
alter table public.leader_playbook add constraint leader_playbook_type_check check (type in ('principle', 'coaching'));

alter table public.user_feedbacks add column if not exists feature text;
update public.user_feedbacks set feature = favorite_feature where feature is null or btrim(feature) = '';
alter table public.user_feedbacks alter column feature set not null;
alter table public.user_feedbacks drop constraint if exists user_feedbacks_feature_length;
alter table public.user_feedbacks add constraint user_feedbacks_feature_length check (char_length(btrim(feature)) between 2 and 120);

-- Keep both field names temporarily so existing app clients and migrated feedback stay readable.
create index if not exists news_90s_video_idx on public.news_90s(created_at desc) where video_url is not null;
