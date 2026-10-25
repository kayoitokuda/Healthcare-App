# Referral Navigator version history

This page records the product version labels, their first known successful Vercel preview publication time, and the canonical Git branch to use for continued work. Version suffixes follow the earliest known published preview time in the Referral Navigator **Version Links** sheet; the sheet itself is displayed newest to oldest by publish time.

| Version | Scope | First known preview publication (Pacific) | Canonical branch | Earlier source branch |
| --- | --- | --- | --- | --- |
| v0 | Original prototype | Sep 18, 2026, 3:20 p.m. | `claude/youthful-volta-ragd1z` | — |
| v0.1 | Patient-owned referral companion | Oct 17, 2026 | `main` / `codex/patient-owned-referral-companion` | — |
| v0.2 | Referral-agent exploration and language options | Oct 20, 2026 | `referral-agent-0-2` | — |
| v0.3.1 | Handoff refinements | Oct 23, 2026, 11:46 a.m. | `v0.3.1-handoff-refinements` | `v0.3-handoff-refinements` |
| v0.3.2 | Appointments and localization | Oct 23, 2026, 2:26 p.m. | `v0.3.2-appointments-localized` | `v0.3-appointments-localized` |
| v0.3.3 | Supabase sign-in/account follow-on | Oct 24, 2026, 2:20 p.m. | `v0.3.3-auth-account-follow-on` | `codex/supabase-auth-foundation` |
| v0.4 | Research-informed referral-flow iteration | Oct 24, 2026, 11:46 p.m. | `v0.4-research-informed-referral-flow` | `codex/v0.4-research-informed-referral-flow` |

## v0.3 patch sequence

The v0.3 patch numbers are assigned by first successful preview publication time, not by the order rows previously appeared in the spreadsheet:

1. **v0.3.1 — Handoff refinements:** first published Oct 23 at 11:46 a.m. PT.
2. **v0.3.2 — Appointments and localization:** first published Oct 23 at 2:26 p.m. PT.
3. **v0.3.3 — Auth/account follow-on:** first successful auth preview published Oct 24 at 2:20 p.m. PT. Later sign-in, account creation, and language previews remain snapshots within this same follow-on version.

The v0.4 research-informed branch is a distinct later product iteration, first published after the v0.3.3 auth/account work.

## Branch naming

Use the version-prefixed canonical branches above for ongoing work. The earlier source branch refs are retained as historical refs so existing previews and commit history remain traceable; they are not separate unversioned product versions. The connected GitHub actions can create and update branches but do not provide a branch-rename/delete operation.

## Preview tracking

Fixed Vercel deployment URLs and commit SHAs identify historical snapshots. Branch aliases can move as the canonical branch advances. The **Version Links** tab records both, sorted by **Build created (Pacific)** from newest to oldest.
