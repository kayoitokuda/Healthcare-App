# Referral update: rehearsal notes

An animated hero of Referral Navigator (the v0.4.4 product), 720 × 400 with a 358 × 350 compact design.

**Story (about 14 s, looping).** On the Oral surgery referral, the patient clicks *Record an update* in the Up next card. They type what the office told them ("Office said they faxed it today"), mark *Referral sent*, attribute it to *Referring office*, and save. The new event drops into the journey above the recommendation. The status pill rolls from *Not confirmed yet* to *Sent · awaiting receipt*, and Up next rolls to *Confirm the specialist received it*. The main column fades out and back for the reset, so nothing rewinds in view.

**Gold copied.** `hero-demo` (corner bleed, named targets, script structure). Its dialog-over-receded-window pattern was adapted to match the real app's modal.

**What changed from the gold.** The look is mapped from the live v0.4.4 app's computed styles: Source Sans, accent `#3d5bc7`, warm `#f6f5f1` page, white cards, the gold heart-handshake mark and lucide icons. The window is plain because the product's own sidebar carries the brand. The compact design drops the sidebar, the call-script button and the quoted note, so the event and its source tag stay whole.

**Checks.** The `film.mjs --gate` loop passes at 1280 and 390. At 1280 it prints no lines; at 390 it notes a 300 ms dip during the reset fade (no sidebar in compact). Remaining notes are the Field's per-character growth while typing. Coverage was "inconclusive" because this container dropped sampling frames.

**Not checked.** Dark theme (the product has none). Real Source Sans webfonts (the stage falls back to Arial like the app does without them). Reduced-motion poster on a real device. The fresh-eye review in `references/review.md` was not run by a second reviewer.

**Exports.** `demos/referral-update.mp4` (two loops at 2×) and `demos/referral-update-poster.png` at the repo root.
