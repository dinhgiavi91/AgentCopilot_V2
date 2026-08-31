-- Pilot Step 3C — make the D1 checkpoint explicitly available for dry-run and production outcome evaluation.
alter type public.pilot_checkpoint_day add value if not exists 'd1' before 'd7';
