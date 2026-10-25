# Referral Navigator version history

This page is the source of truth for how the prototype branches map to product versions. Branch names and preview URLs are implementation/deployment references; they do not define a separate unversioned product line.

| Version | Scope | Git branch / status |
| --- | --- | --- |
| v0 | Original referral prototype | Historical baseline |
| v0.1 | Patient-owned referral companion | See the Version Links sheet |
| v0.2 | Referral-agent exploration | See the Version Links sheet |
| v0.3 | Patient-owned referral workflow, localization, and handoff refinements | Includes the branches `v0.3-appointments-localized` and `v0.3-handoff-refinements` |
| v0.3 — auth/account follow-on | Supabase sign-in and sessions, protected app routes, authenticated dashboard, landing-first sign-in/create-account flow, and translated account name field | `codex/supabase-auth-foundation`; this is a later v0.3 build, not an unversioned branch |
| v0.4 | Research-informed referral-flow iteration | `codex/v0.4-research-informed-referral-flow`; a distinct later iteration after v0.3 |

## Auth/account follow-on detail

The auth/account work is tracked as a follow-on within v0.3 because it extends the patient-owned referral app with account and sign-in capabilities. The branch name remains `codex/supabase-auth-foundation` for technical continuity; use **v0.3 — auth/account follow-on** in product notes, version lists, and preview references.

The auth branch’s preview deployments are snapshots of that v0.3 follow-on. Their fixed deployment URLs and commit SHAs are listed in the Referral Navigator spreadsheet’s **Version Links** tab. The branch alias can move as new commits are added.

## Versioning guidance

- Do not label `codex/supabase-auth-foundation` as “unversioned.”
- Keep the auth/account follow-on distinct from v0.4, which is the next research-informed product iteration.
- When recording a preview, preserve its branch, deployment URL, commit SHA, and build purpose so the exact snapshot remains identifiable.
- The original README flow describes the early prototype and is historical; consult this version history and the source branch for current scope.
