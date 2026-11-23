-- 0003_site_settings_contact_guard.sql
-- `site_settings` is world-readable (anon select), so a number that is meant to
-- stay private must never be stored there. The UI gate in channels.ts is not a
-- control against a leaked/rotated anon key; this CHECK is.
-- The flag comparisons use `is not distinct from` on purpose: `NULL = 'true'`
-- is NULL and a NULL CHECK passes, so an absent flag must count as not public.
begin;

alter table public.site_settings
  drop constraint if exists site_settings_contact_public_only;

alter table public.site_settings
  add constraint site_settings_contact_public_only check (
    key <> 'contact'
    or (
      (not (value ? 'phone')    or value->>'phone_public'    is not distinct from 'true')
      and
      (not (value ? 'whatsapp') or value->>'whatsapp_public' is not distinct from 'true')
    )
  );

commit;
