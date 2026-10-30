# Referral Navigator

**A patient-owned web companion for tracking specialist referrals, understanding what is still unclear, and preparing the next conversation with an office.**

Patients record events, dates, and information sources, review their referral journey, and prepare editable communication drafts. The app does not connect to clinic systems, independently verify status or insurance, or send messages.

## Start with the current project

This repository's default branch, `claude/youthful-volta-ragd1z`, contains the **historical v0 application**. Its portal-embedded concept and fixed timeline are not the current product direction. Documentation refreshed October 29, 2026.

- [Latest implementation: v0.4.4](https://github.com/kayoitokuda/Healthcare-App/tree/v0.4.4-denial-next-steps)
- [Current project summary and decision status](https://github.com/kayoitokuda/Healthcare-App/blob/v0.4.4-denial-next-steps/docs/PROJECT_SUMMARY.md)
- [Current README and running instructions](https://github.com/kayoitokuda/Healthcare-App/blob/v0.4.4-denial-next-steps/README.md)
- [Version history](https://github.com/kayoitokuda/Healthcare-App/blob/v0.4.4-denial-next-steps/docs/VERSION_HISTORY.md)
- [Current Supabase setup](https://github.com/kayoitokuda/Healthcare-App/blob/v0.4.4-denial-next-steps/SUPABASE_SETUP.md)

The latest branch adds denial/redirection follow-up context. The application on `main` remains v0.4.3, which is also the planned formative-test baseline. Tests are not recorded as started. Updating this homepage does not change either application's code or switch the default branch.

To work on the current implementation after cloning:

```bash
git switch v0.4.4-denial-next-steps
```

Then follow that branch's setup instructions. Current direction: a flexible patient-recorded journey, separate Overview / My Referrals / Next Steps views, account persistence, multilingual UI, and contextual rule-based drafts. Reminders and generative AI assistance remain proposals.

## Historical v0

The original prototype remains in this branch for provenance. [Archived v0 README](docs/V0_README.md) describes that snapshot only; its simulated AI/send/upload behavior and lack of authentication must not be read as current capabilities.
