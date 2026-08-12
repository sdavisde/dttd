-- Drop weekends.title.
--
-- The column stored a free-text label ("DTTD#11", "Mens DTTD#12", "DTTD Mens
-- #42" — three formats accumulated over time) that was written once at weekend
-- creation and never editable through the UI. It duplicated data we already
-- store: weekend_groups.number and weekends.type.
--
-- Labels are now derived at render time from those two fields, so nothing reads
-- or writes this column. See lib/weekend/labels.ts.
--
-- SAFETY: any weekend whose title was hand-edited to something non-canonical
-- loses that text. Verify before applying:
--   SELECT id, type, title, group_id FROM public.weekends ORDER BY start_date;
--
-- Weekends must also be attached to a numbered group, or their derived label
-- will have no number. Verify this returns zero rows before applying:
--   SELECT w.id, w.type, w.title
--   FROM public.weekends w
--   LEFT JOIN public.weekend_groups g ON g.id = w.group_id
--   WHERE w.group_id IS NULL OR g.number IS NULL;

ALTER TABLE public.weekends
  DROP COLUMN IF EXISTS title;
