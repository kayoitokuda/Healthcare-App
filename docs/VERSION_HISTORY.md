# Referral Navigator version history

## November 4, 2026 — v0.5.0 PWA development

The `v0.5.0-pwa` branch starts from the deployed v0.4.4 head `d1ef5bc` and adds installable Progressive Web App support. This is a development preview; it has not been merged or promoted to production.

- Standalone manifest, Android and Apple home-screen icons, and install metadata.
- Five-language landing-page install option with browser-menu fallback guidance.
- Network-only service worker; patient data and app files are not cached for offline use.

Build and preview findings are documented in [v0.5.0 PWA implementation and QA](PWA_V0.5.0.md).

## November 2, 2026 — v0.4.4 mobile integration

The canonical `v0.4.4-denial-next-steps` branch now includes `codex/mobile-referral-experience` through source commit `6f030a7`. This remains v0.4.4; the mobile branch is an implementation branch within that version family, not a new numbered release. GitHub `main` remains the v0.4.3 application baseline.

- Guided account creation and referral entry, optional unknown details, reusable office selections, and review/edit before saving.
- Mobile bottom navigation, consistent gold logo and serif wordmark, compact Help/Settings controls, and sign-out in Settings.
- Full-width welcome heading, readable small-screen cards, horizontal overflow corrections, and measured bottom-navigation clearance.
- The inherited October 31 changes also include office-name suggestions, newest-first journey entries, and multi-event update selection.

Validation: production build passes. Browser checks confirmed no dashboard horizontal overflow at 320/360/390/768px and bottom-content clearance at 360 × 640. Lint retains existing warnings. Signup, persistence, account isolation, translation completeness, keyboard/device behavior, and human usability still need validation. The frozen v0.4.3 research baseline is unchanged.

See [mobile implementation notes](MOBILE_EXPERIENCE.md). Fixed deployment snapshots and commit SHAs are tracked in the private Version Links project record.

## Historical audit context

The sections below describe the October 29 audit; the integration note above supersedes its implementation/backlog status where specified.


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
| v0.4.2 | Flexible referral-details journey layout exploration | Oct 26, 2026, 6:44 p.m. | `v0.4-referral-details-layout-exploration` | `v0.4.1-research-informed-referral-flow` |
| v0.4.3 | Separate dashboard pages for overview, referrals, and next steps | Oct 26, 2026, 7:30 p.m. | `v0.4.3-dashboard-pages` | `v0.4-referral-details-layout-exploration` |
| v0.4.4 | Denial and redirection follow-up questions with tailored next-step suggestions | Oct 29, 2026, 4:45 p.m. | `v0.4.4-denial-next-steps` | `v0.4.3-dashboard-pages` |
| v0.5.0 | Installable PWA and standalone mobile shell | Nov 4, 2026, 12:59 a.m. | `v0.5.0-pwa` | `v0.4.4-denial-next-steps` |

## Historical branch and research status — October 29, 2026

- Latest inspected implementation: `v0.4.4-denial-next-steps`, with optional denial/redirection follow-up questions and contextual administrative suggestions.
- `main` application code remains at the v0.4.3 baseline; updating documentation does not merge v0.4.4 application changes.
- GitHub default branch remains `claude/youthful-volta-ragd1z` (v0 code). Default checkout is not the latest implementation.
- The [fixed v0.4.3 formative-test preview](https://referral-navigator-94dxl0ja0-kayoitokudas-projects.vercel.app) remains the planned baseline. The test plan (private project record) records S01, S03, and S09 as not started.
- Preview publication timestamps above are retained from the existing version record; they were not independently re-audited against Vercel during the documentation review. See [project summary](PROJECT_SUMMARY.md) for decisions and implementation limits.

## Current branch and research status — November 4, 2026

- `v0.5.0-pwa` is the current development branch for PWA installability and mobile shell refinements. The latest Vercel build is a ready preview; no production promotion or merge has occurred.
- The branch is based on `v0.4.4-denial-next-steps` at `d1ef5bc`. The default branch still contains the original v0 prototype, and `main` remains the v0.4.3 application baseline.
- The v0.4.3 formative-test baseline and its documented scenarios remain unchanged. Do not assume the v0.5.0 preview has been used for human research.
- See [v0.5.0 PWA implementation and QA](PWA_V0.5.0.md) for implementation details, preview checks, and remaining device-level validation.

## Patch sequence

Version numbers follow first known successful preview publication dates, not the previous spreadsheet row order. The v0.3 sequence is handoff refinements, appointments/localization, then the auth/account follow-on. The v0.1 branches are ordered by their Oct 17 publication times. The v0.2.1, v0.4.1, and v0.4.2 rows each group snapshots from their branch family rather than incrementing the patch for every deployment. The v0.4.2 patch was assigned after the first successful preview from the referral-details layout branch. The v0.4.3 patch records the dashboard-page separation built from that branch.

## Canonical branch naming

Use the canonical branches in the table for ongoing work. The v0.4.2 branch keeps its `v0.4-` exploratory name; the patch number is recorded separately after its first successful preview. The dashboard-page build uses the canonical branch `v0.4.3-dashboard-pages`. Denial and redirection guidance is prototyped on `v0.4.4-denial-next-steps`. Earlier source refs remain available for historical previews and commit provenance. The v0.1.2 branch is a snapshot at its recorded v0.1 main-branch commit; it does not rename or repoint the current `main` branch.

The connected GitHub actions can create and update branches but do not provide a branch-rename/delete operation. Canonical versioned branches were created from the documented source snapshots or branch heads; old refs remain intact.

## Preview tracking

Fixed Vercel deployment URLs and commit SHAs identify historical snapshots. The branch alias can move as the canonical branch advances. The private **Version Links** project record tracks both in descending **Build created (Pacific)** order. Decision-log entries stay at the broader v0.1 label when the historical record does not identify which of its two branch snapshots the decision belonged to.
