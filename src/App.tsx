import {
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type FormEvent,
  type ReactNode,
  type RefObject,
} from "react";
import {
  ArrowLeft,
  ArrowRight,
  Archive,
  Building2,
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
  Pencil,
  ShieldCheck,
  Settings,
  Stethoscope,
  Trash2,
  X,
} from "lucide-react";
import { AuthProvider, useAuth } from "./auth/AuthContext";
import SignIn from "./pages/SignIn";
import { supabase } from "./lib/supabase";
import { LanguageProvider, LanguageToggle, localizedDraft, translateText, useAppLanguage, type AppLanguage } from "./i18n";

type Source = "You" | "Referring office" | "Specialist office" | "Health plan";
type DashboardPage = "overview" | "referrals" | "next-steps";
type Milestone = "referral-sent" | "referral-received" | "ready-to-schedule" | "appointment-scheduled";
type ReferralEventType = "records-requested" | "records-sent" | "follow-up-recommended" | "visit-completed" | "care-step" | "specialist-declined" | "insurance-denied" | "referral-redirected";
type Update = {
  id: number;
  title: string;
  detail: string;
  date: string;
  source: Source;
  milestone?: Milestone;
  milestones?: Milestone[];
  eventDate?: string;
  eventType?: ReferralEventType;
  outcomeReason?: string;
  outcomeSuggestion?: string;
};
function hasMilestone(update: Update, milestone: Milestone) {
  return update.milestone === milestone || update.milestones?.includes(milestone) === true;
}

type Referral = {
  id: number;
  specialty: string;
  from: string;
  to: string;
  date: string;
  updates: Update[];
  done: string[];
  notes: string;
  archived?: boolean;
};

const today = new Date().toLocaleDateString("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
});
function motionSafeScrollBehavior(): ScrollBehavior {
  return window.matchMedia?.("(prefers-reduced-motion: reduce)").matches
    ? "auto"
    : "smooth";
}

function updateTimestamp(update: Update) {
  const parsed = Date.parse(update.eventDate ?? update.date);
  return Number.isFinite(parsed) ? parsed : 0;
}

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
    ],
    done: [],
    notes: "",
  },
];

function nextStepFor(referral: Referral) {
  const sent = referral.updates.some((update) => hasMilestone(update, "referral-sent"));
  const received = referral.updates.some(
    (update) => hasMilestone(update, "referral-received") && update.source === "Specialist office",
  );
  const ready = referral.updates.some((update) => hasMilestone(update, "ready-to-schedule"));
  const appointmentScheduled = referral.updates.some((update) => hasMilestone(update, "appointment-scheduled"));
  const latestEvent = [...referral.updates]
    .filter((update) => update.eventType || update.milestone || update.milestones?.length)
    .sort((a, b) => b.id - a.id)[0];

  if (latestEvent?.eventType === "records-requested") {
    return {
      title: "Send the requested records",
      detail: "Confirm how to send the requested records."
    };
  }
  if (latestEvent?.eventType === "records-sent") {
    return {
      title: "Confirm the records arrived",
      detail: "Ask the specialist office whether the requested records were received."
    };
  }
  if (latestEvent?.eventType === "follow-up-recommended") {
    return {
      title: "Plan your follow-up visit",
      detail: "Contact the specialist office to ask how to schedule the follow-up visit."
    };
  }
  if (latestEvent?.eventType === "visit-completed") {
    return {
      title: "Record any next steps from your visit",
      detail: "Record the next steps your clinician shared. Referral Navigator won’t interpret them.",
    };
  }
  if (latestEvent?.eventType === "care-step") {
    return careStepSuggestion(latestEvent);
  }
  if (latestEvent && isOutcomeEventType(latestEvent.eventType)) {
    return outcomeRecommendation(latestEvent.eventType, latestEvent.outcomeReason, latestEvent.outcomeSuggestion);
  }

  if (!sent) {
    return {
      title: "Check whether it was sent",
      detail: "Ask the referring office whether the referral was sent to the specialist."
    };
  }
  if (!received) {
    return {
      title: "Confirm it arrived",
      detail: "Ask the specialist office whether they received the referral and need anything else."
    };
  }
  if (!ready) {
    return {
      title: "Ask how to schedule",
      detail: "Contact the specialist office to learn what you need before booking."
    };
  }
  if (!appointmentScheduled) {
    return {
      title: "Schedule your appointment",
      detail: "Contact the specialist office to choose a visit time. You can keep recording updates after you schedule."
    };
  }
  return {
    title: "Prepare for your visit",
    detail: "The specialist may still ask for records, imaging, or other details. Record any new requests in your activity timeline.",
  };
}
type OutcomeEventType = "specialist-declined" | "insurance-denied" | "referral-redirected";
function isOutcomeEventType(eventType: ReferralEventType | null | undefined): eventType is OutcomeEventType {
  return eventType === "specialist-declined" || eventType === "insurance-denied" || eventType === "referral-redirected";
}
function outcomeReasonOptions(eventType: OutcomeEventType) {
  if (eventType === "specialist-declined") {
    return ["Out of network", "Not accepting new patients", "Wrong specialty", "Records or information needed", "Other", "I’m not sure"];
  }
  if (eventType === "insurance-denied") {
    return ["Authorization denied", "Out of network", "More information requested", "Service not covered / unclear", "Other", "I’m not sure"];
  }
  return ["Another specialist recommended", "Sent to another office", "Asked me to contact the referring office", "Other", "I’m not sure"];
}
function outcomeRecommendation(eventType: OutcomeEventType, reason = "", suggestion = "") {
  if (suggestion.trim()) {
    return eventType === "referral-redirected"
      ? { title: "Confirm the redirected referral", detail: "You recorded a suggested destination or next step. Ask who will send the referral, where it is going, and when to check that it arrived." }
      : { title: "Follow up on the step they suggested", detail: "You recorded a suggested next step. Confirm who will handle it and when to check back." };
  }
  if (eventType === "specialist-declined") {
    if (reason === "Out of network") return { title: "Ask about in-network alternatives", detail: "Ask the referring office whether it can redirect the referral. You can also ask your health plan for in-network specialist options." };
    if (reason === "Not accepting new patients") return { title: "Ask the referring office to redirect the referral", detail: "Ask whether the referring office can suggest another specialist. You can also ask the health plan which in-network offices are accepting patients." };
    if (reason === "Wrong specialty") return { title: "Ask which specialist to contact next", detail: "Ask the referring office which type of specialist is appropriate and whether it can send a new referral." };
    if (reason === "Records or information needed") return { title: "Clarify what information is missing", detail: "Ask the specialist office which records or information it needs and who should send them." };
    return { title: "Clarify why the specialist could not accept it", detail: "Ask the specialist office for the reason. Then ask the referring office whether it can redirect the referral, and ask your health plan about in-network options if needed." };
  }
  if (eventType === "insurance-denied") {
    if (reason === "More information requested") return { title: "Ask what information the plan needs", detail: "Ask the health plan what information is needed and whether it must come from you or the clinician’s office." };
    if (reason === "Out of network") return { title: "Ask the plan about in-network options", detail: "Ask your health plan for in-network specialist options. You can also ask the referring office whether it can redirect the referral." };
    if (reason === "Service not covered / unclear") return { title: "Ask the plan to explain the decision", detail: "Ask your health plan what the notice means, what options or deadlines may apply, and what to ask your clinician’s office." };
    return { title: "Ask the plan to explain the denial", detail: "Ask your health plan for the reason, any options or deadlines, and whether more information is needed. You can ask the clinician’s office if it can help with supporting information." };
  }
  if (reason === "Another specialist recommended" || reason === "Sent to another office") {
    return { title: "Confirm the new referral destination", detail: "Ask the referring office where the referral is going, who will send it, and when to check that the new office received it." };
  }
  return { title: "Clarify where the referral is going", detail: "Ask the office involved which specialist or office is next, who will send the referral, and when to check for receipt." };
}

