-- V94: Structured step-by-step learning carousel for Leader principles.
alter table public.leader_playbook
  add column if not exists learning_carousel jsonb;

alter table public.leader_playbook
  drop constraint if exists leader_playbook_learning_carousel_shape_check;

alter table public.leader_playbook
  add constraint leader_playbook_learning_carousel_shape_check
  check (
    learning_carousel is null
    or (
      jsonb_typeof(learning_carousel) = 'object'
      and jsonb_typeof(learning_carousel -> 'situations') = 'array'
      and jsonb_array_length(learning_carousel -> 'situations') >= 1
      and jsonb_typeof(learning_carousel -> 'summary') = 'object'
      and jsonb_typeof(learning_carousel -> 'summary' -> 'title') = 'string'
      and jsonb_typeof(learning_carousel -> 'summary' -> 'content') = 'string'
      and jsonb_typeof(learning_carousel -> 'summary' -> 'homework') = 'string'
    )
  );

comment on column public.leader_playbook.learning_carousel is
  'Optional V94 step-by-step principle learning carousel with situations and a non-rewarded summary/homework state.';
