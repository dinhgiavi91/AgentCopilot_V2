-- Pilot Step 2 aligns activity event values with the existing Daily Action workflow.
alter type public.pilot_activity_event_type add value if not exists 'heartbeat';
alter type public.pilot_activity_event_type add value if not exists 'meeting_logged';
alter type public.pilot_activity_event_type add value if not exists 'followup_created';
alter type public.pilot_activity_event_type add value if not exists 'followup_done';
alter type public.pilot_activity_event_type add value if not exists 'learning_session';