function updateContextText(update: Update) {
  const detail = update.detail.trim();
  return [update.title.trim(), detail && detail !== "No additional notes." ? detail : ""]
    .filter(Boolean)
    .join(": ")
    .replace(/[“”]/g, "'")
    .replace(/\s+/g, " ")
    .slice(0, 500);
}

function careStepSuggestion(update: Update) {
  const context = updateContextText(update).toLowerCase();
  if (/record|document|photo|x.?ray|mri|imaging|scan|test result/.test(context)) {
    return {
      title: "Clarify the records or imaging request",
      detail: "Ask which records or images are needed, how to send them, and how to confirm they arrived.",
    };
  }
  if (/authorization|pre.?auth|insurance|coverage|in network/.test(context)) {
    return {
      title: "Check what is needed for authorization",
      detail: "Ask which office is handling authorization, whether anything is needed from you, and when to follow up.",
    };
  }
  if (/primary doctor|primary care|another specialist|second specialist|new referral|referral to/.test(context)) {
    return {
      title: "Confirm who will send the next referral",
      detail: "Ask the referring office which specialist the referral is for, where it will be sent, and when to check back.",
    };
  }
  if (/follow.?up|return visit|check.?in/.test(context)) {
    return {
      title: "Ask how to arrange the follow-up",
      detail: "Confirm which office should schedule the follow-up and when they recommend you contact them.",
    };
  }
  if (/reschedul|cancel|no availability|wait.?list/.test(context)) {
    return {
      title: "Confirm the new appointment plan",
      detail: "Ask about the next available date, any wait-list option, and whether the earlier preparation still applies.",
    };
  }
  if (/surgery|procedure|operation/.test(context)) {
    return {
      title: "Ask what needs to happen before the procedure",
      detail: "Ask the office which preparation steps, documents, or appointments they want you to complete and who can answer questions.",
    };
  }
  const note = updateContextText(update);
  return {
    title: "Ask what should happen after this update",
    detail: `Based on your note, “${note},” ask the office involved what the next step is and when to follow up.`,
  };
}

function recipientForUpdate(update: Update, referral: Referral) {
  if (update.eventType === "insurance-denied") return "your health plan";
  if (update.eventType === "specialist-declined") {
    return update.outcomeReason === "Records or information needed" ? referral.to : referral.from;
  }
  if (update.eventType === "referral-redirected") return referral.from;
  const text = `${update.title} ${update.detail}`.toLowerCase();
  if (/primary care|primary doctor|\\bpcp\\b|family doctor|referring office|referring clinician/.test(text)) return referral.from;
  if (/health plan|insurance|prior authorization|pre-authorization|coverage/.test(text)) return "your health plan";
  if (update.source === "Referring office") return referral.from;
  if (update.source === "Specialist office" || /specialist|clinic|surgeon/.test(text)) return referral.to;
  return "the office involved";
}

function contextualQuestionFor(update: Update) {
  if (update.eventType === "insurance-denied") {
    const question = "Could you explain the reason for the authorization denial, any options or deadlines, and whether more information is needed?";
    const context = [update.outcomeReason && `Reason shared: ${update.outcomeReason}`, update.outcomeSuggestion && `Suggested next step: ${update.outcomeSuggestion}`].filter(Boolean).join("; ");
    return context ? `${question} Context: “${context}”` : question;
  }
  if (update.eventType === "specialist-declined" && update.outcomeReason === "Records or information needed") {
    const question = "Could you tell me which records or information are needed and who should send them?";
    const context = [update.outcomeReason && `Reason shared: ${update.outcomeReason}`, update.outcomeSuggestion && `Suggested next step: ${update.outcomeSuggestion}`].filter(Boolean).join("; ");
    return context ? `${question} Context: “${context}”` : question;
  }
  if (update.eventType === "specialist-declined") {
    const question = "Could you clarify why the specialist couldn’t accept the referral and whether it can be redirected?";
    const context = [update.outcomeReason && `Reason shared: ${update.outcomeReason}`, update.outcomeSuggestion && `Suggested next step: ${update.outcomeSuggestion}`].filter(Boolean).join("; ");
    return context ? `${question} Context: “${context}”` : question;
  }
  if (update.eventType === "referral-redirected") {
    const question = "Could you confirm where the referral is being sent, who will send it, and when I should check that it was received?";
    const context = [update.outcomeReason && `Reason shared: ${update.outcomeReason}`, update.outcomeSuggestion && `Suggested next step: ${update.outcomeSuggestion}`].filter(Boolean).join("; ");
    return context ? `${question} Context: “${context}”` : question;
  }
  const note = updateContextText(update);
  const question =
    update.eventType === "records-requested"
      ? "Could you tell me how to send the requested records?"
      : update.eventType === "records-sent"
        ? "Could you confirm whether you received the requested records?"
        : update.eventType === "follow-up-recommended"
          ? "Could you help me schedule a follow-up visit?"
          : update.eventType === "visit-completed"
            ? "Could you clarify the next steps we discussed?"
            : "Could you help me clarify the next step?";
  return `${question} Context: “${note}”`;
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
  onReferrals,
  onNextSteps,
  onAddReferral,
  onHelp,
  referralCount,
}: {
  open: boolean;
  menuRef: RefObject<HTMLDivElement | null>;
  onToggle: () => void;
  onHome: () => void;
  onReferrals: () => void;
  onNextSteps: () => void;
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
                <Home size={18} />
              </span>
              <span className="menu-item-copy">
                <strong>Overview</strong>
                <small>See your referral summary</small>
              </span>
              <ArrowRight size={16} />
            </button>
            <button className="menu-item" onClick={onReferrals}>
              <span className="menu-item-icon"><ClipboardList size={18} /></span>
              <span className="menu-item-copy"><strong>My referrals</strong><small>{referralCount} {referralCount === 1 ? "referral" : "referrals"} in your tracker</small></span>
              <ArrowRight size={16} />
            </button>
            <button className="menu-item" onClick={onNextSteps}>
              <span className="menu-item-icon"><MessageCircle size={18} /></span>
              <span className="menu-item-copy"><strong>Next steps</strong><small>See open follow-ups</small></span>
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
  const dialogRef = useRef<HTMLElement>(null);
  const closeRef = useRef(onClose);
  const titleId = useId();
  useEffect(() => {
    closeRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    const previousFocus = document.activeElement instanceof HTMLElement
      ? document.activeElement
      : null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const focusableSelector =
      'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';
    const firstField = dialog.querySelector<HTMLElement>(
      'input:not([disabled]), select:not([disabled]), textarea:not([disabled])',
    );
    const firstButton = dialog.querySelector<HTMLElement>("button:not([disabled])");
    (firstField ?? firstButton ?? dialog).focus();

    function handleDialogKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        event.stopPropagation();
        closeRef.current();
        return;
      }
      if (event.key !== "Tab" || !dialog) return;
      const focusable = Array.from(
        dialog.querySelectorAll<HTMLElement>(focusableSelector),
      ).filter((element) => element.getClientRects().length > 0);
      if (!focusable.length) {
        event.preventDefault();
        dialog.focus();
        return;
      }
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (!dialog.contains(document.activeElement)) {
        event.preventDefault();
        (event.shiftKey ? last : first).focus();
      } else if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", handleDialogKeyDown);
    return () => {
      document.removeEventListener("keydown", handleDialogKeyDown);
      document.body.style.overflow = previousOverflow;
      if (previousFocus?.isConnected) {
        previousFocus.focus();
      } else {
        document.querySelector<HTMLElement>(".dashboard-shell .menu-trigger")?.focus();
      }
    };
  }, []);

  return (
    <div
      className="scrim"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) closeRef.current();
      }}
    >
      <section
        ref={dialogRef}
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
      >
        <div className="modal-head">
          <h2 id={titleId}>{title}</h2>
          <IconButton label="Close" onClick={() => closeRef.current()}>
            <X size={20} />
          </IconButton>
        </div>
        {children}
      </section>
    </div>
  );
}

