-- V79: Persist the canonical L.E.A.D description and prevent Leaders without a result from bypassing onboarding.
alter table public.profiles
  add column if not exists leadership_style_description text;

alter table public.profiles
  drop constraint if exists profiles_leadership_style_description_length_check;
alter table public.profiles
  add constraint profiles_leadership_style_description_length_check
  check (leadership_style_description is null or char_length(leadership_style_description) <= 2000);

update public.profiles as profile
set leadership_style_description = test.results -> profile.leadership_style ->> 'description'
from public.leadership_tests as test
where test.test_key = 'leadership_style_v1'
  and profile.leadership_style is not null
  and profile.leadership_style_description is null;

create or replace function public.complete_my_leadership_checkpoint_v1(p_style text)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_role public.pilot_role;
  v_description text;
begin
  if auth.uid() is null then
    raise exception 'Vui lòng đăng nhập trước khi lưu kết quả Leadership Test.';
  end if;

  select role into v_role from public.profiles where id = auth.uid();
  if v_role not in ('leader', 'super_admin') then
    raise exception 'Leadership Test chỉ dành cho Leader hoặc Super Admin.';
  end if;
  if p_style not in ('Visionary', 'Architect', 'Nurturer', 'Coach') then
    raise exception 'Kết quả phong cách lãnh đạo không hợp lệ.';
  end if;

  select results -> p_style ->> 'description'
  into v_description
  from public.leadership_tests
  where test_key = 'leadership_style_v1'
    and is_active = true;
  if coalesce(trim(v_description), '') = '' then
    raise exception 'Chưa tìm thấy mô tả phong cách lãnh đạo hợp lệ.';
  end if;

  update public.profiles
  set leadership_style = p_style,
      leadership_style_description = v_description
  where id = auth.uid();

  return p_style;
end;
$$;
