# Referral Navigator version history

Version labels follow the first known successful Vercel preview publication timestamps in the Referral Navigator spreadsheet’s **Version Links** tab. Patch numbering is chronological; deployment records are displayed newest to oldest.

| Version | Scope | First known preview publication (Pacific) | Canonical branch | Historical source branch |
| --- | --- | --- | --- | --- |
| v0.3.1 | Handoff refinements | Oct 23, 2026, 11:46 a.m. | `v0.3.1-handoff-refinements` | `v0.3-handoff-refinements` |
| v0.3.2 | Appointments and localization | Oct 23, 2026, 2:26 p.m. | `v0.3.2-appointments-localized` | `v0.3-appointments-localized` |
| v0.3.3 | Supabase sign-in/account follow-on | Oct 24, 2026, 2:20 p.m. | `v0.3.3-auth-account-follow-on` | `codex/supabase-auth-foundation` |
| v0.4 | Research-informed referral-flow iteration | Oct 24, 2026, 11:46 p.m. | `v0.4-research-informed-referral-flow` | `codex/v0.4-research-informed-referral-flow` |

Use the canonical version-prefixed branches for ongoing work. Historical source refs are retained so existing previews and commit history remain traceable. Later snapshots on one branch keep that version label; a new version is assigned when a distinct build line is selected, not for every deployment.

The connected GitHub actions can create and update branches but do not provide branch rename/delete. Versioned canonical branches were created from the latest known successful source commits; this is an explicit predecessor-to-canonical mapping, not a destructive rename.

The spreadsheet’s **Version Links** tab preserves fixed deployment URLs and commit SHAs; its branch alias column reflects the moving branch preview.