function LandingPage({
  onSignIn,
  onGetStarted,
}: {
  onSignIn: () => void;
  onGetStarted: () => void;
}) {
  return (
    <div className="landing-page">
      <header className="landing-header">
        <button
          type="button"
          className="brand brand-home"
          aria-label="Referral Navigator home"
          onClick={() => {
            window.history.replaceState(
              null,
              "",
              window.location.pathname + window.location.search,
            );
            window.scrollTo({ top: 0, behavior: motionSafeScrollBehavior() });
          }}
        >
          <span className="brand-mark">
            <HeartHandshake size={20} />
          </span>
          <span>Referral Navigator</span>
        </button>
        <nav className="landing-nav" aria-label="Main navigation">
          <LanguageToggle />
          <a
            href="#landing-how-it-works"
            onClick={(event) => {
              event.preventDefault();
              const section = document.getElementById("landing-how-it-works");
              if (!section) return;
              window.history.replaceState(null, "", "#landing-how-it-works");
              const top = section.getBoundingClientRect().top + window.scrollY;
              const behavior = window.matchMedia("(prefers-reduced-motion: reduce)").matches
                ? "auto"
                : "smooth";
              window.scrollTo({ top, behavior });
            }}
          >
            How it works
          </a>
          <button type="button" className="landing-signin" onClick={onSignIn}>
            Sign in
          </button>
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
              One place to organize what you know, track what’s still unclear,
              and prepare to follow up with the right office.
            </p>
            <div className="landing-actions">
              <button className="primary-button" onClick={onGetStarted}>
                Create an account <ArrowRight size={16} />
              </button>
              <button className="secondary-button" onClick={onSignIn}>
                Sign in
              </button>
            </div>
            <p className="landing-reassurance">
              You enter updates yourself. The app doesn’t contact offices or
              check their systems.
            </p>
          </div>

          <div className="landing-preview-panel">
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
            <div className="landing-steps-track">
              <div className="landing-steps-group">
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
            </div>
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
  contextual = false,
  onKindChange,
  onDraftChange,
  onCopy,
  onContact,
  onClose,
}: {
  kind: "Call script" | "Portal message" | "Email";
  draft: string;
  copied: boolean;
  contextual?: boolean;
  onKindChange: (kind: "Call script" | "Portal message" | "Email") => void;
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
          <h3>Prepare a call script or message</h3>
        </div>
        <IconButton label="Close draft" onClick={onClose}>
          <X size={18} />
        </IconButton>
      </div>
      <p className="modal-intro">
        {contextual
          ? "Your saved update is included as context. Check the office and wording before you contact anyone. Nothing is sent from here."
          : "Edit this draft for your situation. Nothing is sent from here."}
      </p>
      <div className="segmented" role="group" aria-label="Draft format">
        {(["Call script", "Portal message", "Email"] as const).map((option) => (
          <button
            type="button"
            className={kind === option ? "selected" : ""}
            aria-pressed={kind === option}
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

function ReferralNavigatorApp() {
  const { user, signOut } = useAuth();
  const { language, setLanguage } = useAppLanguage();
  const [languageSaveState, setLanguageSaveState] = useState("");
  const ownerId = user?.id ?? null;
  const [referrals, setReferrals] = useState<Referral[]>(initial);
  const [dataReady, setDataReady] = useState(false);
  const [syncError, setSyncError] = useState("");
  const [demoMode, setDemoMode] = useState(false);
  const [inlineDraftId, setInlineDraftId] = useState<number | null>(null);
  const [inlineDraftContextId, setInlineDraftContextId] = useState<number | null>(null);
  const [inlineDraftPlacement, setInlineDraftPlacement] = useState<"next-step" | "care-step">("next-step");
  const [selected, setSelected] = useState<number | null>(null);
  const [dashboardPage, setDashboardPage] = useState<DashboardPage>("overview");
  const [showArchived, setShowArchived] = useState(false);
  const [editingReferralId, setEditingReferralId] = useState<number | null>(null);
  const [modal, setModal] = useState<
    "new" | "update" | "notes" | "help" | "settings" | null
  >(null);
  const [updateTitle, setUpdateTitle] = useState("");
  const [updateDetail, setUpdateDetail] = useState("");
  const [updateSource, setUpdateSource] = useState<Source>("You");
  const [updateMilestones, setUpdateMilestones] = useState<Milestone[]>([]);
  const [updateEventDate, setUpdateEventDate] = useState("");
  const [updateEventType, setUpdateEventType] = useState<ReferralEventType | null>(null);
  const [outcomeReason, setOutcomeReason] = useState("");
  const [outcomeSuggestedNextStep, setOutcomeSuggestedNextStep] = useState("");
  const [messageKind, setMessageKind] = useState<
    "Call script" | "Portal message" | "Email"
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
    if (!supabase || !ownerId) {
      setReferrals([]);
      setSyncError("Supabase is not configured for this deployment.");
      setDataReady(true);
      return;
    }

    let active = true;
    void supabase
      .from("referrals")
      .select("data")
      .eq("owner_id", ownerId)
      .order("created_at", { ascending: false })
      .then(({ data, error }) => {
        if (!active) return;
        if (error) {
          setReferrals([]);
          setSyncError(error.message);
        } else {
          setReferrals((data ?? []).map((row) => row.data as Referral));
          setSyncError("");
        }
        setDataReady(true);
      });

    return () => {
      active = false;
    };
  }, [ownerId]);

  useEffect(() => {
    if (!dataReady || !ownerId || !supabase || referrals.length === 0) return;
    void supabase
      .from("referrals")
      .upsert(
        referrals.map((referral) => ({
          owner_id: ownerId,
          referral_key: String(referral.id),
          data: referral,
        })),
        { onConflict: "owner_id,referral_key" },
      )
      .then(({ error }) => {
        setSyncError(error?.message ?? "");
      });
  }, [dataReady, ownerId, referrals]);

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
  const activeReferrals = referrals.filter((item) => !item.archived);
  const visibleReferrals = referrals.filter((item) => Boolean(item.archived) === showArchived);
  const sentRecorded =
    referral?.updates.some((u) => hasMilestone(u, "referral-sent")) ?? false;
  const receiptRecorded =
    referral?.updates.some((u) => hasMilestone(u, "referral-received")) ?? false;
  const confirmedReceived =
    referral?.updates.some(
      (u) =>
        hasMilestone(u, "referral-received") && u.source === "Specialist office",
    ) ?? false;
  const currentNextStep = referral ? nextStepFor(referral) : null;
  const outcomePreview = isOutcomeEventType(updateEventType)
    ? outcomeRecommendation(updateEventType, outcomeReason, outcomeSuggestedNextStep)
    : null;
  const latestReferralEvent = referral
    ? [...referral.updates]
        .filter((update) => update.eventType || update.milestone || update.milestones?.length)
        .sort((a, b) => b.id - a.id)[0]
    : undefined;
  const status = useMemo(() => {
    if (confirmedReceived) return "Specialist office confirmation recorded";
    if (receiptRecorded) return "Receipt update recorded";
    if (sentRecorded) return "Waiting for receipt";
    return "Not confirmed yet";
  }, [confirmedReceived, receiptRecorded, sentRecorded]);
  const receiptConfirmedCount = activeReferrals.filter((item) =>
    item.updates.some(
      (update) =>
        hasMilestone(update, "referral-received") &&
        update.source === "Specialist office",
    ),
  ).length;
  const readyToScheduleCount = activeReferrals.filter((item) =>
    item.updates.some((update) => hasMilestone(update, "ready-to-schedule")),
  ).length;
  const followUpCount = activeReferrals.filter(
    (item) =>
      !item.updates.some((update) => hasMilestone(update, "ready-to-schedule")),
  ).length;
  const nextReferral = activeReferrals[0];
  const nextStep = nextReferral ? nextStepFor(nextReferral) : null;
  const latestUpdates = activeReferrals
    .flatMap((item) =>
      item.updates.map((update) => ({ referral: item, update })),
    )
    .sort((a, b) => b.update.id - a.update.id)
    .slice(0, 4);

  function navigateDashboard(page: DashboardPage) {
    setSelected(null);
    setDashboardPage(page);
    setMenuOpen(false);
    window.scrollTo({ top: 0, behavior: motionSafeScrollBehavior() });
  }

  async function savePreferredLanguage(language: AppLanguage) {
    setLanguage(language);
    setLanguageSaveState("Saving your preference…");
    if (!supabase) {
      setLanguageSaveState("Saved in this browser only.");
      return;
    }
    const { error } = await supabase.auth.updateUser({ data: { preferred_language: language } });
    setLanguageSaveState(error ? "Couldn’t save your language. Please try again." : "Default language saved to your account.");
  }

  function flash(message: string) {
    setToast(message);
    window.setTimeout(() => setToast(""), 2800);
  }

  function addUpdate(title = "", detail = "", source: Source = "You") {
    setUpdateTitle(title);
    setUpdateDetail(detail);
    setUpdateSource(source);
    setUpdateMilestones([]);
    setUpdateEventDate("");
    setUpdateEventType(null);
    setOutcomeReason("");
    setOutcomeSuggestedNextStep("");
    setModal("update");
  }

  function addQuickEvent(eventType: ReferralEventType, title: string) {
    setUpdateTitle(translateText(title, language));
    setUpdateDetail("");
    setUpdateSource(eventType === "specialist-declined" ? "Specialist office" : eventType === "insurance-denied" ? "Health plan" : eventType === "referral-redirected" ? "Referring office" : "You");
    setUpdateMilestones([]);
    setUpdateEventDate("");
    setOutcomeReason("");
    setOutcomeSuggestedNextStep("");
    setUpdateEventType(eventType);
    setModal("update");
  }

  function saveUpdate() {
    if (!referral || !updateTitle.trim()) return;
    const update = {
      id: Date.now(),
      title: updateTitle.trim(),
      detail: updateDetail.trim() || "No additional notes.",
      date: today,
      ...(updateEventDate ? { eventDate: new Date(`${updateEventDate}T12:00:00`).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) } : {}),
      source: updateSource,
      ...(updateMilestones.length ? { milestones: updateMilestones } : {}),
      ...(updateEventType ? { eventType: updateEventType } : updateMilestones.length ? {} : { eventType: "care-step" as const }),
      ...(isOutcomeEventType(updateEventType) && outcomeReason ? { outcomeReason } : {}),
      ...(isOutcomeEventType(updateEventType) && outcomeSuggestedNextStep.trim() ? { outcomeSuggestion: outcomeSuggestedNextStep.trim() } : {}),
    };
    setReferrals((all) =>
      all.map((r) =>
        r.id === referral.id ? { ...r, updates: [...r.updates, update] } : r,
      ),
    );
    setModal(null);
    flash("Update added to your referral.");
  }

  function startToolkitDraft(recipient: string, question: string, target: Referral) {
    setSelected(target.id);
    setMessageKind("Call script");
    const localizedRecipient = recipient === "your health plan" && language !== "en"
      ? translateText(recipient, language)
      : recipient;
    setMessageDraft(localizedDraft(language, "Call script", localizedRecipient, target.specialty, question));
    setCopied(false);
    setInlineDraftId(target.id);
    setModal(null);
  }

  function startMessage(
    kind: "Call script" | "Portal message" | "Email" = "Call script",
    target: Referral | undefined = referral,
    contextUpdateId?: number | null,
    placement: "next-step" | "care-step" = "next-step",
  ) {
    if (!target) return;
    setMessageKind(kind);
    const sent = target.updates.some((update) => hasMilestone(update, "referral-sent"));
    const received = target.updates.some((update) => hasMilestone(update, "referral-received") && update.source === "Specialist office");
    const ready = target.updates.some((update) => hasMilestone(update, "ready-to-schedule"));
    const appointmentScheduled = target.updates.some((update) => hasMilestone(update, "appointment-scheduled"));
    const latestEvent = [...target.updates]
      .filter((update) => update.eventType || update.milestone || update.milestones?.length)
      .sort((a, b) => b.id - a.id)[0];
    const contextUpdate = contextUpdateId === undefined
      ? latestEvent?.eventType ? latestEvent : undefined
      : contextUpdateId === null
        ? undefined
        : target.updates.find((update) => update.id === contextUpdateId);
    const recipient = contextUpdate
      ? recipientForUpdate(contextUpdate, target)
      : sent ? target.to : target.from;
    const question = contextUpdate
      ? contextualQuestionFor(contextUpdate)
      : appointmentScheduled
        ? "What should I bring or prepare before the appointment?"
        : ready
          ? "Could you help me find an appointment time?"
          : received
            ? "What do I need before scheduling an appointment?"
            : sent
              ? `Could you confirm whether you received my ${target.specialty} referral?`
              : `Could you confirm whether you sent my ${target.specialty} referral?`;
    const localizedRecipient = recipient === "your health plan" && language !== "en"
      ? translateText(recipient, language)
      : recipient;
    setMessageDraft(localizedDraft(language, kind, localizedRecipient, target.specialty, question));
    setCopied(false);
    setInlineDraftId(target.id);
    setInlineDraftContextId(contextUpdate?.id ?? null);
    setInlineDraftPlacement(placement);
    setModal(null);
  }

  function draftContactRecipient(target: Referral) {
    const update = inlineDraftContextId === null
      ? undefined
      : target.updates.find((item) => item.id === inlineDraftContextId);
    return update ? recipientForUpdate(update, target) : undefined;
  }

    function logContactAttempt(target: Referral, officeOverride?: string) {
    const sent = target.updates.some(
      (update) => hasMilestone(update, "referral-sent"),
    );
    const office = officeOverride || (sent ? target.to : target.from);
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
    window.requestAnimationFrame(() => document.querySelector(".timeline-card")?.scrollIntoView({ behavior: motionSafeScrollBehavior(), block: "center" }));
    flash("Contact attempt added to your activity. Referral status is unchanged.");
  }

  function openNewReferral() {
    if (demoMode) {
      setReferrals([]);
      setDemoMode(false);
    }
    setSelected(null);
    setEditingReferralId(null);
    setNewSpecialty("");
    setNewFrom("");
    setNewTo("");
    setNewDate("");
    setModal("new");
  }

  function openEditReferral(item: Referral) {
    setEditingReferralId(item.id);
    setNewSpecialty(item.specialty);
    setNewFrom(item.from);
    setNewTo(item.to);
    setNewDate("");
    setModal("new");
  }

  async function deleteReferral(item: Referral) {
    setReferrals((all) => all.filter((referralItem) => referralItem.id !== item.id));
    if (supabase && ownerId) {
      const { error } = await supabase.from("referrals").delete()
        .eq("owner_id", ownerId)
        .eq("referral_key", String(item.id));
      if (error) setSyncError(error.message);
    }
    flash("Referral deleted.");
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
    if (editingReferralId !== null) {
      setReferrals((all) => all.map((item) => item.id === editingReferralId ? {
        ...item,
        specialty: newSpecialty.trim(),
        from: newFrom.trim() || "Referring office not added",
        to: newTo.trim() || "Specialist office not added",
      } : item));
      setModal(null);
      setEditingReferralId(null);
      setNewSpecialty(""); setNewFrom(""); setNewTo(""); setNewDate("");
      flash("Referral details updated.");
      return;
    }
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

  if (!dataReady)
    return (
      <main className="auth-loading" role="status">
        Loading your referrals…
      </main>
    );

  if (selected !== null && referral)
    return (
      <div className="app-shell dashboard-shell">
        <header className="topbar">
          <button
            type="button"
            className="brand brand-home"
            aria-label="Referral Navigator home"
            onClick={() => navigateDashboard("overview")}
          >
            <span className="brand-mark"><HeartHandshake size={20} /></span>
            <span>Referral Navigator</span>
          </button>
          <nav className="nav dashboard-nav" aria-label="Dashboard navigation">
            <p className="sidebar-nav-label">YOUR SPACE</p>
            <button
              className={dashboardPage === "overview" ? "nav-active" : ""}
              aria-current={dashboardPage === "overview" ? "page" : undefined}
              onClick={() => navigateDashboard("overview")}
            >
              <Home size={17} /> Overview
            </button>
            <button
              className={dashboardPage === "referrals" ? "nav-active" : ""}
              aria-current={dashboardPage === "referrals" ? "page" : undefined}
              onClick={() => navigateDashboard("referrals")}
            >
              <ClipboardList size={17} /> My referrals
              <span className="sidebar-count">{activeReferrals.length}</span>
            </button>
            <button
              className={dashboardPage === "next-steps" ? "nav-active" : ""}
              aria-current={dashboardPage === "next-steps" ? "page" : undefined}
              onClick={() => navigateDashboard("next-steps")}
            >
              <MessageCircle size={17} /> Next steps
            </button>
            <button
              onClick={() => setModal("help")}
            >
              <CircleHelp size={17} /> How it works
            </button>
          </nav>
          <div className="top-actions">
            <span className="privacy-chip" title="Your referral updates are saved to your account.">
              <CircleHelp size={14} /> Saved to your account
            </span>
            <button type="button" className="account-signout" onClick={() => setModal("settings")}><Settings size={15} /> Settings</button>
            <button type="button" className="account-signout" onClick={() => void signOut()}>
              Sign out
            </button>
            <HeaderMenu
              open={menuOpen}
              menuRef={menuRef}
              onToggle={() => setMenuOpen((open) => !open)}
              onHome={() => navigateDashboard("overview")}
              onReferrals={() => navigateDashboard("referrals")}
              onNextSteps={() => navigateDashboard("next-steps")}
              onAddReferral={() => { setMenuOpen(false); openNewReferral(); }}
              onHelp={() => { setMenuOpen(false); setModal("help"); }}
              referralCount={activeReferrals.length}
            />
          </div>
        </header>
        <main className="detail-wrap">
          {syncError && (
            <div className="storage-warning" role="alert">
              We couldn’t sync your referrals. {syncError}
            </div>
          )}
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
              className={`status-pill ${confirmedReceived ? "status-green" : "status-amber"}`}
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

          <section className="section-card journey-card journey-combined">
            <div className="section-title-row journey-header">
              <div>
                <p className="eyebrow">{translateText("THE HANDOFF", language)}</p>
                <h2>{translateText("Your referral journey", language)}</h2>
                <p className="journey-summary">
                  {translateText("Common checkpoints and your updates, together in one timeline. Add what happened when it happens. Steps can repeat or continue after a visit.", language)}
                </p>
              </div>
              <button
                type="button"
                className="primary-button add-update-button"
                onClick={() => addUpdate()}
              >
                <Plus size={18} aria-hidden="true" />
                {translateText("Add a step", language)}
              </button>
            </div>

            <ol className="referral-journey-list" aria-label={translateText("Referral journey, oldest updates first", language)}>
              <li className="journey-event journey-start">
                <span className="journey-event-marker" aria-hidden="true"><Check size={15} /></span>
                <div className="journey-event-body">
                  <span className="journey-date">{referral.date}</span>
                  <h3>{translateText("Recommendation", language)}</h3>
                  <p>{translateText("A clinician recommended specialist care. This is the starting point for the referral you are tracking.", language)}</p>
                  <span className="source-tag">{translateText("Starting point · You entered this", language)}</span>
                </div>
              </li>
              {[...referral.updates]
                .filter((update) => !["Referral added to your tracker", "Specialist recommended"].includes(update.title))
                .sort((a, b) => updateTimestamp(a) - updateTimestamp(b) || a.id - b.id)
                .map((update) => (
                  <li className="journey-event" key={update.id}>
                    <span className="journey-event-marker" aria-hidden="true">
                      {update.milestone || update.milestones?.length ? <Check size={15} /> : <span />}
                    </span>
                    <div className="journey-event-body">
                      <div className="journey-event-heading">
                        <div>
                          <span className="journey-date">
                            {update.eventDate ? <>{translateText("Happened", language)} {update.eventDate} · {translateText("recorded", language)} {update.date}</> : update.date}
                          </span>
                          <h3>{update.title}</h3>
                        </div>
                        <span className={update.source === "You" ? "source-tag" : "source-tag source-tag-office"}>
                          {update.source === "You"
                            ? translateText("You entered this", language)
                            : `${translateText("You recorded", language)} · ${translateText(update.source, language)}`}
                        </span>
                      </div>
                      <p>{update.detail}</p>
                      {update.outcomeReason && <p className="outcome-event-context"><strong>{translateText("Reason shared", language)}:</strong> {translateText(update.outcomeReason, language)}</p>}
                      {update.outcomeSuggestion && <p className="outcome-event-context"><strong>{translateText("Next step mentioned", language)}:</strong> {update.outcomeSuggestion}</p>}
                      <div className="journey-event-actions">
                        <button
                          type="button"
                          className="care-step-script-button"
                          onClick={() => startMessage("Call script", referral, update.id, "care-step")}
                        >
                          <Phone size={16} /> {translateText("Prepare a call script", language)}
                        </button>
                      </div>
                      {inlineDraftId === referral.id &&
                        inlineDraftPlacement === "care-step" &&
                        inlineDraftContextId === update.id && (
                          <InlineDraftPanel
                            kind={messageKind}
                            draft={messageDraft}
                            copied={copied}
                            contextual
                            onKindChange={(kind) => startMessage(kind, referral, update.id, "care-step")}
                            onDraftChange={setMessageDraft}
                            onCopy={copyDraft}
                            onContact={() => logContactAttempt(referral, draftContactRecipient(referral))}
                            onClose={() => setInlineDraftId(null)}
                          />
                        )}
                    </div>
                  </li>
                ))}
            </ol>

            <section className="journey-next" aria-labelledby="journey-next-title">
              <div className="journey-next-marker" aria-hidden="true" />
              <div className="journey-next-content">
                <p className="eyebrow">{translateText("UP NEXT · A POSSIBLE NEXT STEP", language)}</p>
                <h3 id="journey-next-title">{translateText(currentNextStep?.title ?? "Check whether it was sent", language)}</h3>
                <p>{translateText(currentNextStep?.detail ?? "", language)}</p>
                <p className="journey-suggestion-note">
                  {translateText("This suggestion uses the details you entered. Confirm the next step with the relevant office.", language)}
                </p>
                <div className="journey-next-actions">
                  <button type="button" className="secondary-button" onClick={() => addUpdate()}>
                    <Plus size={16} /> {translateText("Record an update", language)}
                  </button>
                  <button
                    type="button"
                    className="primary-button"
                    onClick={() => startMessage("Call script", referral, latestReferralEvent?.id ?? null, "next-step")}
                  >
                    <Phone size={16} /> {translateText("Prepare a call script", language)}
                  </button>
                </div>
                {inlineDraftId === referral.id && inlineDraftPlacement === "next-step" && (
                  <InlineDraftPanel
                    kind={messageKind}
                    draft={messageDraft}
                    copied={copied}
                    contextual={inlineDraftContextId !== null}
                    onKindChange={(kind) => startMessage(kind, referral, inlineDraftContextId, inlineDraftPlacement)}
                    onDraftChange={setMessageDraft}
                    onCopy={copyDraft}
                    onContact={() => logContactAttempt(referral, draftContactRecipient(referral))}
                    onClose={() => setInlineDraftId(null)}
                  />
                )}
              </div>
            </section>
          </section>

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
                    id="update-title"
                    aria-describedby="update-title-help"
                    required
                    value={updateTitle}
                    onChange={(e) => setUpdateTitle(e.target.value)}
                    placeholder="e.g. Called to ask if referral was sent"
                  />
                </label>
                <p className="quick-log-hint" id="update-title-help">
                  {translateText("Enter a short summary before saving.", language)}
                </p>
                <div className="quick-log-label">{translateText("Select any referral steps you know have happened", language)}</div>
                <div className="quick-log-options" role="group" aria-label="Select confirmed referral steps">
                  {([
                    ["referral-sent", "Referral sent"],
                    ["referral-received", "Referral received"],
                    ["ready-to-schedule", "Ready to schedule"],
                    ["appointment-scheduled", "Appointment scheduled"],
                  ] as const).map(([value, label]) => (
                    <button
                      type="button"
                      aria-pressed={updateMilestones.includes(value)}
                      className={updateMilestones.includes(value) ? "selected" : ""}
                      key={value}
                      onClick={() => {
                        const next = updateMilestones.includes(value)
                          ? updateMilestones.filter((item) => item !== value)
                          : [...updateMilestones, value];
                        setUpdateMilestones(next);
                        setUpdateEventType(null);
                        setOutcomeReason("");
                        setOutcomeSuggestedNextStep("");
                        setUpdateTitle(next.length > 1 ? translateText("Referral progress update", language) : next.length === 1 ? translateText(label, language) : "");
                      }}
                    >
                      {updateMilestones.includes(value) && <Check size={14} />}{translateText(label, language)}
                    </button>
                  ))}
                </div>
                <div className="quick-log-label">{translateText("Common events", language)}</div>
                <div className="quick-log-options" role="group" aria-label={translateText("Common events", language)}>
                  {([
                    ["records-requested", "Records requested"],
                    ["records-sent", "Records sent"],
                    ["follow-up-recommended", "Follow-up visit recommended"],
                    ["visit-completed", "Visit completed"],
                    ["specialist-declined", "Specialist could not accept"],
                    ["insurance-denied", "Insurance authorization denied"],
                    ["referral-redirected", "Referral redirected"],
                    ["care-step", "Other care step"],
                  ] as const).map(([eventType, title]) => (
                    <button
                      type="button"
                      aria-pressed={updateEventType === eventType}
                      className={updateEventType === eventType ? "selected" : ""}
                      key={eventType}
                      onClick={() => addQuickEvent(eventType, title)}
                    >
                      {translateText(title, language)}
                    </button>
                  ))}
                </div>
                {outcomePreview && isOutcomeEventType(updateEventType) && (
                  <details className="outcome-questionnaire" open key={updateEventType}>
                    <summary>{translateText("Add optional details to tailor next steps", language)}</summary>
                    <div className="outcome-questionnaire-content">
                      <p className="quick-log-hint">{translateText("Skip anything you don’t know. These answers help suggest questions; they don’t determine coverage or who is responsible.", language)}</p>
                      <label>
                        {translateText("What reason did they give?", language)}
                        <select value={outcomeReason} onChange={(e) => setOutcomeReason(e.target.value)}>
                          <option value="">{translateText("Choose if you know", language)}</option>
                          {outcomeReasonOptions(updateEventType).map((reason) => (
                            <option key={reason} value={reason}>{translateText(reason, language)}</option>
                          ))}
                        </select>
                      </label>
                      <label>
                        {translateText(updateEventType === "referral-redirected" ? "Where was it redirected, or what did they tell you?" : "Did they suggest a next step?", language)}
                        <textarea
                          value={outcomeSuggestedNextStep}
                          onChange={(e) => setOutcomeSuggestedNextStep(e.target.value)}
                          placeholder={translateText(updateEventType === "referral-redirected" ? "e.g. The referring office will send it to another specialist" : "e.g. Send more records or contact another office", language)}
                          rows={2}
                        />
                      </label>
                      <div className="outcome-guidance" aria-live="polite">
                        <p className="eyebrow">{translateText("Possible next step", language)}</p>
                        <strong>{translateText(outcomePreview.title, language)}</strong>
                        <p>{translateText(outcomePreview.detail, language)}</p>
                        <p className="outcome-guidance-note">{translateText("Confirm the options with the office or health plan. Referral Navigator can’t verify the decision.", language)}</p>
                      </div>
                    </div>
                  </details>
                )}
                {updateMilestones.length > 1 && <p className="quick-log-hint">{translateText("Use these together only when the same source confirmed each step. Record separate updates if different offices confirmed them.", language)}</p>}
                <label>
                  {translateText("Who did this update come from?", language)}
                  <select
                    value={updateSource}
                    onChange={(e) => setUpdateSource(e.target.value as Source)}
                  >
                    <option>{translateText("You", language)}</option>
                    <option>{translateText("Referring office", language)}</option>
                    <option>{translateText("Specialist office", language)}</option>
                    <option>{translateText("Health plan", language)}</option>
                  </select>
                </label>
                <label>
                  <span>When did this happen? <span className="optional-label">Optional</span></span>
                  <input type="date" value={updateEventDate} onChange={(e) => setUpdateEventDate(e.target.value)} />
                </label>
                <label>
                  Notes
                  <textarea
                    value={updateDetail}
                    onChange={(e) => setUpdateDetail(e.target.value)}
                    placeholder={translateText("Add details, names, or reference numbers if useful.", language)}
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
                  disabled={!updateTitle.trim()}
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
            onClick={() => navigateDashboard("overview")}
        >
          <span className="brand-mark">
            <HeartHandshake size={20} />
          </span>
          <span>Referral Navigator</span>
        </button>
        <nav className="nav dashboard-nav" aria-label="Dashboard navigation">
          <p className="sidebar-nav-label">YOUR SPACE</p>
          <button
            className={dashboardPage === "overview" ? "nav-active" : ""}
            aria-current={dashboardPage === "overview" ? "page" : undefined}
            onClick={() => navigateDashboard("overview")}
          >
            <Home size={17} /> Overview
          </button>
          <button
            className={dashboardPage === "referrals" ? "nav-active" : ""}
            aria-current={dashboardPage === "referrals" ? "page" : undefined}
            onClick={() => navigateDashboard("referrals")}
          >
            <ClipboardList size={17} /> My referrals
            <span className="sidebar-count">{activeReferrals.length}</span>
          </button>
          <button
            className={dashboardPage === "next-steps" ? "nav-active" : ""}
            aria-current={dashboardPage === "next-steps" ? "page" : undefined}
            onClick={() => navigateDashboard("next-steps")}
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
          <span className="privacy-chip" title="Your referral updates are saved to your account.">
            <CircleHelp size={14} /> Saved to your account
          </span>
          <button type="button" className="account-signout" onClick={() => setModal("settings")}><Settings size={15} /> Settings</button>
          <button type="button" className="account-signout" onClick={() => void signOut()}>
            Sign out
          </button>
          <HeaderMenu
            open={menuOpen}
            menuRef={menuRef}
            onToggle={() => setMenuOpen((open) => !open)}
            onHome={() => navigateDashboard("overview")}
            onReferrals={() => navigateDashboard("referrals")}
            onNextSteps={() => navigateDashboard("next-steps")}
            onAddReferral={() => {
              setMenuOpen(false);
              openNewReferral();
            }}
            onHelp={() => {
              setMenuOpen(false);
              setModal("help");
            }}
            referralCount={activeReferrals.length}
          />
        </div>
      </header>
      <main className="dashboard-wrap" id="dashboard-overview">
        {dashboardPage !== "overview" && <div className="dashboard-page-heading">
          <div>
            <p className="eyebrow">{dashboardPage === "referrals" ? "YOUR CARE, ORGANIZED" : "A CLEAR NEXT STEP"}</p>
            <h1>{dashboardPage === "referrals" ? "Your referrals" : "Next steps"}</h1>
            <p>{dashboardPage === "referrals" ? "Keep each specialist handoff and its updates together." : "Follow up across your referrals, at your own pace."}</p>
          </div>
          {dashboardPage === "referrals" && <button className="primary-button add-button" onClick={openNewReferral}><Plus size={17} /> Add a referral</button>}
        </div>}
        {dashboardPage === "overview" && <>
        <section className="welcome">
          <div>
            <p className="eyebrow">YOUR CARE, ORGANIZED</p>
            <h1>Keep your referral moving.</h1>
            <p>
              Know what you’ve heard, what’s still unclear, and who to contact
              next.
            </p>
            <button className="primary-button overview-add-cta" onClick={openNewReferral}>
              <Plus size={18} /> Add a referral
            </button>
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
        <section className="dashboard-stats" aria-label="Referral summary">
          <article className="summary-card summary-coral">
            <div className="summary-card-top">
              <ClipboardList size={17} />
              <span>IN YOUR TRACKER</span>
            </div>
            <strong>{activeReferrals.length}</strong>
            <p>Referral{activeReferrals.length === 1 ? "" : "s"} in your tracker</p>
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
        <section className="overview-next-step">
          <div className="overview-next-icon"><MessageCircle size={20} /></div>
          <div className="overview-next-copy">
            <p className="eyebrow">YOUR NEXT STEP</p>
            <h2>{nextStep?.title ?? "Add your first referral"}</h2>
            <p>{nextStep?.detail ?? "Start with what your clinician recommended. You can fill in office details later."}</p>
            {nextReferral && <small>For {nextReferral.specialty} · Based on updates you recorded</small>}
          </div>
          <div className="overview-next-actions">
            {nextReferral ? <button className="primary-button" onClick={() => startMessage("Call script", nextReferral)}><Phone size={16} /> Prepare a call script</button> : <button className="primary-button" onClick={openNewReferral}><Plus size={16} /> Add a referral</button>}
            <button className="text-button" onClick={() => navigateDashboard("next-steps")}>All next steps <ArrowRight size={15} /></button>
          </div>
          {nextReferral && inlineDraftId === nextReferral.id && inlineDraftPlacement === "next-step" && <div className="overview-inline-draft"><InlineDraftPanel kind={messageKind} draft={messageDraft} copied={copied} contextual={inlineDraftContextId !== null} onKindChange={(kind) => startMessage(kind, nextReferral, latestReferralEvent?.id ?? null, "next-step")} onDraftChange={setMessageDraft} onCopy={copyDraft} onContact={() => logContactAttempt(nextReferral)} onClose={() => setInlineDraftId(null)} /></div>}
        </section>
        </>}

        {dashboardPage === "referrals" && <section className="dashboard-section" id="dashboard-referrals">
          <div className="referral-list-controls" role="group" aria-label="Referral list filter">
            <button type="button" className={!showArchived ? "is-selected" : ""} aria-pressed={!showArchived} onClick={() => setShowArchived(false)}>Active <span>{activeReferrals.length}</span></button>
            <button type="button" className={showArchived ? "is-selected" : ""} aria-pressed={showArchived} onClick={() => setShowArchived(true)}>Archived <span>{referrals.length - activeReferrals.length}</span></button>
          </div>
          <p className="referrals-source-note"><ShieldCheck size={15} /> Updates are entered by you and labeled by source.</p>
          {visibleReferrals.length === 0 ? (
            <div className="empty-state">
              <span className="empty-icon">
                {showArchived ? <Archive size={24} /> : <Stethoscope size={24} />}
              </span>
              <h3>{showArchived ? "No archived referrals" : "No referrals yet"}</h3>
              <p>
                {showArchived ? "Referrals you archive will be kept here, so you can restore them later." : "Add a referral to keep the next steps and office details together."}
              </p>
              {!showArchived && <button
                className="primary-button"
                onClick={openNewReferral}
              >
                <Plus size={17} /> Add your first referral
              </button>}
            </div>
          ) : (
            <div className="referral-list-layout">
              <div className="referral-grid">
                {visibleReferrals.map((r) => {
                  const receipt = r.updates.some(
                    (u) => hasMilestone(u, "referral-received"),
                  );
                  const officeConfirmed = r.updates.some(
                    (u) =>
                      hasMilestone(u, "referral-received") &&
                      u.source === "Specialist office",
                  );
                  const sent = r.updates.some(
                    (u) => hasMilestone(u, "referral-sent"),
                  );
                  return (
                    <article className="referral-card" key={r.id}>
                      <div className="card-top">
                        <span className="specialty-icon">
                          <Stethoscope size={19} />
                        </span>
                        <span
                          className={`status-pill ${officeConfirmed ? "status-green" : "status-amber"}`}
                        >
                          <span className="status-dot" />
                          {officeConfirmed
                            ? "Specialist confirmation recorded"
                            : receipt
                              ? "Receipt update recorded"
                              : sent
                                ? "Waiting for receipt"
                                : "Not confirmed yet"}
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
                          {officeConfirmed
                            ? "You recorded that the specialist office confirmed receipt."
                            : receipt
                              ? "You recorded a receipt update. Check the source in your timeline."
                              : sent
                                ? "You recorded that the referring office sent it. Receipt is still unknown."
                                : "Referral sending and receipt haven’t been confirmed yet."}
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
                        onClick={() => { setDashboardPage("referrals"); setSelected(r.id); }}
                      >
                        View full referral <ArrowRight size={17} />
                      </button>
                      <div className="referral-manage-actions" aria-label={`${r.specialty} actions`}>
                        <button type="button" onClick={() => openEditReferral(r)}><Pencil size={14} /> Edit</button>
                        <button type="button" onClick={() => setReferrals((all) => all.map((item) => item.id === r.id ? { ...item, archived: !r.archived } : item))}><Archive size={14} /> {r.archived ? "Restore" : "Archive"}</button>
                        <button type="button" className="delete-action" onClick={() => {
                          if (window.confirm(`Permanently delete the ${r.specialty} referral and its saved updates? This can’t be undone.`)) void deleteReferral(r);
                        }}><Trash2 size={14} /> Delete</button>
                      </div>
                    </article>
                  );
                })}
              </div>
            </div>
          )}
        </section>}
        {dashboardPage === "next-steps" && <section className="next-steps-page" aria-label="Open next steps">
          {activeReferrals.length === 0 ? <div className="empty-state"><span className="empty-icon"><MessageCircle size={24} /></span><h2>No next steps yet</h2><p>Add a referral and your follow-up questions will appear here.</p><button className="primary-button" onClick={openNewReferral}><Plus size={17} /> Add a referral</button></div> : activeReferrals.map((item) => {
            const action = nextStepFor(item);
            const latestItemEvent = [...item.updates].filter((update) => update.eventType || update.milestone || update.milestones?.length).sort((a, b) => b.id - a.id)[0];
            return <article className="next-step-card" key={item.id}>
              <div className="next-step-card-main"><span className="guide-icon"><MessageCircle size={18} /></span><div><p className="eyebrow">{item.specialty}</p><h2>{action.title}</h2><p>{action.detail}</p><small>Based on the updates you recorded. Confirm details with the relevant office.</small></div></div>
              <div className="next-step-card-actions"><button className="primary-button" onClick={() => startMessage("Call script", item, latestItemEvent?.id, "next-step")}><Phone size={16} /> Prepare a call script</button><button className="secondary-button" onClick={() => { setDashboardPage("referrals"); setSelected(item.id); }}>Open referral <ArrowRight size={15} /></button></div>
              {inlineDraftId === item.id && inlineDraftPlacement === "next-step" && <InlineDraftPanel kind={messageKind} draft={messageDraft} copied={copied} contextual={inlineDraftContextId !== null} onKindChange={(kind) => startMessage(kind, item, latestItemEvent?.id, "next-step")} onDraftChange={setMessageDraft} onCopy={copyDraft} onContact={() => logContactAttempt(item)} onClose={() => setInlineDraftId(null)} />}
            </article>;
          })}
        </section>}
        {dashboardPage === "overview" && <section className="dashboard-lower-grid">
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
          <article className="dashboard-lower-card reminders-card toolkit-card">
            <div className="lower-card-heading">
              <div>
                <p className="eyebrow">{translateText("REFERRAL TOOLKIT", language)}</p>
                <h2>{translateText("Who can help with the next step?", language)}</h2>
              </div>
              <span className="reminder-icon"><ClipboardList size={17} /></span>
            </div>
            {referral ? (
              <div className="toolkit-items">
                <button className="toolkit-item" onClick={() => startToolkitDraft(referral.from, "Could you confirm whether you sent my referral and when it was sent?", referral)}>
                  <span className="toolkit-icon"><Building2 size={17} /></span>
                  <span className="toolkit-copy">
                    <strong>{translateText("Referring office", language)}</strong>
                    <small>{translateText("Find contact details on your visit summary; ask when and where it was sent.", language)}</small>
                    <em>{translateText("Prepare a call script", language)} <ArrowRight size={13} /></em>
                  </span>
                </button>
                <button className="toolkit-item" onClick={() => startToolkitDraft(referral.to, "Could you confirm whether you received my referral and tell me if anything else is needed before scheduling?", referral)}>
                  <span className="toolkit-icon"><Stethoscope size={17} /></span>
                  <span className="toolkit-copy">
                    <strong>{translateText("Specialist office", language)}</strong>
                    <small>{translateText("Use the referral paperwork or clinic directory to confirm receipt and scheduling steps.", language)}</small>
                    <em>{translateText("Prepare a call script", language)} <ArrowRight size={13} /></em>
                  </span>
                </button>
                <button className="toolkit-item" onClick={() => startToolkitDraft("your health plan", "Is this specialist in my network, and does this visit need a referral or prior authorization?", referral)}>
                  <span className="toolkit-icon"><ShieldCheck size={17} /></span>
                  <span className="toolkit-copy">
                    <strong>{translateText("Health plan", language)}</strong>
                    <small>{translateText("Use member services on your insurance card or plan portal to check network and authorization.", language)}</small>
                    <em>{translateText("Prepare a call script", language)} <ArrowRight size={13} /></em>
                  </span>
                </button>
              </div>
            ) : (
              <p className="lower-card-empty">{translateText("Add a referral to see questions tailored to your next step.", language)}</p>
            )}
            <p className="toolkit-note">
              <ShieldCheck size={14} /> {translateText("These are questions to verify with each office or your health plan. Coverage and referral status are not checked automatically.", language)}
            </p>
          </article>
        </section>}
        <section className="bottom-callout">
          <span className="callout-icon">
            <ShieldCheck size={19} />
          </span>
          <div>
            <strong>Patient-owned, with no automatic status checks</strong>
            <p>
              Your referral updates are saved to your private account.
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
          title={modal === "settings" ? "Settings" : modal === "new" ? editingReferralId !== null ? "Edit referral" : "Add a referral" : "A little guidance"}
          onClose={() => setModal(null)}
        >
          {modal === "settings" ? (
            <div className="form-body settings-body">
              <p className="modal-intro">
                {translateText("Manage your language preference and the account that stores your referrals.", language)}
              </p>
              <section className="settings-panel" aria-labelledby="settings-language-heading">
                <h3 id="settings-language-heading">{translateText("Language preference", language)}</h3>
                <p>{translateText("Choose the language used across the app. It applies immediately and is saved as your default.", language)}</p>
                <LanguageToggle onChange={(nextLanguage) => void savePreferredLanguage(nextLanguage)} />
                <p className="settings-panel-note">
                  {translateText("Changing the language updates app labels. It does not translate referral names or notes you entered.", language)}
                </p>
              </section>
              <section className="settings-panel" aria-labelledby="settings-account-heading">
                <h3 id="settings-account-heading">{translateText("Your account", language)}</h3>
                <p className="settings-account-email">
                  <span>{translateText("Signed in as", language)}</span>{" "}
                  <strong>{user?.email ?? translateText("Account details unavailable", language)}</strong>
                </p>
                <p className="settings-panel-note">
                  {translateText("Referral details are saved to this account. The app doesn’t contact offices or verify referral status or insurance coverage.", language)}
                </p>
              </section>
              {languageSaveState && <p className="settings-save-state" role="status" aria-live="polite">{translateText(languageSaveState, language)}</p>}
              <button type="button" className="primary-button full" onClick={() => setModal(null)}>
                {translateText("Done", language)}
              </button>
            </div>
          ) : modal === "new" ? (
            <form className="form-body" onSubmit={createReferral}>
              <p className="modal-intro">{editingReferralId !== null ? "Update the referral details in your tracker." : "Add what you know after a clinician recommends specialist care. You can fill in the rest later."}</p>
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
              {editingReferralId === null && <label>
                Date recommended
                <input type="date" value={newDate} onChange={(e) => setNewDate(e.target.value)} />
              </label>}
              <p className="helper-note">
                <ShieldCheck size={15} /> Adding a referral only saves it in
                your tracker. Nothing is sent to an office.
              </p>
              <button className="primary-button full" type="submit">
                {editingReferralId !== null ? "Save changes" : "Add to my referrals"}
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

function AuthenticatedApp() {
  const { loading, user } = useAuth();
  const { setLanguage } = useAppLanguage();
  const [authMode, setAuthMode] = useState<"sign-in" | "sign-up" | null>(null);

  useEffect(() => {
    const preferred = user?.user_metadata?.preferred_language;
    if (preferred === "en" || preferred === "ja" || preferred === "zh" || preferred === "es" || preferred === "vi") {
      setLanguage(preferred);
    }
  }, [user?.id, setLanguage]);

  if (loading) {
    return <main className="auth-loading" role="status">Checking your session…</main>;
  }
  if (!user) {
    if (authMode === null) {
      return (
        <LandingPage
          onSignIn={() => setAuthMode("sign-in")}
          onGetStarted={() => setAuthMode("sign-up")}
        />
      );
    }
    return (
      <SignIn
        key={authMode}
        initialMode={authMode}
        onBack={() => setAuthMode(null)}
      />
    );
  }
  return <ReferralNavigatorApp key={user.id} />;
}

export default function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <AuthenticatedApp />
      </AuthProvider>
    </LanguageProvider>
  );
}

