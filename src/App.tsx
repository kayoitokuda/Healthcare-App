import { LanguageToggle, localizedDraft, translateText, useAppLanguage } from "./i18n";
import {
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type ReactNode,
  type RefObject,
} from "react";
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  Check,
  CheckCircle2,
  CircleHelp,
  ClipboardList,
  Copy,
  FileText,
  HeartHandshake,
  Home,
  Menu,
  MessageCircle,
  Phone,
  Plus,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  X,
} from "lucide-react";

type Source = "You" | "Referring office" | "Specialist office" | "Health plan";
type Milestone =
  | "referral-not-sent"
  | "referral-sent"
  | "referral-received"
  | "awaiting-records"
  | "declined-by-specialist"
  | "ready-to-schedule"
  | "appointment-scheduled"
  | "appointment-completed";
type CoverageUpdate = "authorization-required" | "out-of-network" | "coverage-confirmed";
type UpdateCertainty = "confirmed" | "possible";
type RecordsOwner = "Referring office" | "Specialist office" | "You" | "Not sure";
type HandoffState = Milestone | "status-not-confirmed";
type Update = {
  id: number;
  title: string;
  detail: string;
  date: string;
  source: Source;
  milestone?: Milestone;
  coverageUpdate?: CoverageUpdate;
  certainty?: UpdateCertainty;
  missingItem?: string;
  recordsOwner?: RecordsOwner;
  readyConfirmed?: boolean;
  appointmentDate?: string;
  appointmentTime?: string;
};
type Referral = {
  id: number;
  specialty: string;
  from: string;
  to: string;
  date: string;
  updates: Update[];
  done: string[];
  notes: string;
};

const today = new Date().toLocaleDateString("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
});
const initial: Referral[] = [
  {
    id: 1,
    specialty: "Oral surgery",
    from: "Bayview Dental",
    to: "Peninsula Oral Surgery",
    date: "Sep 10, 2026",
    updates: [
      {
        id: 1,
        title: "Specialist recommended",
        detail: "Dr. Chen recommended an oral surgery consultation.",
        date: "Sep 10, 2026",
        source: "You",
      },
      {
        id: 2,
        title: "Referral added to your tracker",
        detail: "You added the details you had from your visit.",
        date: "Sep 10, 2026",
        source: "You",
      },
      {
        id: 3,
        title: "Referring office says it was sent",
        detail: "Bayview Dental told me they sent the referral to Peninsula Oral Surgery.",
        date: "Sep 11, 2026",
        source: "Referring office",
        milestone: "referral-sent",
      },
      {
        id: 4,
        title: "Specialist office confirmed receipt",
        detail: "Peninsula Oral Surgery confirmed receipt and opened the referral for review.",
        date: "Sep 12, 2026",
        source: "Specialist office",
        milestone: "referral-received",
      },
      {
        id: 5,
        title: "Specialist office requested an X-ray",
        detail: "Peninsula Oral Surgery said they still need the latest dental X-ray before they can review it.",
        date: "Sep 12, 2026",
        source: "Specialist office",
        milestone: "awaiting-records",
        missingItem: "latest dental X-ray",
        recordsOwner: "Referring office",
      },
    ],
    done: [],
    notes: "",
  },
];

const steps = [
  { title: "Recommendation", copy: "A clinician suggests specialist care" },
  { title: "Referral sent", copy: "Confirm the referring office sent it" },
  { title: "Receipt confirmed", copy: "The specialist office confirms arrival" },
  { title: "Specialist review & records", copy: "Resolve requested information before review" },
  { title: "Ready to schedule", copy: "Only after the specialist confirms review is complete" },
  { title: "Appointment scheduled", copy: "Record the date once you’ve booked with the office" },
  { title: "Appointment completed", copy: "After the visit, record any next steps you were given" },
];

type AgentInsight = {
  signal: "Possible hold-up" | "Next step" | "Specialist response needed" | "Ready to schedule" | "Appointment scheduled" | "Appointment completed";
  headline: string;
  detail: string;
  action: string;
  rationale: string;
  recipient: string;
  question: string;
};

function latestHandoffUpdate(referral: Referral) {
  return [...referral.updates].reverse().find((update) => update.milestone);
}

function getHandoffState(referral: Referral): HandoffState {
  const updates = referral.updates;
  const handoffIndex = lastMatchingIndex(updates, (update) => Boolean(update.milestone));
  const blockerIndex = lastMatchingIndex(updates, isRecordBlocker);
  if (blockerIndex > handoffIndex) {
    const blocker = updates[blockerIndex];
    return isPossibleDecline(blocker) && !missingItemFor(blocker)
      ? "declined-by-specialist"
      : "awaiting-records";
  }
  return latestHandoffUpdate(referral)?.milestone ?? "status-not-confirmed";
}

function latestStatusUpdate(referral: Referral) {
  return [...referral.updates].reverse().find((update) => update.milestone || isRecordBlocker(update));
}

function handoffLabel(state: HandoffState, update?: Update) {
  if (state === "status-not-confirmed") return "Status not confirmed";
  if (state === "referral-not-sent") return "Not sent";
  if (state === "referral-sent") return "Sent · awaiting receipt";
  if (state === "referral-received") return "Received";
  if (state === "awaiting-records") return "Awaiting records";
  if (state === "declined-by-specialist") {
    return update?.certainty === "possible" || (update ? isPossibleDecline(update) : false)
      ? "Possible specialist decline"
      : "Declined by specialist";
  }
  if (state === "appointment-scheduled") return "Appointment scheduled";
  if (state === "appointment-completed") return "Appointment completed";
  return "Ready to schedule";
}

function coverageLabel(update: CoverageUpdate) {
  if (update === "authorization-required") return "Authorization required";
  if (update === "out-of-network") return "Possible out-of-network issue";
  return "Coverage confirmed";
}

function isPossibleDecline(update: Update) {
  return update.certainty === "possible" ||
    /may be declined|might be declined|could be declined|possible decline/i.test(update.detail);
}

function isRecordBlocker(update: Update) {
  return update.milestone === "awaiting-records" ||
    /missing|still need|needs? (?:the |a |an )?|waiting for|awaiting|cannot review|can't review|cannot complete|can't complete|declined? unless|may be declined|might be declined|could be declined|(?:specialist|office|they).{0,40}declined|declined.{0,40}referral|x-?ray.{0,35}(?:required|needed|included|missing)/i.test(update.detail);
}

function missingItemFor(update: Update) {
  if (update.missingItem?.trim()) return update.missingItem.trim();
  const match =
    update.detail.match(/(?:still )?need(?:s)?\s+(?:the |a |an |my )?([^,.;]+)/i) ||
    update.detail.match(/(?:missing|waiting for|awaiting)\s+(?:the |a |an |my )?([^,.;]+)/i) ||
    update.detail.match(/unless\s+(?:the |a |an |my )?([^,.;]+)/i);
  return match?.[1]
    ?.replace(/\s+(?:before|so they|so it|to review|for review|is included|included|required).*$/i, "")
    .trim();
}

function lastMatchingIndex(updates: Update[], predicate: (update: Update) => boolean) {
  for (let i = updates.length - 1; i >= 0; i -= 1) {
    if (predicate(updates[i])) return i;
  }
  return -1;
}

