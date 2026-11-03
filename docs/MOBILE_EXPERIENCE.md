# Mobile experience iteration — November 2, 2026

Working branch: `codex/mobile-referral-experience`, based on v0.4.4 commit `0f408bf`.

## Implemented

- Account creation asks for name, email, then password, with progress and Back. Sign-in remains a single screen. Values remain in memory when going back.
- Referral creation and editing use one question per step. Optional office/date details can be left unknown. Existing office names are selectable buttons, with free text for new names.
- Review allows returning directly to a question before saving. Enter on intermediate questions advances rather than saving early.
- Mobile dashboard removes decorative artwork and improves card, source-label, summary, and callout wrapping. Inputs use 16px type and 48px height; referral navigation stays near the bottom of the dialog.
- Existing patient-entered status and persistence logic is retained. No new external actions or medical recommendations.

## Verification and remaining work

Production build passes. Lint completes with existing warnings outside the new wizard. Browser verification could not run because the browser control service returned `browser.user is unavailable` even for a state read. No claim of completed visual or authenticated persistence validation.

Before release, check 320/390/768px widths and desktop; keyboard-only traversal; empty specialty validation; Back retaining values; unknown optional values; review edits; create and edit saves; signup confirmation/error recovery; zoom and long translated labels. Verify signed-in dashboard layout and account isolation against a configured test environment. New wizard copy currently follows existing English-only form copy; localization remains to be completed.

This is an initial implementation, not a usability-validated release. No production deployment performed.

## Navigation and readability refinements

- Mobile bottom navigation exposes Overview, My Referrals, and Next Steps with a current-page highlight and safe-area spacing.
- Mobile header keeps the shared gold logo and serif wordmark, with consistent Help and Settings buttons. Sign out is also available in Settings.
- Below 480px, summary cards use full-width rows and next-step/toolkit descriptions receive more reading space.
- Local Supabase configuration was verified against the auth settings endpoint; its settings file is ignored by Git. Authenticated persistence and visual browser QA remain unverified.

## Integration and targeted QA — November 2, 2026

Merged through source commit 6f030a7 into canonical v0.4.4-denial-next-steps. Browser control later became available: no dashboard horizontal overflow at 320/360/390/768px; footer bottom at 511.7px remains above dock top at 547.9px in a 360 × 640 viewport after scrolling to the bottom. Includes full-width mobile welcome heading. Earlier unavailable-browser notes describe the initial QA pass only. No human usability or full persistence validation is claimed.
