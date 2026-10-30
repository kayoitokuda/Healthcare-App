# Referral Navigator — project summary and decision status

Updated October 29, 2026. Reconciled with project decisions, planned validation, and repository code at v0.4.4 commit `3ca5b82120358c8d72c2e1117b762542af960b6b`.

## Purpose and scope

Referral Navigator helps patients keep a personal record of specialist referrals across offices: what happened, what is unknown, who shared an update, and what to ask next. It supports remembering and preparing administrative follow-up. It does not have a live view into office systems, send referrals or messages, book appointments, verify coverage, or make clinical decisions.

The original v0 portal-embedded concept and fixed six-step timeline are historical. The adopted direction is a standalone, patient-owned companion with a flexible dated journey and reviewable communication drafts. Care can repeat, branch, and continue after scheduling or a visit; appointment scheduling is not a universal end state.

## Decisions and implementation status

| Decision | Current implementation / limit |
| --- | --- |
| Preserve patient ownership and uncertainty | Users enter updates and attribute them to themselves, an office, or a health plan. Attribution does not mean the app verified the source. Contact attempts do not advance confirmed handoff status. |
| Combine handoff checkpoints and event history | Implemented in the v0.4.2 lineage and carried forward. The current journey still displays oldest events first; reversing chronology and improving next-action placement remain backlog decisions. |
| Separate Overview, My Referrals, and Next Steps | Implemented in v0.4.3. Whether patients understand these destinations as distinct remains an IA hypothesis. How it works is lightweight help. |
| Support account return visits | Supabase authentication and referral persistence code are present. Live persistence, failure recovery, and cross-account isolation have not been validated by this documentation audit. |
| Contextual, editable communication drafts | Implemented with templates, rules, and keyword matching. No live generative model or automated outreach. |
| Separate specialist acceptance from insurance authorization | v0.4.4 includes distinct specialist-decline, insurance-denial, and redirection events with optional reason and suggested-next-step context. This is clarification support, not resolution of insurance barriers. |
| Reduce repetitive recording | Multiple common milestones can be selected together when attributed to the same source. Multiple common events cannot yet be selected together; the broader backlog request is only partially addressed. |
| Keep referral management distinct from history editing | Referral details editing, archive/restore, and confirmed deletion exist. Editing/deleting/archiving individual history events remains backlog work. |
| Support multilingual use | English, Japanese, Chinese, Spanish, and Vietnamese options exist. Native-language comprehension, complete localization, and accessibility still need validation. |

The historical minimal handoff vocabulary (Not sent, Received, Awaiting records, Declined by specialist, Ready to schedule) explains an earlier design decision. It is not an exact current data schema: the active app models milestones plus dated events, including appointment scheduled and subsequent care steps.

## Latest iteration versus test baseline

- **v0.4.4** is the latest inspected implementation branch. It adds optional denial/redirection questions, rule-based possible next steps, contextual drafts, and a prominent Overview add-referral action. Source inspection confirms code exists; it does not establish usability or live-deployment correctness.
- **v0.4.3** remains the documented formative-test baseline and the application code on `main`. The fixed preview is [here](https://referral-navigator-94dxl0ja0-kayoitokudas-projects.vercel.app).
- **Testing status:** the plan records S01, S03, and S09 as not started. The latest branch does not retroactively change this baseline. Record an explicit scope/build decision before testing another version.
- **Default-branch caveat:** GitHub's default branch at audit is `claude/youthful-volta-ragd1z`, containing v0 application code. Select the intended version explicitly. Historical code branches remain historical even if their documentation links point to current project context.

## Evidence boundaries

Exploratory evaluation informed simpler event recording, a nonlinear journey, clearer multilingual content, and contextual drafts. These design directions remain subject to further validation. Source inspection establishes that a feature exists in code, not that patients can understand or benefit from it. No task-success percentages, clinical outcomes, or effectiveness claims are established here.

Detailed research records are maintained separately from this public repository.

## Remaining backlog and hypotheses

Preserve the priorities recorded in the Design Judgment Log; scope them before implementing a new release.

- **P0:** office-name suggestions and consistent office details; reverse journey chronology/reconsider next-action placement; support multiple relevant common events per update. Multiple milestones already work, but this does not complete the multi-event request.
- **P1:** revise, delete, or archive individual history events without confusing the historical record.
- **P2:** explore follow-up reminders and more capable draft assistance. Neither is an implemented or validated capability.

A reminder can refer to a patient-selected follow-up date or time since the last *recorded* update. It cannot infer that a clinic is medically late or inactive. Channel, timing, snooze, dismissal, and suppression rules remain undecided. Live AI draft assistance likewise remains a proposal.

The broader “What do you know?” framing across handoff, insurance, and approval is a design direction. v0.4.4 implements optional outcome-specific questions, not a complete coverage/authorization assessment.

Open validation questions include: understanding reported versus unknown facts; finding history and next actions in the combined journey; discovering and editing relevant drafts; representing repeated/branching care; distinguishing acceptance from authorization; navigating the three dashboard views; low-effort recording; and multilingual readability. Full accessibility conformance and patient benefit are not established.

## Bounded next milestone

Follow **scope → build → QA → freeze → test → synthesize → iterate**. Finish the JTBD/journey/flow/IA audit, resolve structural blockers, and freeze the exact build before running the three scoped scenarios: S01 straightforward referral, S03 missing records, and S09 complex multi-specialist care. Automated scenarios can reveal defects and unsupported transitions; human research must evaluate comprehension and usefulness.

Then conduct focused human testing, prioritize findings, and complete one evidence-led iteration for the case study. Keep new features in the backlog instead of extending the project indefinitely.

## Documentation maintenance

- [Version history](VERSION_HISTORY.md)
- [Setup and persistence boundaries](../SUPABASE_SETUP.md)

Detailed decision records, scenario plans, research reports, and deployment tracking are maintained separately. When an iteration changes scope, update this summary, README, and version history together. Record the branch and exact test deployment separately. Describe implemented behavior from active code, adopted intent from decisions, and validated outcomes only from executed studies. Retain historical branches rather than rewriting earlier decisions as though they were known from the start.