function referralAgentInsight(referral: Referral): AgentInsight {
  const latestHandoffIndex = lastMatchingIndex(referral.updates, (update) => Boolean(update.milestone));
  const latestBlockerIndex = lastMatchingIndex(referral.updates, isRecordBlocker);
  const blocker = latestBlockerIndex >= 0 ? referral.updates[latestBlockerIndex] : undefined;
  const currentHandoff = latestHandoffUpdate(referral);
  const currentState = getHandoffState(referral);

  if (currentState === "declined-by-specialist" && currentHandoff?.milestone === "declined-by-specialist") {
    const possible = currentHandoff.certainty === "possible";
    return {
      signal: possible ? "Possible hold-up" : "Specialist response needed",
      headline: possible ? "The specialist may decline this referral." : "The specialist office declined the referral.",
      detail: currentHandoff.detail,
      action: possible
        ? `Ask ${referral.to} what is needed to avoid a decline and whether the decision is final.`
        : `Ask ${referral.to} to clarify the reason and what options, if any, are available.`,
      rationale: "This is based on the specialist-office update you recorded; the app cannot verify it.",
      recipient: referral.to,
      question: possible
        ? `I recorded that my referral may be declined. What information is needed, and has a final decision been made?`
        : `I recorded that my referral was declined. Could you explain the reason and any next steps I should discuss with my referring office?`,
    };
  }

  if (blocker && (currentState === "awaiting-records" || currentState === "declined-by-specialist" || latestBlockerIndex >= latestHandoffIndex)) {
    const item = missingItemFor(blocker);
    const possibleDecline = isPossibleDecline(blocker);
    const owner = blocker.recordsOwner ?? "Not sure";
    const recipient = owner === "Referring office"
      ? referral.from
      : owner === "Specialist office"
        ? referral.to
        : owner === "You"
          ? "you"
          : referral.to;
    const action = owner === "Not sure"
      ? `Ask ${referral.to} what is missing and which office should provide it.`
      : owner === "You"
        ? `Check whether you have a copy of ${item || "the requested record"} and ask ${referral.to} how to provide it.`
        : item
          ? `Ask ${recipient} to provide ${item} to ${owner === "Referring office" ? referral.to : referral.from}.`
          : `Ask ${recipient} what is needed and who should provide it.`;
    const reportedBy = blocker.source === "You"
      ? "My note says"
      : `${blocker.source} said`;
    const question = owner === "Not sure"
      ? `${reportedBy} ${item || "a record"} may be needed${possibleDecline ? " to prevent a possible decline" : ""}. Which item is required, and who should send it?`
      : item
        ? `${reportedBy} ${item} is needed${possibleDecline ? " and the referral may be declined without it" : ""}. Could you let me know how it should be provided and confirm once that is done?`
        : `Could you clarify what is still needed for my referral and who should provide it?`;
    return {
      signal: possibleDecline ? "Possible hold-up" : "Specialist response needed",
      headline: possibleDecline
        ? "The referral may be declined unless a record is provided."
        : item ? `${item} may be needed before review.` : "A record may be needed before review.",
      detail: blocker.detail,
      action,
      rationale: blocker.source === "You"
        ? "Based on your latest note. The app has not verified this with an office."
        : `Based on your note from the ${blocker.source.toLowerCase()}; confirm who owns the next step.`,
      recipient,
      question,
    };
  }

  if (currentState === "referral-not-sent") {
    return {
      signal: "Next step",
      headline: "The referral has not been sent yet.",
      detail: currentHandoff?.detail || "You recorded that the referring office has not sent it.",
      action: `Ask ${referral.from} when it can be sent and whether anything is needed from you.`,
      rationale: "Based on the not-sent update you recorded.",
      recipient: referral.from,
      question: `I recorded that my ${referral.specialty} referral has not been sent yet. Is anything needed from me, and when do you expect to send it to ${referral.to}?`,
    };
  }
  if (currentState === "status-not-confirmed") {
    return {
      signal: "Next step",
      headline: "Referral status is not confirmed yet.",
      detail: "Your tracker does not yet say whether the referral was sent.",
      action: `Ask ${referral.from} whether the referral was sent to ${referral.to}.`,
      rationale: "Unknown status stays unknown; it is not treated as proof that the referral was not sent.",
      recipient: referral.from,
      question: `Could you confirm whether you sent my ${referral.specialty} referral to ${referral.to}? If not, is anything needed from me?`,
    };
  }
  if (currentState === "referral-sent") {
    return {
      signal: "Next step",
      headline: "The referral is sent; receipt is not confirmed.",
      detail: "You recorded that the referring office sent it, but there is no specialist-office receipt update.",
      action: `Ask ${referral.to} whether the referral arrived.`,
      rationale: "The latest recorded handoff status is sent, with receipt still unconfirmed.",
      recipient: referral.to,
      question: `Could you confirm whether you received my ${referral.specialty} referral from ${referral.from}, and whether anything else is needed before review?`,
    };
  }
  if (currentState === "referral-received") {
    return {
      signal: "Next step",
      headline: "Receipt is confirmed; review status is still open.",
      detail: "The specialist office confirmed receipt. That does not confirm acceptance or scheduling readiness.",
      action: `Ask ${referral.to} whether the referral is under review and whether any records or other steps are still needed.`,
      rationale: "Receipt is distinct from specialist acceptance and from insurance authorization.",
      recipient: referral.to,
      question: `I recorded that you received my ${referral.specialty} referral. Is it ready for review, and do you need any records or other information before it can proceed?`,
    };
  }
  if (currentState === "appointment-scheduled") {
    const appointment = [...referral.updates].reverse().find((update) => update.milestone === "appointment-scheduled");
    const dateLabel = appointment?.appointmentDate
      ? new Date(`${appointment.appointmentDate}T12:00:00`).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
      : undefined;
    const when = [dateLabel, appointment?.appointmentTime].filter(Boolean).join(" · ");
    return {
      signal: "Appointment scheduled",
      headline: "Your appointment is scheduled.",
      detail: when ? `You recorded an appointment for ${when}.` : "You recorded that an appointment has been scheduled.",
      action: "Keep any preparation instructions from the office handy. After your visit, record any next steps your clinician gives you.",
      rationale: "Based on the appointment update you recorded; the app does not verify the booking.",
      recipient: referral.to,
      question: "Is there anything I should bring or do before my appointment?",
    };
  }
  if (currentState === "appointment-completed") {
    return {
      signal: "Appointment completed",
      headline: "You recorded that the appointment is complete.",
      detail: "Add any follow-up instructions or next appointment your clinician recommended, if there are any.",
      action: "Record the follow-up plan you were given, or add a note if no further step was discussed. The app won’t interpret your care plan.",
      rationale: "Based on your recorded update; this does not indicate a medical outcome.",
      recipient: referral.to,
      question: "Could you clarify the follow-up steps we discussed and when I should complete them?",
    };
  }
  return {
    signal: "Ready to schedule",
    headline: "The specialist confirmed the referral can proceed to scheduling.",
    detail: "You recorded that the specialist can proceed and known records or review steps are complete. Check any insurance requirements separately.",
    action: `Contact ${referral.to} to ask about appointment times.`,
    rationale: "This is based on a specialist-office confirmation you recorded.",
    recipient: referral.to,
    question: `I recorded that my referral is ready to schedule. Could you help me find an appointment time?`,
  };
}

function nextStepFor(referral: Referral) {
  const insight = referralAgentInsight(referral);
  return { title: insight.headline, detail: insight.action };
}

function IconButton({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button className="icon-button" aria-label={label} onClick={onClick}>
      {children}
    </button>
  );
}

