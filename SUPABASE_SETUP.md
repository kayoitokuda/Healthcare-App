# Supabase setup

This branch adds the first database schema for Referral Navigator. The current React app still uses fictional, in-memory prototype data; this migration does not import that data or make it persist yet.

## Configure the project

1. In the Supabase dashboard, open the project SQL Editor and run [the starter migration](supabase/migrations/20261024000000_initial_schema.sql).
2. In the app repository, create a local `.env.local` file using the names in `.env.example`. Use the project URL and publishable key from Supabase.
3. Add the same variables to the Vercel project's Development and Preview environments. Add Production only when you are ready to use the production app.
4. In Supabase Auth settings, set the site URL and allowed redirect URLs for local development and the Vercel preview/deployment domains.
5. Choose the sign-in method and verify email delivery before inviting testers.

## Data access

The starter schema contains a profile row linked to each auth user and a referrals table with a JSON payload shaped for the current prototype. Row Level Security is enabled and policies scope every profile and referral operation to the signed-in user's ID. The app should use only the publishable key in the browser; never put a Supabase secret/service-role key in Vite variables or frontend code.

The current sample referrals describe fictional patients and clinics. Keep them as prototype fixtures; don't load real patient data into the free project. Supabase states HIPAA use requires a signed BAA and a HIPAA-configured project, and its HIPAA capability is not part of the Free plan.

## Next application changes

- Add Supabase Auth UI and session handling.
- Replace the in-memory referrals context with reads and writes to `public.referrals`.
- Add a clear empty state and a development-only way to load synthetic sample data.
- Test access with two accounts to confirm each account can only see its own rows.
