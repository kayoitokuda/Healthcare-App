# Supabase setup

Reviewed October 29, 2026 against the active `src/App.tsx` on `v0.4.4-denial-next-steps`; the same authentication/persistence architecture is present on the v0.4.3 main baseline.

The public landing page precedes email/password sign-in or account creation. A signed-in user enters the dashboard; referral JSON is loaded and saved in `public.referrals` with the user's `owner_id`. Code and schema inspection establish implementation intent, not successful configuration or data isolation on a live deployment.

## Configure the project

1. In the intended Supabase project, apply [the starter migration](supabase/migrations/20261024000000_initial_schema.sql) once through your migration workflow or SQL Editor. It creates profile/referral tables, owner-only RLS policies, and triggers. It is not safe to blindly rerun the whole file: policies and triggers are not guarded against duplicates.
2. Run `npm ci` using the committed lockfile.
3. Copy `.env.example` to `.env.local` and set `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY`. Use the browser publishable key, never a secret/service-role key.
4. Configure email/password authentication, email confirmation/delivery as intended, and the Site URL and allowed redirect URLs for the local and deployed environments.
5. Set the two variables in the intended Vercel environment and redeploy. These are Vite build-time values; a previously built deployment will not pick up newly entered variables automatically.

```bash
npm ci
cp .env.example .env.local
# Set the project URL and publishable key in .env.local.
npm run dev
```

## Actual application behavior

- **No configuration:** the public landing page remains available; authentication reports that Supabase is not configured. The active app does not fall back to an anonymous in-memory tracker.
- **New account:** the app loads that account's referral rows; an account with no rows starts empty after loading.
- **Persistence:** the active app filters reads by owner, upserts JSON referral payloads after changes, and explicitly deletes rows for referral deletion. RLS must independently enforce ownership.
- **Language:** the browser preference is stored locally. Settings saves the account default in Auth user metadata (`preferred_language`), which is restored on sign-in. The migration's `profiles.preferred_language` column is not the active Settings persistence path.
- **Demo flag:** `.env.example` still includes `VITE_ENABLE_DEMO_DATA`, but it is used only in the legacy `src/data/ReferralsContext.tsx`. The active `App.tsx` does not read it; setting it does not enable a current demo loader. Fictional fixtures in the repository are not proof of a working public demo flow.
- **Communication:** saving referral data is not sending a message to a clinic. The active app prepares drafts and records patient-entered contact history only.

## Schema and validation boundaries

The migration defines `public.profiles` and `public.referrals`, including a unique `(owner_id, referral_key)` constraint, JSON payloads, authenticated-user permissions, and owner-based RLS policies. The active payload type is defined in `src/App.tsx`; the legacy `src/types.ts` shape is different. No migration of older JSON payload shapes has been verified in this audit.

Before treating a deployment as validated, check with fictional records:

- Sign-up/confirmation, sign-in, session restoration, and sign-out.
- Referral creation, updates, notes, archive/restore, and deletion survive refresh and a new session.
- Two independent accounts cannot read or modify each other's records, including direct data-access attempts.
- Network/save failures are visible and do not imply successful persistence; deletion and concurrent updates deserve particular attention.
- Account language preference restores correctly on another session.

These checks were not run during this documentation audit. Supabase configuration alone does not establish production readiness or approval for real patient data; the repository's prototype boundary remains in place.
