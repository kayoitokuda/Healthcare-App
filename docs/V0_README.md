# Historical v0 documentation

Archived October 29, 2026. The text below describes the original prototype only. Its send/upload actions were simulations and its AI language did not establish a live AI integration. For current behavior, use the [latest project documentation](https://github.com/kayoitokuda/Healthcare-App/tree/v0.4.4-denial-next-steps).

# Referral Navigator

A mobile-first, interactive prototype of **Referral Navigator** — a patient-facing
experience embedded inside a healthcare portal that translates internal referral
statuses into plain language, so patients always know where their referral stands,
what's happening next, and what (if anything) they need to do.

## Scenario

Maya Chen's dentist (Bayview Dental) referred her to an oral surgeon (Peninsula Oral
Surgery) to evaluate a possible failing dental implant. The specialist's office
received the referral but can't complete its review because Maya's latest dental
X-ray is missing. Referral Navigator shows Maya exactly where things stand, that the
issue is marked routine (not urgent) by her dentist, and gives her one clear
recommended next step — with an AI-drafted follow-up message she can review and send.

## Running it

```bash
npm install
npm run dev
```

Open the printed local URL. The layout is optimized for a ~390px mobile viewport and
is also responsive on desktop.

```bash
npm run build    # production build
npm run preview  # preview the production build
npm run lint      # oxlint
```

## Flow

1. **Dashboard** (`/`) — greeting + a list of active referrals, including the oral
   surgery referral ("Action needed") and a completed physical therapy referral.
2. **Referral details & timeline** (`/referral/:id`) — a six-step vertical timeline
   (requested → sent → received → specialist review → ready to schedule →
   appointment completed), with the paused step called out and a clinical-urgency
   note that's clearly attributed to the referring provider, not the app.
3. **Action needed** — one primary recommended action plus three ways to follow up:
   send a prepared message (primary), call the referring office, or upload a document
   yourself.
4. **AI-assisted message** (`/referral/:id/message`) — an editable, AI-drafted
   message labeled "Drafted with AI. Review before sending," followed by a
   confirmation screen (`/referral/:id/confirmation`) with the sent time, expected
   response window, and a reminder date.
5. **Get help** (`/help`) — office contacts and hours, a "what does this status
   mean?" glossary, a way to report incorrect information, an emergency disclaimer,
   and a "Prototype assumptions" note.

## Notes

- All data is fictional and lives in `src/data/referrals.ts`; there's no backend or
  authentication. Sending a message or uploading a file updates local React state
  only, via `src/data/ReferralsContext.tsx`.
- Built with React, TypeScript, Vite, Tailwind CSS, React Router, and
  [lucide-react](https://lucide.dev) for icons.
- Status is always communicated with an icon + text label, not color alone, and
  interactive targets are sized for touch (44×44px minimum) per WCAG 2.2 AA.