function HeaderMenu({
  open,
  menuRef,
  onToggle,
  onHome,
  onAddReferral,
  onHelp,
  referralCount,
}: {
  open: boolean;
  menuRef: RefObject<HTMLDivElement | null>;
  onToggle: () => void;
  onHome: () => void;
  onAddReferral: () => void;
  onHelp: () => void;
  referralCount: number;
}) {
  return (
    <div className="header-menu" ref={menuRef}>
      <button
        type="button"
        className="icon-button menu-trigger"
        aria-label={open ? "Close menu" : "Open menu"}
        aria-expanded={open}
        aria-controls="main-menu-panel"
        onClick={onToggle}
      >
        {open ? <X size={20} /> : <Menu size={20} />}
      </button>
      {open && (
        <div className="menu-panel" id="main-menu-panel">
          <div className="menu-panel-head">
            <span className="menu-eyebrow">REFERRAL NAVIGATOR</span>
            <h2>Quick actions</h2>
            <p>Keep your referral details and follow-ups together.</p>
          </div>
          <nav className="menu-links" aria-label="Quick actions">
            <button className="menu-item" onClick={onHome}>
              <span className="menu-item-icon">
                <ClipboardList size={18} />
              </span>
              <span className="menu-item-copy">
                <strong>My referrals</strong>
                <small>
                  {referralCount} {referralCount === 1 ? "referral" : "referrals"} in your tracker
                </small>
              </span>
              <ArrowRight size={16} />
            </button>
            <button className="menu-item" onClick={onAddReferral}>
              <span className="menu-item-icon">
                <Plus size={18} />
              </span>
              <span className="menu-item-copy">
                <strong>Add a referral</strong>
                <small>Start with what you know</small>
              </span>
              <ArrowRight size={16} />
            </button>
            <button className="menu-item" onClick={onHelp}>
              <span className="menu-item-icon">
                <CircleHelp size={18} />
              </span>
              <span className="menu-item-copy">
                <strong>How it works</strong>
                <small>Learn what this tool can do</small>
              </span>
              <ArrowRight size={16} />
            </button>
          </nav>
          <div className="menu-note">
            <ShieldCheck size={17} />
            <p>
              <strong>You’re in control.</strong> Updates are entered by you;
              referral status isn’t checked automatically.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

function Modal({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: ReactNode;
}) {
  return (
    <div
      className="scrim"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <section
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        <div className="modal-head">
          <h2>{title}</h2>
          <IconButton label="Close" onClick={onClose}>
            <X size={20} />
          </IconButton>
        </div>
        {children}
      </section>
    </div>
  );
}

function LandingPage({ onEnter }: { onEnter: () => void }) {
  return (
    <div className="landing-page">
      <header className="landing-header">
        <button
          type="button"
          className="brand brand-home"
          aria-label="Referral Navigator home"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        >
          <span className="brand-mark">
            <HeartHandshake size={20} />
          </span>
          <span>Referral Navigator</span>
        </button>
        <nav className="landing-nav" aria-label="Main navigation">
          <LanguageToggle />
          <a href="#landing-how-it-works">How it works</a>
        </nav>
      </header>

      <main>
        <section className="landing-hero">
          <div className="landing-hero-copy">
            <span className="landing-label">
              <ShieldCheck size={14} /> A patient-owned referral companion
            </span>
            <p className="eyebrow">FROM RECOMMENDATION TO NEXT STEP</p>
            <h1>Keep your specialist referral moving.</h1>
            <p className="landing-lede">
              The Referral Agent uses updates you enter to flag possible holdups,
              suggest a next step, and prepare a message for you to review.
            </p>
            <div className="landing-actions">
              <button className="primary-button" onClick={onEnter}>
                Explore the sample tracker <ArrowRight size={16} />
              </button>
            </div>
            <p className="landing-reassurance">
              You enter updates yourself. The app doesn’t contact offices or
              check their systems.
            </p>
          </div>

          <div className="landing-preview" aria-label="Example referral progress">
            <div className="landing-preview-top">
              <span className="landing-preview-icon">
                <Stethoscope size={18} />
              </span>
              <span className="status-pill status-amber">
                <span className="status-dot" />
                Still checking
              </span>
            </div>
            <p className="landing-card-eyebrow">YOUR REFERRAL</p>
            <h2>Cardiology</h2>
            <p className="landing-route">Primary care <span>→</span> Heart clinic</p>
            <div className="landing-progress">
              <div className="landing-progress-step is-complete">
                <span className="landing-progress-marker"><Check size={14} /></span>
                <div>
                  <strong>Recommendation</strong>
                  <small>You added this</small>
                </div>
              </div>
              <div className="landing-progress-step is-current">
                <span className="landing-progress-marker">2</span>
                <div>
                  <strong>Referral sent?</strong>
                  <small>Ask the referring office</small>
                </div>
              </div>
              <div className="landing-progress-step">
                <span className="landing-progress-marker">3</span>
                <div>
                  <strong>Received?</strong>
                  <small>Confirm with the specialist</small>
                </div>
              </div>
            </div>
            <div className="landing-preview-note">
              <MessageCircle size={16} />
              <span>Next up: ask whether the referral was sent</span>
              <ArrowRight size={15} />
            </div>
          </div>
        </section>

        <section className="landing-how" id="landing-how-it-works">
          <div className="landing-section-heading">
            <p className="eyebrow">A CLEARER HANDOFF</p>
            <h2>Know what’s confirmed—and what to ask next.</h2>
            <p>
              Referral Navigator helps you keep the details straight while you
              follow up at your own pace.
            </p>
          </div>
          <div className="landing-steps">
            <article className="landing-step">
              <span>01</span>
              <ClipboardList size={20} />
              <h3>Save what you know</h3>
              <p>
                Note the specialist, referring office, and what your clinician
                recommended.
              </p>
            </article>
            <article className="landing-step">
              <span>02</span>
              <MessageCircle size={20} />
              <h3>Follow up with confidence</h3>
              <p>
                See a practical next step and prepare a call script or message
                to review.
              </p>
            </article>
            <article className="landing-step">
              <span>03</span>
              <CheckCircle2 size={20} />
              <h3>Record what you hear</h3>
              <p>
                Add the response and label whether it came from you or an
                office.
              </p>
            </article>
          </div>
        </section>

        <section className="landing-boundary">
          <span className="landing-boundary-icon">
            <ShieldCheck size={19} />
          </span>
          <div>
            <strong>Your tracker is yours to update.</strong>
            <p>
              This tool can’t verify referral status, give medical advice, or
              determine insurance coverage. Confirm details with the relevant
              office or your health plan.
            </p>
          </div>
          
        </section>
      </main>
      <footer className="landing-footer">
        Referral Navigator · A personal referral companion
      </footer>
    </div>
  );
}

function InlineDraftPanel({
  kind,
  draft,
  copied,
  onKindChange,
  onDraftChange,
  onCopy,
  onContact,
  onClose,
}: {
  kind: "Call script" | "Text message" | "Portal message" | "Email";
  draft: string;
  copied: boolean;
  onKindChange: (kind: "Call script" | "Text message" | "Portal message" | "Email") => void;
  onDraftChange: (draft: string) => void;
  onCopy: () => void;
  onContact: () => void;
  onClose: () => void;
}) {
  return (
    <section className="inline-draft section-card" aria-label="Review your follow-up draft">
      <div className="section-title-row">
        <div>
          <p className="eyebrow">REVIEW BEFORE YOU SEND</p>
          <h3>Call script, text or portal message</h3>
        </div>
        <IconButton label="Close draft" onClick={onClose}>
          <X size={18} />
        </IconButton>
      </div>
      <p className="modal-intro">
        The Referral Agent prepares a draft from your latest referral updates. Review and edit it before use; nothing is sent from here.
      </p>
      <div className="segmented">
        {(["Call script", "Text message", "Portal message", "Email"] as const).map((option) => (
          <button
            type="button"
            className={kind === option ? "selected" : ""}
            key={option}
            onClick={() => onKindChange(option)}
          >
            {option}
          </button>
        ))}
      </div>
      <label>
        {kind} draft
        <textarea
          className="draft-area"
          value={draft}
          onChange={(event) => onDraftChange(event.target.value)}
          rows={6}
        />
      </label>
      <div className="inline-draft-actions">
        <button className="primary-button" type="button" onClick={onCopy}>
          {copied ? <Check size={16} /> : <Copy size={16} />}
          {copied ? "Copied to clipboard" : "Copy draft to review"}
        </button>
        <button className="secondary-button" type="button" onClick={onContact}>
          <Phone size={16} /> I contacted an office
        </button>
      </div>
      <p className="helper-note">
        <ShieldCheck size={15} /> You review and send it. Contact attempts are
        logged by you; they don’t confirm the referral was sent or received.
      </p>
    </section>
  );
}

function ReferralAgentCard({
  referral,
  mode,
  reminderDate,
  reminderOpen,
  reminderDraft,
  onPrimary,
  onOpenReminder,
  onReminderDraftChange,
  onSaveReminder,
}: {
  referral: Referral;
  mode: "overview" | "detail";
  reminderDate: string;
  reminderOpen: boolean;
  reminderDraft: string;
  onPrimary: () => void;
  onOpenReminder: () => void;
  onReminderDraftChange: (value: string) => void;
  onSaveReminder: () => void;
}) {
  const insight = referralAgentInsight(referral);
  const reminderLabel = reminderDate
    ? new Date(`${reminderDate}T12:00:00`).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "";

  return (
    <section className="section-card referral-agent-card" aria-label="Referral Agent recommendation">
      <div className="agent-card-heading">
        <span className="agent-icon"><Sparkles size={18} /></span>
        <div>
          <p className="eyebrow">REFERRAL AGENT · PROTOTYPE</p>
          <h2>{insight.headline}</h2>
        </div>
        <span className={`agent-signal ${insight.signal === "Possible hold-up" || insight.signal === "Specialist response needed" ? "agent-signal-warn" : ""}`}>
          {insight.signal}
        </span>
      </div>
      <p className="agent-detail">{insight.detail}</p>
      <div className="agent-suggestion">
        <span>SUGGESTED NEXT STEP</span>
        <strong>{insight.action}</strong>
        <small>{insight.rationale}</small>
      </div>
      <div className="agent-actions">
        <button className="primary-button" type="button" onClick={onPrimary}>
          {mode === "overview" ? "Open referral action plan" : "Draft a text or portal message"}
          <ArrowRight size={15} />
        </button>
        <button className="secondary-button" type="button" onClick={onOpenReminder}>
          <CalendarDays size={15} /> Set a reminder
        </button>
      </div>
      {reminderOpen && (
        <div className="agent-reminder-editor">
          <label>
            Remind me on
            <input
              type="date"
              value={reminderDraft}
              onChange={(event) => onReminderDraftChange(event.target.value)}
            />
          </label>
          <button className="secondary-button" type="button" onClick={onSaveReminder} disabled={!reminderDraft}>
            Save reminder
          </button>
        </div>
      )}
      {reminderLabel && (
        <p className="agent-reminder-saved">
          <CheckCircle2 size={15} /> Follow-up reminder saved for {reminderLabel}
        </p>
      )}
      <details className="agent-explanation">
        <summary>Why is the agent suggesting this?</summary>
        <p>
          It uses only the referral details and updates you entered. It cannot
          check office systems, so confirm the next step with {insight.recipient}.
        </p>
      </details>
      <p className="agent-boundary">
        Prototype suggestions use simple rules. They may miss context and do not
        contact offices or send messages.
      </p>
    </section>
  );
}

export default function App() {
  const { language } = useAppLanguage();
  const [referrals, setReferrals] = useState(initial);
  const [demoMode, setDemoMode] = useState(true);
  const [inlineDraftId, setInlineDraftId] = useState<number | null>(null);
  const [reminderDates, setReminderDates] = useState<Record<number, string>>({});
  const [reminderEditorId, setReminderEditorId] = useState<number | null>(null);
  const [reminderDraft, setReminderDraft] = useState("");
  const [hasEnteredDashboard, setHasEnteredDashboard] = useState(false);
  const [selected, setSelected] = useState<number | null>(null);
  const [modal, setModal] = useState<
    "new" | "update" | "notes" | "help" | null
  >(null);
  const [updateTitle, setUpdateTitle] = useState("");
  const [updateDetail, setUpdateDetail] = useState("");
  const [updateSource, setUpdateSource] = useState<Source>("You");
  const [updateMilestone, setUpdateMilestone] = useState<Milestone | "">("");
  const [updateCoverage, setUpdateCoverage] = useState<CoverageUpdate | "">("");
  const [updateCertainty, setUpdateCertainty] = useState<UpdateCertainty>("confirmed");
  const [updateMissingItem, setUpdateMissingItem] = useState("");
  const [updateRecordsOwner, setUpdateRecordsOwner] = useState<RecordsOwner>("Not sure");
  const [readyConfirmation, setReadyConfirmation] = useState(false);
  const [appointmentDate, setAppointmentDate] = useState("");
  const [appointmentTime, setAppointmentTime] = useState("");
  const [messageKind, setMessageKind] = useState<
    "Call script" | "Text message" | "Portal message" | "Email"
  >("Call script");
  const [messageDraft, setMessageDraft] = useState("");
  const [copied, setCopied] = useState(false);
  const [newSpecialty, setNewSpecialty] = useState("");
  const [newFrom, setNewFrom] = useState("");
  const [newTo, setNewTo] = useState("");
  const [newDate, setNewDate] = useState("");
  const [toast, setToast] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;

    function handlePointerDown(event: PointerEvent) {
      if (
        menuRef.current &&
        event.target instanceof Node &&
        !menuRef.current.contains(event.target)
      ) {
        setMenuOpen(false);
      }
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setMenuOpen(false);
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [menuOpen]);

  const referral =
    referrals.find((item) => item.id === selected) ?? referrals[0];
  const handoffState = referral ? getHandoffState(referral) : "status-not-confirmed";
  const currentHandoff = referral ? latestStatusUpdate(referral) : undefined;
  const status = handoffLabel(handoffState, currentHandoff);
  const agentInsight = referral ? referralAgentInsight(referral) : null;
  const latestCoverage = referral
    ? [...referral.updates].reverse().find((update) => update.coverageUpdate)
    : undefined;
  const receiptConfirmedCount = referrals.filter((item) =>
    item.updates.some(
      (update) =>
        update.milestone === "referral-received" &&
        update.source === "Specialist office",
    ),
  ).length;
  const readyToScheduleCount = referrals.filter(
    (item) => getHandoffState(item) === "ready-to-schedule",
  ).length;
  const followUpCount = referrals.filter(
    (item) => !["ready-to-schedule", "appointment-scheduled", "appointment-completed"].includes(getHandoffState(item)),
  ).length;
  const nextReferral = referrals[0];
  const nextStep = nextReferral ? nextStepFor(nextReferral) : null;
  const latestUpdates = referrals
    .flatMap((item) =>
      item.updates.map((update) => ({ referral: item, update })),
    )
    .sort((a, b) => b.update.id - a.update.id)
    .slice(0, 4);

  function flash(message: string) {
    setToast(message);
    window.setTimeout(() => setToast(""), 2800);
  }

  function addUpdate(title = "", detail = "", source: Source = "You", milestone: Milestone | "" = "") {
    setUpdateTitle(title ? translateText(title, language) : title);
    setUpdateDetail(detail);
    setUpdateSource(source);
    setUpdateMilestone(milestone);
    setUpdateCoverage("");
    setUpdateCertainty("confirmed");
    setUpdateMissingItem("");
    setUpdateRecordsOwner("Not sure");
    setReadyConfirmation(false);
    setAppointmentDate("");
    setAppointmentTime("");
    setModal("update");
  }

  function saveUpdate() {
    if (!referral || !updateTitle.trim()) return;
    if (
      updateMilestone === "ready-to-schedule" &&
      (updateSource !== "Specialist office" || !readyConfirmation)
    ) {
      flash("Record Ready to schedule only after the specialist confirms it can proceed and required records or review are complete.");
      return;
    }
    const update: Update = {
      id: Date.now(),
      title: updateMilestone === "appointment-scheduled"
        ? "Appointment scheduled"
        : updateMilestone === "appointment-completed"
          ? "Appointment completed"
          : updateTitle.trim(),
      detail: updateDetail.trim() || "No additional notes.",
      date: today,
      source: updateSource,
      ...(updateMilestone ? { milestone: updateMilestone } : {}),
      ...(updateCoverage ? { coverageUpdate: updateCoverage } : {}),
      ...(updateMilestone === "declined-by-specialist" ? { certainty: updateCertainty } : {}),
      ...(updateMilestone === "awaiting-records" && updateMissingItem.trim()
        ? { missingItem: updateMissingItem.trim(), recordsOwner: updateRecordsOwner }
        : {}),
      ...(updateMilestone === "ready-to-schedule" ? { readyConfirmed: true } : {}),
      ...(updateMilestone === "appointment-scheduled" && appointmentDate.trim() ? { appointmentDate: appointmentDate.trim() } : {}),
      ...(updateMilestone === "appointment-scheduled" && appointmentTime.trim() ? { appointmentTime: appointmentTime.trim() } : {}),
    };
    setReferrals((all) =>
      all.map((r) =>
        r.id === referral.id ? { ...r, updates: [...r.updates, update] } : r,
      ),
    );
    setModal(null);
    flash("Update added to your referral.");
  }

  function toggleDone(id: string) {
    if (!referral) return;
    setReferrals((all) =>
      all.map((r) =>
        r.id === referral.id
          ? {
              ...r,
              done: r.done.includes(id)
                ? r.done.filter((x) => x !== id)
                : [...r.done, id],
            }
          : r,
      ),
    );
  }

  function startMessage(
    kind: "Call script" | "Text message" | "Portal message" | "Email" = "Call script",
    target: Referral | undefined = referral,
  ) {
    if (!target) return;
    const insight = referralAgentInsight(target);
    setMessageKind(kind);
    setMessageDraft(
      localizedDraft(language, kind, insight.recipient, target.specialty, insight.question),
    );
    setCopied(false);
    setInlineDraftId(target.id);
    setModal(null);
  }

  function logContactAttempt(target: Referral) {
    const insight = referralAgentInsight(target);
    const office = insight.recipient === "you" ? "the office" : insight.recipient;
    const update: Update = {
      id: Date.now(),
      title: `You contacted ${office}`,
      detail:
        "You recorded a contact attempt. The referral status is still unconfirmed; add the office’s response when you have it.",
      date: today,
      source: "You",
    };
    setReferrals((all) =>
      all.map((item) =>
        item.id === target.id
          ? { ...item, updates: [...item.updates, update] }
          : item,
      ),
    );
    setInlineDraftId(null);
    flash("Contact attempt added to your activity. Referral status is unchanged.");
  }

  function openReminder(target: Referral) {
    setReminderEditorId(target.id);
    const suggestedDate = new Date();
    suggestedDate.setDate(suggestedDate.getDate() + 3);
    setReminderDraft(
      reminderDates[target.id] || suggestedDate.toISOString().slice(0, 10),
    );
  }

  function saveReminder(target: Referral) {
    if (!reminderDraft) return;
    setReminderDates((all) => ({ ...all, [target.id]: reminderDraft }));
    setReminderEditorId(null);
    flash("Follow-up reminder saved in this preview.");
  }

  function openNewReferral() {
    if (demoMode) {
      setReferrals([]);
      setDemoMode(false);
    }
    setSelected(null);
    setNewSpecialty("");
    setNewFrom("");
    setNewTo("");
    setNewDate("");
    setModal("new");
  }

  async function copyDraft() {
    try {
      await navigator.clipboard.writeText(messageDraft);
      setCopied(true);
      flash("Draft copied. Review it before sending.");
    } catch {
      setCopied(false);
    }
  }

  function createReferral(e: FormEvent) {
    e.preventDefault();
    if (!newSpecialty.trim()) return;
    const created: Referral = {
      id: Date.now(),
      specialty: newSpecialty.trim(),
      from: newFrom.trim() || "Referring office not added",
      to: newTo.trim() || "Specialist office not added",
      date: newDate
        ? new Date(`${newDate}T12:00:00`).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          })
        : today,
      updates: [
        {
          id: Date.now(),
          title: "Referral added to your tracker",
          detail:
            "You added the details you had. The offices have not been contacted by this app.",
          date: today,
          source: "You",
        },
      ],
      done: [],
      notes: "",
    };
    setReferrals((all) => [created, ...all]);
    setDemoMode(false);
    setInlineDraftId(null);
    setSelected(created.id);
    setModal(null);
    setNewSpecialty("");
    setNewFrom("");
    setNewTo("");
    setNewDate("");
    flash("Referral added.");
  }

  if (!hasEnteredDashboard)
    return <LandingPage onEnter={() => setHasEnteredDashboard(true)} />;

  if (selected !== null && referral)
    return (
      <div className="app-shell">
        <header className="topbar">
          <button
            type="button"
            className="brand brand-home"
            aria-label="Referral Navigator home"
            onClick={() => setSelected(null)}
          >
            <span className="brand-mark">
              <HeartHandshake size={20} />
            </span>
            <span>Referral Navigator</span>
          </button>
          <div className="top-actions">
            <LanguageToggle />
            <span
              className="privacy-chip"
              title="This preview keeps changes in memory. Refreshing clears them."
            >
              <CircleHelp size={14} /> Demo · resets on refresh
            </span>
            <HeaderMenu
              open={menuOpen}
              menuRef={menuRef}
              onToggle={() => setMenuOpen((open) => !open)}
              onHome={() => {
                setSelected(null);
                setMenuOpen(false);
              }}
              onAddReferral={() => {
                setMenuOpen(false);
                openNewReferral();
              }}
              onHelp={() => {
                setMenuOpen(false);
                setModal("help");
              }}
              referralCount={referrals.length}
            />
          </div>
        </header>
        <main className="detail-wrap">
          <button className="back-link" onClick={() => setSelected(null)}>
            <ArrowLeft size={17} /> All referrals
          </button>
          <div className="detail-heading">
            <div>
              <p className="eyebrow">YOUR REFERRAL</p>
              <h1>{referral.specialty}</h1>
              <p className="subheading">
                {referral.from} <span>→</span> {referral.to}
              </p>
            </div>
            <span
              className={`status-pill ${["ready-to-schedule", "appointment-scheduled", "appointment-completed"].includes(handoffState) ? "status-green" : "status-amber"}`}
            >
              <span className="status-dot" />
              {status}
            </span>
          </div>
          <div className="notice">
            <CircleHelp size={18} />
            <p>
              <strong>Only you can update this tracker.</strong> We can’t see
              referral status in office systems. Updates below are labeled by
              their source so you can tell what’s confirmed and what’s still
              unknown.
            </p>
          </div>

          <ReferralAgentCard
            referral={referral}
            mode="detail"
            reminderDate={reminderDates[referral.id] || ""}
            reminderOpen={reminderEditorId === referral.id}
            reminderDraft={reminderDraft}
            onPrimary={() => startMessage("Text message", referral)}
            onOpenReminder={() => openReminder(referral)}
            onReminderDraftChange={setReminderDraft}
            onSaveReminder={() => saveReminder(referral)}
          />
          {inlineDraftId === referral.id && (
            <InlineDraftPanel
              kind={messageKind}
              draft={messageDraft}
              copied={copied}
              onKindChange={(kind) => startMessage(kind, referral)}
              onDraftChange={setMessageDraft}
              onCopy={copyDraft}
              onContact={() => logContactAttempt(referral)}
              onClose={() => setInlineDraftId(null)}
            />
          )}

          <section className="section-card journey-card">
            <div className="section-title-row">
              <div>
                <p className="eyebrow">THE HANDOFF</p>
                <h2>From recommendation to appointment</h2>
              </div>
              <div className="journey-actions button-stack">
                {handoffState === "ready-to-schedule" && (
                  <button className="primary-button compact" onClick={() => addUpdate("Appointment scheduled", "", "You", "appointment-scheduled")}>
                    <CalendarDays size={16} /> Record appointment booked
                  </button>
                )}
                {handoffState === "appointment-scheduled" && (
                  <button className="primary-button compact" onClick={() => addUpdate("Appointment completed", "", "You", "appointment-completed")}>
                    <CheckCircle2 size={16} /> Mark appointment complete
                  </button>
                )}
                <button className="text-button" onClick={() => addUpdate()}>
                  + Add update
                </button>
              </div>
            </div>
            <div className="journey">
              {steps.map((step, i) => {
                const sentOrLater = [
                  "referral-sent",
                  "referral-received",
                  "awaiting-records",
                  "declined-by-specialist",
                  "ready-to-schedule",
                ].includes(handoffState);
                const receivedOrLater = [
                  "referral-received",
                  "awaiting-records",
                  "declined-by-specialist",
                  "ready-to-schedule",
                ].includes(handoffState);
                const reviewComplete = ["ready-to-schedule", "appointment-scheduled", "appointment-completed"].includes(handoffState);
                const done =
                  i === 0 ||
                  (i === 1 && sentOrLater) ||
                  (i === 2 && receivedOrLater) ||
                  (i === 3 && reviewComplete) ||
                  (i === 4 && reviewComplete) ||
                  (i === 5 && ["appointment-scheduled", "appointment-completed"].includes(handoffState)) ||
                  (i === 6 && handoffState === "appointment-completed");
                const active =
                  (i === 1 && ["status-not-confirmed", "referral-not-sent"].includes(handoffState)) ||
                  (i === 2 && handoffState === "referral-sent") ||
                  (i === 3 && ["referral-received", "awaiting-records", "declined-by-specialist"].includes(handoffState)) ||
                  (i === 4 && handoffState === "ready-to-schedule") ||
                  (i === 5 && handoffState === "ready-to-schedule");
                const stateLabel =
                  i === 4
                    ? reviewComplete ? "Confirmed" : "Only after confirmation"
                    : i === 5
                      ? handoffState === "appointment-scheduled" || handoffState === "appointment-completed" ? "Recorded" : "Not recorded"
                      : i === 6
                        ? handoffState === "appointment-completed" ? "Recorded" : "After appointment"
                    : i === 3 && handoffState === "awaiting-records"
                      ? "Awaiting records"
                      : i === 3 && handoffState === "declined-by-specialist"
                        ? "Specialist decline"
                        : done ? "Recorded" : i === 1 && handoffState === "referral-not-sent"
                          ? "Not sent" : "Not confirmed";
                return (
                  <div
                    className={`journey-step ${done ? "is-done" : ""} ${active ? "is-active" : ""}`}
                    key={step.title}
                  >
                    <div className="journey-marker">
                      {done ? <Check size={15} /> : i + 1}
                    </div>
                    <div className="journey-copy">
                      <div className="journey-label">
                        {step.title}
                        <span>{stateLabel}</span>
                      </div>
                      <p>{step.copy}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          <div className="content-grid">
            <section className="section-card next-card">
              <div className="section-title-row">
                <div>
                  <p className="eyebrow">YOUR NEXT STEP</p>
                  <h2>{agentInsight?.headline ?? "Check your referral status"}</h2>
                </div>
                <span className="round-icon">
                  <ClipboardList size={19} />
                </span>
              </div>
              <p className="body-copy">{agentInsight?.action ?? "Review the updates you have recorded."}</p>
              {latestCoverage?.coverageUpdate && (
                <p className="notice coverage-note">
                  <ShieldCheck size={16} />
                  <span>
                    <strong>Insurance update: {coverageLabel(latestCoverage.coverageUpdate)}.</strong>{" "}
                    {latestCoverage.detail} Specialist review and insurance authorization are tracked separately.
                  </span>
                </p>
              )}
              <div className="action-list">
                <button
                  className={`check-row ${referral.done.includes("ask-sent") ? "checked" : ""}`}
                  onClick={() => toggleDone("ask-sent")}
                >
                  <span className="checkbox">
                    {referral.done.includes("ask-sent") && <Check size={13} />}
                  </span>
                  <span>Ask the referring office if it was sent</span>
                </button>
                <button
                  className={`check-row ${referral.done.includes("ask-received") ? "checked" : ""}`}
                  onClick={() => toggleDone("ask-received")}
                >
                  <span className="checkbox">
                    {referral.done.includes("ask-received") && (
                      <Check size={13} />
                    )}
                  </span>
                  <span>Ask the specialist office if it arrived</span>
                </button>
              </div>
              <div className="button-stack">
                <button
                  className="primary-button"
                  onClick={() => startMessage("Call script")}
                >
                  <Phone size={17} /> Prepare a call script
                </button>
                <button
                  className="secondary-button"
                  onClick={() => startMessage("Text message")}
                >
                  <MessageCircle size={17} /> Draft a text or portal message
                </button>
              </div>
            </section>

            <section className="section-card timeline-card">
              <div className="section-title-row">
                <div>
                  <p className="eyebrow">YOUR ACTIVITY</p>
                  <h2>Referral updates</h2>
                </div>
                <span className="count-chip">{referral.updates.length}</span>
              </div>
              <div className="timeline-list">
                {[...referral.updates].reverse().map((update) => (
                  <article className="timeline-entry" key={update.id}>
                    <span
                      className={`source-dot ${update.source !== "You" ? "office-source" : ""}`}
                    />
                    <div className="entry-body">
                      <div className="entry-top">
                        <strong>{update.title}</strong>
                        <span>{update.date}</span>
                      </div>
                      <p>{update.detail}</p>
                      {update.milestone && (
                        <span className="source-tag">{handoffLabel(update.milestone, update)}</span>
                      )}
                      {update.appointmentDate && <span className="source-tag">Appointment · {new Date(`${update.appointmentDate}T12:00:00`).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>}
                      {update.appointmentTime && <span className="source-tag">Time · {update.appointmentTime}</span>}
                      {update.coverageUpdate && (
                        <span className="source-tag source-tag-office">Insurance · {coverageLabel(update.coverageUpdate)}</span>
                      )}
                      {update.certainty === "possible" && (
                        <span className="source-tag">Possible, not confirmed</span>
                      )}
                      <span
                        className={`source-tag ${update.source !== "You" ? "source-tag-office" : ""}`}
                      >
                        {update.source === "You"
                          ? "You entered this"
                          : `You recorded · ${update.source}`}
                      </span>
                    </div>
                  </article>
                ))}
              </div>
              <button
                className="outline-button full"
                onClick={() => addUpdate()}
              >
                <Plus size={16} /> Record a response or update
              </button>
            </section>
          </div>

          <section className="section-card tools-card">
            <div className="tools-intro">
              <p className="eyebrow">KEEP THINGS TOGETHER</p>
              <h2>Helpful details for your next call</h2>
              <p>
                Keep questions and plan details in one place. This app doesn’t
                interpret diagnoses or determine coverage.
              </p>
            </div>
            <div className="tool-links">
              <button onClick={() => setModal("notes")}>
                <span className="tool-icon">
                  <FileText size={17} />
                </span>
                <span>
                  <strong>Visit notes & questions</strong>
                  <small>
                    {referral.notes
                      ? "Notes saved"
                      : "Add what you want to remember"}
                  </small>
                </span>
                <ArrowRight size={16} />
              </button>
              <button onClick={() => setModal("help")}>
                <span className="tool-icon">
                  <ShieldCheck size={17} />
                </span>
                <span>
                  <strong>Coverage questions</strong>
                  <small>What to ask your health plan</small>
                </span>
                <ArrowRight size={16} />
              </button>
            </div>
          </section>
          <p className="disclaimer">
            Referral Navigator helps you organize information you provide. It
            can’t verify referral status, give medical advice, or determine
            insurance coverage. This preview keeps edits in memory; refreshing
            clears them.
          </p>
        </main>
        {modal && (
          <Modal
            title={
              modal === "update"
                ? "Record an update"
                : modal === "notes"
                    ? "Visit notes & questions"
                    : "A little guidance"
            }
            onClose={() => setModal(null)}
          >
            {modal === "update" && (
              <div className="form-body">
                <p className="modal-intro">
                  Keep track of what you heard and who it came from. This
                  records your note; it doesn’t contact an office.
                </p>
                <label>
                  What happened?
                  <input
                    autoFocus
                    value={updateTitle}
                    onChange={(e) => setUpdateTitle(e.target.value)}
                    placeholder="e.g. Called to ask if referral was sent"
                  />
                </label>
                <label>
                  What part of the handoff is this about?
                  <select
                    value={updateMilestone}
                    onChange={(e) => {
                      const value = e.target.value as Milestone | "";
                      setUpdateMilestone(value);
                      if (value) setUpdateCoverage("");
                    }}
                  >
                    <option value="">Status not confirmed / general note</option>
                    <option value="referral-not-sent">Not sent</option>
                    <option value="referral-sent">Referral sent</option>
                    <option value="referral-received">Referral received</option>
                    <option value="awaiting-records">Awaiting records</option>
                    <option value="declined-by-specialist">Declined by specialist</option>
                    <option value="ready-to-schedule">Ready to schedule</option>
                    <option value="appointment-scheduled">Appointment scheduled</option>
                    <option value="appointment-completed">Appointment completed</option>
                  </select>
                </label>
                <label>
                  Insurance update (tracked separately)
                  <select
                    value={updateCoverage}
                    onChange={(e) => {
                      const value = e.target.value as CoverageUpdate | "";
                      setUpdateCoverage(value);
                      if (value) {
                        setUpdateMilestone("");
                        setUpdateSource("Health plan");
                      }
                    }}
                  >
                    <option value="">No insurance update</option>
                    <option value="authorization-required">Authorization required</option>
                    <option value="out-of-network">Possible out-of-network issue</option>
                    <option value="coverage-confirmed">Coverage confirmed</option>
                  </select>
                  <small>Insurance status does not change specialist acceptance or handoff status.</small>
                </label>
                {updateMilestone === "awaiting-records" && (
                  <>
                    <label>
                      What record is needed? (if known)
                      <input
                        value={updateMissingItem}
                        onChange={(e) => setUpdateMissingItem(e.target.value)}
                        placeholder="e.g. latest dental X-ray"
                      />
                    </label>
                    <label>
                      Who is expected to provide it?
                      <select
                        value={updateRecordsOwner}
                        onChange={(e) => setUpdateRecordsOwner(e.target.value as RecordsOwner)}
                      >
                        <option value="Not sure">Not sure</option>
                        <option value="Referring office">Referring office</option>
                        <option value="Specialist office">Specialist office</option>
                        <option value="You">You</option>
                      </select>
                    </label>
                  </>
                )}
                {updateMilestone === "declined-by-specialist" && (
                  <label>
                    How certain is this update?
                    <select
                      value={updateCertainty}
                      onChange={(e) => setUpdateCertainty(e.target.value as UpdateCertainty)}
                    >
                      <option value="confirmed">Specialist office confirmed decline</option>
                      <option value="possible">Possible / not final</option>
                    </select>
                  </label>
                )}
                {updateMilestone === "appointment-scheduled" && (
                  <>
                    <label>
                      Appointment date (if known)
                      <input type="date" value={appointmentDate} onChange={(e) => setAppointmentDate(e.target.value)} />
                    </label>
                    <label>
                      Appointment time (if known)
                      <input type="time" value={appointmentTime} onChange={(e) => setAppointmentTime(e.target.value)} />
                    </label>
                    <small>This records what you entered; it doesn’t confirm the booking with the office.</small>
                  </>
                )}
                {updateMilestone === "ready-to-schedule" && (
                  <label className="ready-confirmation">
                    <input
                      type="checkbox"
                      checked={readyConfirmation}
                      onChange={(e) => setReadyConfirmation(e.target.checked)}
                    />
                    <span>The specialist office confirmed it can proceed and any requested records or review steps are complete.</span>
                  </label>
                )}
                <label>
                  Who provided this update?
                  <select
                    value={updateSource}
                    onChange={(e) => setUpdateSource(e.target.value as Source)}
                  >
                    <option value="You">You</option>
                    <option value="Referring office">Referring office</option>
                    <option value="Specialist office">Specialist office</option>
                    <option value="Health plan">Health plan</option>
                  </select>
                </label>
                <label>
                  {updateMilestone === "declined-by-specialist"
                    ? "Reason the specialist gave (if stated)"
                    : "Notes"}
                  <textarea
                    value={updateDetail}
                    onChange={(e) => setUpdateDetail(e.target.value)}
                    placeholder={
                      updateMilestone === "declined-by-specialist"
                        ? "Use the specialist office’s words. Don’t guess at the reason."
                        : "What did they tell you? Include a name or reference number if useful."
                    }
                    rows={3}
                  />
                </label>
                <p className="helper-note">
                  <ShieldCheck size={15} /> Office updates mean you recorded
                  what an office told you; Referral Navigator doesn’t verify
                  them.
                </p>
                <button
                  className="primary-button full"
                  disabled={!updateTitle.trim() || (updateMilestone === "ready-to-schedule" && (!readyConfirmation || updateSource !== "Specialist office"))}
                  onClick={saveUpdate}
                >
                  Save update
                </button>
              </div>
            )}
            {modal === "notes" && (
              <NotesForm
                value={referral.notes}
                onSave={(notes) => {
                  setReferrals((all) =>
                    all.map((r) =>
                      r.id === referral.id ? { ...r, notes } : r,
                    ),
                  );
                  setModal(null);
                  flash("Your notes were saved.");
                }}
              />
            )}
            {modal === "help" && (
              <div className="form-body">
                <p className="modal-intro">
                  Referral Navigator is your personal organizer. It doesn’t
                  connect to clinic or insurance systems.
                </p>
                <div className="help-list">
                  <div>
                    <span>01</span>
                    <p>
                      <strong>Ask the referring office</strong>
                      <br />
                      Was the referral sent? When, and to which specialist?
                    </p>
                  </div>
                  <div>
                    <span>02</span>
                    <p>
                      <strong>Ask the specialist office</strong>
                      <br />
                      Did it arrive? Is anything else needed before scheduling?
                    </p>
                  </div>
                  <div>
                    <span>03</span>
                    <p>
                      <strong>Check with your health plan</strong>
                      <br />
                      Is the specialist in network? Is authorization required?
                    </p>
                  </div>
                </div>
                <p className="helper-note">
                  <ShieldCheck size={15} /> Coverage and appointment rules vary.
                  Confirm details directly with the office or plan.
                </p>
                <button
                  className="primary-button full"
                  onClick={() => setModal(null)}
                >
                  Got it
                </button>
              </div>
            )}
          </Modal>
        )}
        {toast && (
          <div className="toast" role="status">
            <CheckCircle2 size={17} />
            {toast}
          </div>
        )}
      </div>
    );

  return (
    <div className="app-shell dashboard-shell">
      <header className="topbar">
        <button
          type="button"
          className="brand brand-home"
          aria-label="Referral Navigator home"
          onClick={() => setSelected(null)}
        >
          <span className="brand-mark">
            <HeartHandshake size={20} />
          </span>
          <span>Referral Navigator</span>
        </button>
        <nav className="nav dashboard-nav" aria-label="Dashboard navigation">
          <p className="sidebar-nav-label">YOUR SPACE</p>
          <button
            className="nav-active"
            onClick={() => {
              setMenuOpen(false);
              document.getElementById("dashboard-overview")?.scrollIntoView({
                behavior: "smooth",
              });
            }}
          >
            <Home size={17} /> Overview
          </button>
          <button
            onClick={() => {
              setMenuOpen(false);
              document.getElementById("dashboard-referrals")?.scrollIntoView({
                behavior: "smooth",
              });
            }}
          >
            <ClipboardList size={17} /> My referrals
            <span className="sidebar-count">{referrals.length}</span>
          </button>
          <button
            onClick={() => {
              setMenuOpen(false);
              document.getElementById("dashboard-next-step")?.scrollIntoView({
                behavior: "smooth",
              });
            }}
          >
            <MessageCircle size={17} /> Next steps
          </button>
          <button
            onClick={() => {
              setMenuOpen(false);
              setModal("help");
            }}
          >
            <CircleHelp size={17} /> How it works
          </button>
        </nav>
        <div className="top-actions">
          <LanguageToggle />
          <span className="privacy-chip">
            <CircleHelp size={14} /> Demo · resets on refresh
          </span>
          <HeaderMenu
            open={menuOpen}
            menuRef={menuRef}
            onToggle={() => setMenuOpen((open) => !open)}
            onHome={() => {
              setSelected(null);
              setMenuOpen(false);
            }}
            onAddReferral={() => {
              setMenuOpen(false);
              openNewReferral();
            }}
            onHelp={() => {
              setMenuOpen(false);
              setModal("help");
            }}
            referralCount={referrals.length}
          />
        </div>
      </header>
      <main className="dashboard-wrap" id="dashboard-overview">
        <section className="welcome">
          <div>
            <p className="eyebrow">YOUR CARE, ORGANIZED</p>
            <h1>Keep your referral moving.</h1>
            <p>
              Know what you’ve heard, what’s still unclear, and who to contact
              next.
            </p>
          </div>
          <div className="welcome-art">
            <div className="art-orbit orbit-one" />
            <div className="art-orbit orbit-two" />
            <div className="art-icon">
              <HeartHandshake size={34} />
            </div>
            <span className="spark spark-one">✦</span>
            <span className="spark spark-two">✳</span>
          </div>
        </section>
        {demoMode && (
          <aside className="demo-banner" aria-label="Sample tracker">
            <span className="demo-banner-copy">
              <strong>Sample referral</strong>
              <span>Explore the tracker, then start your own when you’re ready.</span>
            </span>
            <button className="secondary-button" onClick={openNewReferral}>
              Start your own <ArrowRight size={15} />
            </button>
          </aside>
        )}
        {nextReferral && (
          <ReferralAgentCard
            referral={nextReferral}
            mode="overview"
            reminderDate={reminderDates[nextReferral.id] || ""}
            reminderOpen={reminderEditorId === nextReferral.id}
            reminderDraft={reminderDraft}
            onPrimary={() => setSelected(nextReferral.id)}
            onOpenReminder={() => openReminder(nextReferral)}
            onReminderDraftChange={setReminderDraft}
            onSaveReminder={() => saveReminder(nextReferral)}
          />
        )}
        <section className="dashboard-stats" aria-label="Referral summary">
          <article className="summary-card summary-coral">
            <div className="summary-card-top">
              <ClipboardList size={17} />
              <span>IN YOUR TRACKER</span>
            </div>
            <strong>{referrals.length}</strong>
            <p>Referral{referrals.length === 1 ? "" : "s"} you added</p>
          </article>
          <article className="summary-card summary-gold">
            <div className="summary-card-top">
              <MessageCircle size={17} />
              <span>FOLLOW-UP</span>
            </div>
            <strong>{followUpCount}</strong>
            <p>Without a scheduling update</p>
          </article>
          <article className="summary-card summary-pink">
            <div className="summary-card-top">
              <CheckCircle2 size={17} />
              <span>RECEIPT CONFIRMED</span>
            </div>
            <strong>{receiptConfirmedCount}</strong>
            <p>Specialist office updates</p>
          </article>
          <article className="summary-card summary-blue">
            <div className="summary-card-top">
              <CalendarDays size={17} />
              <span>READY TO SCHEDULE</span>
            </div>
            <strong>{readyToScheduleCount}</strong>
            <p>Based on updates you recorded</p>
          </article>
        </section>

        <section className="dashboard-section" id="dashboard-referrals">
          <div className="section-title-row list-title">
            <div>
              <h2>Your referrals</h2>
              <p>Updates are entered by you and labeled by source.</p>
            </div>
            <button
              className="primary-button add-button"
              onClick={openNewReferral}
            >
              <Plus size={17} /> Add a referral
            </button>
          </div>
          {referrals.length === 0 ? (
            <div className="empty-state">
              <span className="empty-icon">
                <Stethoscope size={24} />
              </span>
              <h3>No referrals yet</h3>
              <p>
                Add a referral to keep the next steps and office details
                together.
              </p>
              <button
                className="primary-button"
                onClick={openNewReferral}
              >
                <Plus size={17} /> Add your first referral
              </button>
            </div>
          ) : (
            <div className="referral-list-layout">
              <div className="referral-grid">
                {referrals.map((r) => {
                  return (
                    <article className="referral-card" key={r.id}>
                      <div className="card-top">
                        <span className="specialty-icon">
                          <Stethoscope size={19} />
                        </span>
                        <span
                          className={`status-pill ${["ready-to-schedule", "appointment-scheduled", "appointment-completed"].includes(getHandoffState(r)) ? "status-green" : "status-amber"}`}
                        >
                          <span className="status-dot" />
                          {handoffLabel(getHandoffState(r), latestStatusUpdate(r))}
                        </span>
                      </div>
                      <h3>{r.specialty}</h3>
                      <p className="route-line">
                        {r.from}
                        <span>→</span>
                        {r.to}
                      </p>
                      <div className="card-divider" />
                      <div className="card-meta">
                        <span>
                          <CalendarDays size={15} /> Added {r.date}
                        </span>
                        <span>
                          <MessageCircle size={15} /> {r.updates.length} updates
                        </span>
                      </div>
                      <div className="card-note">
                        <CircleHelp size={16} />
                        <span>
                          {getHandoffState(r) === "appointment-scheduled"
                            ? "You recorded an appointment booking."
                            : getHandoffState(r) === "appointment-completed"
                              ? "You recorded that the appointment is complete."
                              : getHandoffState(r) === "awaiting-records"
                            ? "A record is needed before specialist review can continue."
                            : getHandoffState(r) === "declined-by-specialist"
                              ? "Review the specialist-office update and confirm whether the decision is final."
                              : getHandoffState(r) === "ready-to-schedule"
                                ? "The specialist confirmed it can proceed to scheduling."
                                : getHandoffState(r) === "referral-received"
                                  ? "Receipt is recorded; specialist review and scheduling readiness are still separate."
                                  : getHandoffState(r) === "referral-sent"
                                    ? "The referring office reported sending it; specialist receipt is not confirmed."
                                    : getHandoffState(r) === "referral-not-sent"
                                      ? "You recorded that the referral has not been sent yet."
                                      : "Referral status has not been confirmed."}
                        </span>
                      </div>
                      <button
                        className="primary-button card-primary-action"
                        onClick={() => startMessage("Call script", r)}
                      >
                        <Phone size={16} /> Prepare a call script
                      </button>
                      {inlineDraftId === r.id && (
                        <InlineDraftPanel
                          kind={messageKind}
                          draft={messageDraft}
                          copied={copied}
                          onKindChange={(kind) => startMessage(kind, r)}
                          onDraftChange={setMessageDraft}
                          onCopy={copyDraft}
                          onContact={() => logContactAttempt(r)}
                          onClose={() => setInlineDraftId(null)}
                        />
                      )}
                      <button
                        className="card-link"
                        onClick={() => setSelected(r.id)}
                      >
                        View full referral <ArrowRight size={17} />
                      </button>
                    </article>
                  );
                })}
              </div>
              <aside className="first-step-card" id="dashboard-next-step">
                <span className="guide-icon">
                  <MessageCircle size={18} />
                </span>
                <p className="eyebrow">YOUR NEXT STEP</p>
                <h3>{nextStep?.title ?? "Add your first referral"}</h3>
                <p>{nextStep?.detail ?? "Start with what your clinician recommended. You can fill in office details later."}</p>
                <button
                  className="text-button"
                  onClick={() =>
                    nextReferral
                      ? setSelected(nextReferral.id)
                      : openNewReferral()
                  }
                >
                  {nextReferral ? "Open referral" : "Add a referral"}{" "}
                  <ArrowRight size={15} />
                </button>
                <div className="guide-foot">
                  <ShieldCheck size={14} /> Based on your saved updates
                </div>
              </aside>
            </div>
          )}
        </section>
        <section className="dashboard-lower-grid">
          <article className="dashboard-lower-card">
            <div className="lower-card-heading">
              <div>
                <p className="eyebrow">RECENT ACTIVITY</p>
                <h2>Referral updates</h2>
              </div>
              <span className="section-count">{latestUpdates.length}</span>
            </div>
            {latestUpdates.length ? (
              <div className="recent-updates">
                {latestUpdates.map(({ referral: item, update }) => (
                  <button
                    className="recent-update-row"
                    key={item.id + "-" + update.id}
                    onClick={() => setSelected(item.id)}
                  >
                    <span className="recent-update-icon">
                      <FileText size={16} />
                    </span>
                    <span className="recent-update-copy">
                      <strong>{update.title}</strong>
                      <small>{item.specialty} · {update.date}</small>
                    </span>
                    <span className="source-chip">{update.source}</span>
                  </button>
                ))}
              </div>
            ) : (
              <p className="lower-card-empty">Your saved updates will appear here.</p>
            )}
          </article>
          <article className="dashboard-lower-card reminders-card">
            <div className="lower-card-heading">
              <div>
                <p className="eyebrow">KEEP IN MIND</p>
                <h2>Questions to take with you</h2>
              </div>
              <span className="reminder-icon"><ShieldCheck size={17} /></span>
            </div>
            <ul>
              <li>Ask the referring office whether and when the referral was sent.</li>
              <li>Check with the specialist office that it arrived.</li>
              <li>Ask your health plan about network and authorization requirements.</li>
            </ul>
            <button className="text-button" onClick={() => setModal("help")}>
              Review the steps <ArrowRight size={15} />
            </button>
          </article>
        </section>
        <section className="bottom-callout">
          <span className="callout-icon">
            <ShieldCheck size={19} />
          </span>
          <div>
            <strong>Patient-owned, with no automatic status checks</strong>
            <p>
              Changes in this preview stay in memory and reset on refresh.
              Referral Navigator doesn’t contact offices or access their
              systems.
            </p>
          </div>
          <button className="text-button" onClick={() => setModal("help")}>
            How it works <ArrowRight size={15} />
          </button>
        </section>
        <footer className="footer">
          <span>Referral Navigator · A personal referral companion</span>
          <button onClick={() => setModal("help")}>About this tool</button>
        </footer>
      </main>
      {modal && (
        <Modal
          title={modal === "new" ? "Add a referral" : "A little guidance"}
          onClose={() => setModal(null)}
        >
          {modal === "new" ? (
            <form className="form-body" onSubmit={createReferral}>
              <p className="modal-intro">
                Add what you know after a clinician recommends specialist care.
                You can fill in the rest later.
              </p>
              <label>
                Specialty or reason
                <input
                  autoFocus
                  required
                  value={newSpecialty}
                  onChange={(e) => setNewSpecialty(e.target.value)}
                  placeholder="e.g. Cardiology"
                />
              </label>
              <label>
                Referring office
                <input
                  value={newFrom}
                  onChange={(e) => setNewFrom(e.target.value)}
                  placeholder="Clinic or clinician name"
                />
              </label>
              <label>
                Specialist office
                <input
                  value={newTo}
                  onChange={(e) => setNewTo(e.target.value)}
                  placeholder="If you know it"
                />
              </label>
              <label>
                Date recommended
                <input
                  type="date"
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                />
              </label>
              <p className="helper-note">
                <ShieldCheck size={15} /> Adding a referral only saves it in
                your tracker. Nothing is sent to an office.
              </p>
              <button className="primary-button full" type="submit">
                Add to my referrals
              </button>
            </form>
          ) : (
            <div className="form-body">
              <p className="modal-intro">
                Referral Navigator is your personal organizer. It doesn’t
                connect to clinic or insurance systems.
              </p>
              <div className="help-list">
                <div>
                  <span>01</span>
                  <p>
                    <strong>Ask the referring office</strong>
                    <br />
                    Was the referral sent? When and to which specialist?
                  </p>
                </div>
                <div>
                  <span>02</span>
                  <p>
                    <strong>Ask the specialist office</strong>
                    <br />
                    Did it arrive? Is anything else needed before scheduling?
                  </p>
                </div>
                <div>
                  <span>03</span>
                  <p>
                    <strong>Check with your health plan</strong>
                    <br />
                    Is the specialist in network? Is authorization required?
                  </p>
                </div>
              </div>
              <button
                className="primary-button full"
                onClick={() => setModal(null)}
              >
                Got it
              </button>
            </div>
          )}
        </Modal>
      )}
      {toast && (
        <div className="toast" role="status">
          <CheckCircle2 size={17} />
          {toast}
        </div>
      )}
    </div>
  );
}

function NotesForm({
  value,
  onSave,
}: {
  value: string;
  onSave: (v: string) => void;
}) {
  const [notes, setNotes] = useState(value);
  return (
    <div className="form-body">
      <p className="modal-intro">
        Save your own visit recap or questions for your next conversation. This
        tool won’t interpret symptoms or recommend treatment.
      </p>
      <label>
        Notes
        <textarea
          autoFocus
          rows={6}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="What did your clinician recommend? What would you like to ask next time?"
        />
      </label>
      <button className="primary-button full" onClick={() => onSave(notes)}>
        Save notes
      </button>
    </div>
  );
}