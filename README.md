# Referral Navigator

**A patient-owned web companion for tracking specialist referrals, understanding what is still unclear, and preparing the next conversation with an office.**

Patients record what happened, when it happened, and who shared the information. A combined referral journey keeps common handoff checkpoints and additional care events together. Editable call scripts, portal messages, and email drafts help patients follow up using the information they recorded.

This is an independent research prototype. It does not connect to clinic referral systems, send messages, verify insurance coverage, or independently confirm referral status. An office-attributed update is still entered by the patient. Adding a referral does not send it; logging contact does not prove that an office acted.

## November 2, 2026 — v0.4.4 mobile integration

The canonical `v0.4.4-denial-next-steps` branch now includes `codex/mobile-referral-experience` through source commit `6f030a7`. This remains v0.4.4; the mobile branch is an implementation branch within that version family, not a new numbered release. GitHub `main` remains the v0.4.3 application baseline.

- Guided account creation and referral entry, optional unknown details, reusable office selections, and review/edit before saving.
- Mobile bottom navigation, consistent gold logo and serif wordmark, compact Help/Settings controls, and sign-out in Settings.
- Full-width welcome heading, readable small-screen cards, horizontal overflow corrections, and measured bottom-navigation clearance.
- The inherited October 31 changes also include office-name suggestions, newest-first journey entries, and multi-event update selection.

Validation: production build passes. Browser checks confirmed no dashboard horizontal overflow at 320/360/390/768px and bottom-content clearance at 360 × 640. Lint retains existing warnings. Signup, persistence, account isolation, translation completeness, keyboard/device behavior, and human usability still need validation. The frozen v0.4.3 research baseline is unchanged.

See [mobile implementation notes](docs/MOBILE_EXPERIENCE.md). Fixed deployment snapshots and commit SHAs are tracked in the [Version Links spreadsheet](https://docs.google.com/spreadsheets/d/1g27l9rXK3zXs8UKRjBesg1XGpoZttiBm131HEvv1XRA/edit#gid=111403025).

## Earlier project status — October 29, 2026

| Reference | Meaning |
| --- | --- |
| [`v0.4.4-denial-next-steps`](https://github.com/kayoitokuda/Healthcare-App/tree/v0.4.4-denial-next-steps) | Latest implementation branch inspected: optional denial/redirection questions and tailored administrative follow-up suggestions |
| [`main`](https://github.com/kayoitokuda/Healthcare-App/tree/main) / `v0.4.3-dashboard-pages` | v0.4.3 application baseline; v0.4.4 application changes are not merged into main |
| `claude/youthful-volta-ragd1z` | Original v0 code and GitHub default branch at this audit; do not assume the default checkout is the latest app |
| [Fixed v0.4.3 test preview](https://referral-navigator-94dxl0ja0-kayoitokudas-projects.vercel.app) | Planned formative-test baseline; tests remain not started in the research record |

Documentation describes the current direction and labels branch-specific implementation. A newer branch does not silently replace a frozen test baseline. See [project summary and decisions](docs/PROJECT_SUMMARY.md) and [version history](docs/VERSION_HISTORY.md).

## Current experience

1. **Public landing page → sign in or create account → dashboard.** Supabase supplies email/password authentication and account-scoped referral storage.
2. **Overview, My Referrals, and Next Steps.** Separate views support orientation, managing referrals, and finding follow-up actions across referrals. How it works remains lightweight help; Settings includes language preference.
3. **Referral journey.** Common checkpoints and patient-recorded events share one chronology. Records requests, additional imaging, visits, procedures, and follow-up can continue beyond appointment scheduling. This does not constitute an automated clinical workflow or a fully validated branching model.
4. **Record what you know.** Updates carry a source and dates. Multiple common milestones can be recorded together when the same source confirmed them; multiple common events can also be selected together.
5. **Prepare and review communication.** Drafts use deterministic templates and keyword/context rules, not a live generative AI service. Patients copy, review, and communicate outside the app, then separately record contact attempts.
6. **v0.4.4 follow-up context.** Specialist decline, insurance authorization denial, and referral redirection have optional reason/next-step questions. Suggestions help patients ask an office or health plan for clarification; they do not determine eligibility, coverage, medical necessity, or appeal outcomes.

The interface includes English, Japanese, Chinese, Spanish, and Vietnamese options. Translation quality, accessibility, and independent usability remain validation work, not established compliance or outcome claims.

## Run the current implementation

After cloning, select the intended branch explicitly:

```bash
git switch v0.4.4-denial-next-steps
npm ci
cp .env.example .env.local
# Fill in the Supabase project URL and publishable key before signing in.
npm run dev
```

Follow [Supabase setup](SUPABASE_SETUP.md) for the migration and account configuration. Without Supabase configuration, the public landing page is available, but there is no working anonymous dashboard fallback in the active application.

```bash
npm run build    # TypeScript check and Vite production build
npm run preview  # Serve the production build locally
npm run lint     # oxlint
```

## Code orientation

- `src/main.tsx` mounts `src/App.tsx`, which contains the active views, referral model, event rules, drafts, and persistence effects. Dashboard navigation uses component state rather than the original URL-route flow.
- `src/auth/AuthContext.tsx`, `src/pages/SignIn.tsx`, and `src/lib/supabase.ts` handle authentication and client configuration.
- `src/i18n.tsx` contains language handling and draft localization; `src/index.css` contains the current styling.
- `supabase/migrations/20261024000000_initial_schema.sql` defines the starter schema and owner-based row-level-security policies.
- The earlier `src/pages/MessageComposer.tsx`, `src/data/ReferralsContext.tsx`, and `src/types.ts` are legacy prototype code, not the active app model. Their AI/send-message language and demo flag must not be used to describe current capabilities.

Built with React, TypeScript, Vite, Tailwind CSS, and Lucide icons. React Router remains a dependency for legacy components.

## Research and next milestone

Exploratory evaluation informed flexible event recording, readable multilingual content, and contextual drafts. Effectiveness and independent task success remain unvalidated.

The current process is **scope → build → QA → freeze → test → synthesize → iterate**. The planned v0.4.3 scenarios are S01 (straightforward referral), S03 (missing records), and S09 (complex multi-specialist journey). Do not report them as executed or replace their baseline without a recorded decision. See the [summary](docs/PROJECT_SUMMARY.md) for open hypotheses and remaining work.
