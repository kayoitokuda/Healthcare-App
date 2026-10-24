# Supabase setup

The app now has email/password sign-up and sign-in, a session gate, and referral reads/writes scoped to the signed-in user. Referral records are stored as JSON payloads while the prototype data model is being validated.

## Supabase project setup

1. Open the SQL Editor for the Referral Navigator project and run [the starter migration](supabase/migrations/20261024000000_initial_schema.sql). It creates the profile/referral tables, turns on Row Level Security, and adds owner-only policies.
2. In the repository, create a local `.env.local` from `.env.example`. Set `VITE_SUPABASE_URL` to the project's URL and `VITE_SUPABASE_PUBLISHABLE_KEY` to the publishable key. Do not add a secret/service-role key to the browser app.
3. Run `npm install` after pulling this branch. This installs `@supabase/supabase-js` and updates the lockfile for the new dependency.
4. In Supabase Auth settings, set the Site URL and add redirect URLs for local development and the Vercel preview/deployment domains. Enable email/password sign-in and confirm the email-delivery settings.
5. In Vercel Project Settings → Environment Variables, add `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` for Development and Preview. Add Production when you're ready to use the authenticated app there, then redeploy.

## Run locally

```bash
npm install
cp .env.example .env.local
npm run dev
```

Fill in the two Supabase values in `.env.local` before signing up. When Supabase variables are absent, the app continues to show its fictional, in-memory prototype. When configured, sign-in is required and a new account starts with an empty referrals list.

To make fictional sample referrals available for manual demos, set `VITE_ENABLE_DEMO_DATA=true`. A signed-in user can then explicitly load the sample records from the empty state. Leave it false in production.

## Data access and privacy

The schema stores a profile per auth user and referral payloads in `public.referrals`. Each referral row includes the owning auth user ID; RLS policies restrict reads, inserts, updates, and deletes to that same user. The app uses only the publishable key in the browser.

The sample records describe fictional patients and clinics. Keep them as test fixtures. Supabase states that use with real patient information requires a signed BAA and HIPAA project configuration; HIPAA support is not included in the Free plan.
