-- V92: Add structured, non-rewarded coaching mini-quiz metadata to Leader principles.
alter table public.leader_playbook
  add column if not exists mini_quiz jsonb;

alter table public.leader_playbook
  drop constraint if exists leader_playbook_mini_quiz_shape_check;

alter table public.leader_playbook
  add constraint leader_playbook_mini_quiz_shape_check
  check (
    mini_quiz is null
    or (
      jsonb_typeof(mini_quiz) = 'object'
      and jsonb_typeof(mini_quiz -> 'question') = 'string'
      and jsonb_typeof(mini_quiz -> 'options') = 'array'
      and jsonb_array_length(mini_quiz -> 'options') >= 2
      and jsonb_typeof(mini_quiz -> 'correct_index') = 'number'
      and jsonb_typeof(mini_quiz -> 'correct_explanation') = 'string'
      and jsonb_typeof(mini_quiz -> 'wrong_explanation') = 'string'
    )
  );

comment on column public.leader_playbook.mini_quiz is
  'Optional V92 coaching mini-quiz metadata; feedback only, never grants XP, coin, or reward.';
