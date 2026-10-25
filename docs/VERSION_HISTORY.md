# Referral Navigator version history

This page is the source of truth for branch-to-version naming. Patch numbers are assigned by branch family, using the earliest known successful Vercel preview publication time for that branch. Multiple deployment snapshots from the same branch stay under the same patch number. The **Version Links** tab is sorted newest to oldest by its Pacific build-created timestamp.

| Version | Scope | First known preview publication (Pacific) | Canonical branch | Earlier source branch |
| --- | --- | --- | --- | --- |
| v0 | Original prototype | Sep 18, 2026, 3:20 p.m. | `claude/youthful-volta-ragd1z` | — |
| v0.1.1 | Patient-owned companion development | Oct 17, 2026, 1:25 a.m. | `v0.1.1-patient-owned-companion` | `codex/patient-owned-referral-companion` |
| v0.1.2 | Main-branch snapshot | Oct 17, 2026, 2:17 a.m. | `v0.1.2-main-snapshot` | `main` |
| v0.2.1 | Referral-agent build line, including its later language update | Oct 20, 2026, 7:05 p.m. | `v0.2.1-referral-agent` | `referral-agent-0-2` |
| v0.3.1 | Handoff refinements | Oct 23, 2026, 11:46 a.m. | `v0.3.1-handoff-refinements` | `v0.3-handoff-refinements` |
| v0.3.2 | Appointments and localization | Oct 23, 2026, 2:26 p.m. | `v0.3.2-appointments-localized` | `v0.3-appointments-localized` |
| v0.3.3 | Supabase sign-in/account follow-on | Oct 24, 2026, 2:20 p.m. | `v0.3.3-auth-account-follow-on` | `codex/supabase-auth-foundation` |
| v0.4.1 | Research-informed referral-flow iteration | Oct 24, 2026, 11:46 p.m. | `v0.4.1-research-informed-referral-flow` | `v0.4-research-informed-referral-flow`, `codex/v0.4-research-informed-referral-flow` |

## Patch sequence

Version numbers follow first known successful preview publication dates, not the previous spreadsheet row order. The v0.3 sequence is handoff refinements, appointments/localization, then the auth/account follow-on. The v0.1 branches are ordered by their Oct 17 publication times. The v0.2.1 and v0.4.1 rows each group multiple snapshots from their single branch family rather than incrementing the patch for every deployment.

## Canonical branch naming

Use the version-prefixed canonical branches in the table for ongoing work. Earlier source refs remain available for historical previews and commit provenance. The v0.1.2 branch is a snapshot at its recorded v0.1 main-branch commit; it does not rename or repoint the current `main` branch.

The connected GitHub actions can create and update branches but do not provide a branch-rename/delete operation. Canonical versioned branches were created from the documented source snapshots or branch heads; old refs remain intact.

## Preview tracking

Fixed Vercel deployment URLs and commit SHAs identify historical snapshots. The branch alias can move as the canonical branch advances. The spreadsheet’s **Version Links** tab records both, in descending **Build created (Pacific)** order. Decision-log entries stay at the broader v0.1 label when the historical record does not identify which of its two branch snapshots the decision belonged to.
