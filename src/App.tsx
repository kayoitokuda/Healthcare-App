import {
  useEffect,
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
  Settings,
  Stethoscope,
  X,
} from "lucide-react";
import { AuthProvider, useAuth } from "./auth/AuthContext";
import SignIn from "./pages/SignIn";
import { supabase } from "./lib/supabase";
import { LanguageProvider, LanguageToggle, localizedDraft, translateText, useAppLanguage, type AppLanguage } from "./i18n";

type Source = "You" | "Referring office" | "Specialist office" | "Health plan";
type Milestone = "referral-sent" | "referral-received" | "ready-to-schedule";
type Update = {
  id: number;
  title: string;
  detail: string;
  date: string;
  source: Source;
  milestone?: Milestone;
  milestones?: Milestone[];
  eventDate?: string;
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
    ],
    done: [],
    notes: "",
  },
];

const steps: Array<{ title: string; copy: string; milestone?: Milestone }> = [
  { title: "Recommendation", copy: "A clinician suggests specialist care" },
  { title: "Referral sent", copy: "Check with the referring office", milestone: "referral-sent" },
  { title: "Receipt confirmed", copy: "Check with the specialist’s office", milestone: "referral-received" },
  { title: "Ready to schedule", copy: "Ask how to book your visit", milestone: "ready-to-schedule" },
];

function nextStepFor(referral: Referral) {
  const sent = referral.updates.some(
    (update) => hasMilestone(update, "referral-sent"),
  );
  const received = referral.updates.some(
    (update) =>
      hasMilestone(update, "referral-received") &&
      update.source === "Specialist office",
  );
  const ready = referral.updates.some(
    (update) => hasMilestone(update, "ready-to-schedule"),
  );

  if (!sent) {
    return {
      title: "Check whether it was sent",
      detail:
        "Ask " + referral.from + " whether the referral was sent to " + referral.to + ".",
    };
  }
  if (!received) {
    return {
      title: "Confirm it arrived",
      detail:
        "Ask " + referral.to + " whether they received the referral and need anything else.",
    };
  }
  if (!ready) {
    return {
      title: "Ask how to schedule",
      detail: "Contact " + referral.to + " to learn what you need before booking.",
    };
  }
  return {
    title: "Review your latest update",
    detail:
      "Open your referral tracker to see what you recorded and decide what comes next.",
  };
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
            window.scrollTo({ top: 0, behavior: "smooth" });
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
  onKindChange,
  onDraftChange,
  onCopy,
  onContact,
  onClose,
}: {
  kind: "Call script" | "Portal message" | "Email";
  draft: string;
  copied: boolean;
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
        Edit this draft for your situation. Nothing is sent from here.
      </p>
      <div className="segmented">
        {(["Call script", "Portal message", "Email"] as const).map((option) => (
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
  const [selected, setSelected] = useState<number | null>(null);
  const [modal, setModal] = useState<
    "new" | "update" | "notes" | "help" | "settings" | null
  >(null);
  const [updateTitle, setUpdateTitle] = useState("");
  const [updateDetail, setUpdateDetail] = useState("");
  const [updateSource, setUpdateSource] = useState<Source>("You");
  const [updateMilestones, setUpdateMilestones] = useState<Milestone[]>([]);
  const [updateEventDate, setUpdateEventDate] = useState("");
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
  const sentRecorded =
    referral?.updates.some((u) => hasMilestone(u, "referral-sent")) ?? false;
  const receiptRecorded =
    referral?.updates.some((u) => hasMilestone(u, "referral-received")) ?? false;
  const confirmedReceived =
    referral?.updates.some(
      (u) =>
        hasMilestone(u, "referral-received") && u.source === "Specialist office",
    ) ?? false;
  const readyRecorded =
    referral?.updates.some((u) => hasMilestone(u, "ready-to-schedule")) ?? false;
  const status = useMemo(() => {
    if (confirmedReceived) return "Specialist office confirmation recorded";
    if (receiptRecorded) return "Receipt update recorded";
    if (sentRecorded) return "Waiting for receipt";
    return "Not confirmed yet";
  }, [confirmedReceived, receiptRecorded, sentRecorded]);
  const receiptConfirmedCount = referrals.filter((item) =>
    item.updates.some(
      (update) =>
        hasMilestone(update, "referral-received") &&
        update.source === "Specialist office",
    ),
  ).length;
  const readyToScheduleCount = referrals.filter((item) =>
    item.updates.some((update) => hasMilestone(update, "ready-to-schedule")),
  ).length;
  const followUpCount = referrals.filter(
    (item) =>
      !item.updates.some((update) => hasMilestone(update, "ready-to-schedule")),
  ).length;
  const nextReferral = referrals[0];
  const nextStep = nextReferral ? nextStepFor(nextReferral) : null;
  const latestUpdates = referrals
    .flatMap((item) =>
      item.updates.map((update) => ({ referral: item, update })),
    )
    .sort((a, b) => b.update.id - a.update.id)
    .slice(0, 4);

  async function savePreferredLanguage(language: AppLanguage) {
    setLanguage(language);
    setLanguageSaveState("Saving your preference…");
    if (!supabase) {
      setLanguageSaveState("Saved in this browser only.");
      return;
    }
    const { error } = await supabase.auth.updateUser({ data: { preferred_language: language } });
    setLanguageSaveState(error ? `Could not save: ${error.message}` : "Default language saved to your account.");
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
    setModal("update");
  }

  function addMilestoneUpdate(milestone: Milestone) {
    const titles: Record<Milestone, string> = {
      "referral-sent": "Referral sent",
      "referral-received": "Referral received",
      "ready-to-schedule": "Ready to schedule",
    };
    setUpdateTitle(translateText(titles[milestone], language));
    setUpdateDetail("");
    setUpdateSource("You");
    setUpdateMilestones([milestone]);
    setUpdateEventDate("");
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
    kind: "Call script" | "Portal message" | "Email" = "Call script",
    target: Referral | undefined = referral,
  ) {
    if (!target) return;
    setMessageKind(kind);
    const sent = target.updates.some((update) => hasMilestone(update, "referral-sent"));
    const received = target.updates.some((update) => hasMilestone(update, "referral-received") && update.source === "Specialist office");
    const ready = target.updates.some((update) => hasMilestone(update, "ready-to-schedule"));
    const recipient = sent ? target.to : target.from;
    const question = ready
      ? "Could you help me find an appointment time?"
      : received
        ? "What do I need before scheduling an appointment?"
        : sent
          ? `Could you confirm whether you received my ${target.specialty} referral?`
          : `Could you confirm whether you sent my ${target.specialty} referral?`;
    setMessageDraft(localizedDraft(language, kind, recipient, target.specialty, question));
    setCopied(false);
    setInlineDraftId(target.id);
    setModal(null);
  }

  function logContactAttempt(target: Referral) {
    const sent = target.updates.some(
      (update) => hasMilestone(update, "referral-sent"),
    );
    const office = sent ? target.to : target.from;
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
    window.requestAnimationFrame(() => document.querySelector(".timeline-card")?.scrollIntoView({ behavior: "smooth", block: "center" }));
    flash("Contact attempt added to your activity. Referral status is unchanged.");
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

  if (!dataReady)
    return (
      <main className="auth-loading" role="status">
        Loading your referrals…
      </main>
    );

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
            <span
              className="privacy-chip"
              title="Your referral updates are saved to your account."
            >
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
        {syncError && (
          <div className="storage-warning" role="alert">
            We couldn’t sync your referrals. {syncError}
          </div>
        )}
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

          <section className="section-card journey-card">
            <div className="section-title-row">
              <div>
                <p className="eyebrow">THE HANDOFF</p>
                <h2>From recommendation to appointment</h2>
              </div>
              <button className="text-button" onClick={() => addUpdate()}>
                + Add update
              </button>
            </div>
            <div className="journey">
              {steps.map((step, i) => {
                const done =
                  i === 0 ||
                  (i === 1 && sentRecorded) ||
                  (i === 2 && receiptRecorded) ||
                  (i === 3 && readyRecorded);
                const active =
                  (!sentRecorded && i === 1) ||
                  (sentRecorded && !receiptRecorded && i === 2) ||
                  (receiptRecorded && !readyRecorded && i === 3);
                return (
                  <button
                    type="button"
                    className={`journey-step ${done ? "is-done" : ""} ${active ? "is-active" : ""}`}
                    key={step.title}
                    disabled={!step.milestone || done}
                    aria-label={step.milestone ? `${translateText("Tap to record", language)}: ${translateText(step.title, language)}` : step.title}
                    onClick={() => step.milestone && addMilestoneUpdate(step.milestone)}
                  >
                    <span className="journey-marker">
                      {done ? <Check size={15} /> : i + 1}
                    </span>
                    <span className="journey-copy">
                      <span className="journey-label">
                        {translateText(step.title, language)}
                        <span>{done ? translateText("Recorded", language) : translateText("Tap to record", language)}</span>
                      </span>
                      <span className="journey-step-copy">{translateText(step.copy, language)}</span>
                    </span>
                  </button>
                );
              })}
            </div>
          </section>

          <div className="content-grid">
            <section className="section-card next-card">
              <div className="section-title-row">
                <div>
                  <p className="eyebrow">YOUR NEXT STEP</p>
                  <h2>
                    {readyRecorded
                      ? "Schedule your appointment"
                      : confirmedReceived
                        ? "Ask how to schedule"
                        : receiptRecorded
                          ? "Confirm it with the specialist"
                          : sentRecorded
                            ? "Check that it arrived"
                            : "Check whether it was sent"}
                  </h2>
                </div>
                <span className="round-icon">
                  <ClipboardList size={19} />
                </span>
              </div>
              <p className="body-copy">
                {readyRecorded
                  ? `You recorded that the referral is ready for scheduling. Contact ${referral.to} to book your visit.`
                  : confirmedReceived
                    ? "You recorded that the specialist office confirmed receipt. Ask what to do next to schedule."
                    : receiptRecorded
                      ? `You recorded that the referral arrived. Check with ${referral.to} to confirm whether anything else is needed before scheduling.`
                      : sentRecorded
                        ? `You recorded that ${referral.from} sent it. Contact ${referral.to} to ask if it arrived.`
                        : `Contact ${referral.from} and ask if the referral has been sent to ${referral.to}.`}
              </p>
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
                  onClick={() => startMessage("Portal message")}
                >
                  <MessageCircle size={17} /> Draft a portal message
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
                        <span>
                          {update.eventDate ? <>
                            <span>Happened</span> {update.eventDate} · <span>Recorded</span> {update.date}
                          </> : update.date}
                        </span>
                      </div>
                      <p>{update.detail}</p>
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
                <div className="quick-log-label">Select any referral steps you know have happened</div>
                <div className="quick-log-options" aria-label="Select confirmed referral steps">
                  {([
                    ["referral-sent", "Referral sent"],
                    ["referral-received", "Referral received"],
                    ["ready-to-schedule", "Ready to schedule"],
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
                        setUpdateTitle(next.length > 1 ? translateText("Referral progress update", language) : next.length === 1 ? translateText(label, language) : "");
                      }}
                    >
                      {updateMilestones.includes(value) && <Check size={14} />}{label}
                    </button>
                  ))}
                </div>
                {updateMilestones.length > 1 && <p className="quick-log-hint">Use these together only when the same source confirmed each step. Record separate updates if different offices confirmed them.</p>}
                <label>
                  Who told you about these steps?
                  <select
                    value={updateSource}
                    onChange={(e) => setUpdateSource(e.target.value as Source)}
                  >
                    <option>You</option>
                    <option>Referring office</option>
                    <option>Specialist office</option>
                    <option>Health plan</option>
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
                    placeholder="What did they tell you? Include a name or reference number if useful."
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
          title={modal === "settings" ? "Settings" : modal === "new" ? "Add a referral" : "A little guidance"}
          onClose={() => setModal(null)}
        >
          {modal === "settings" ? (
            <div className="form-body settings-body">
              <p className="modal-intro">Choose the language used throughout Referral Navigator. This default is saved to your account.</p>
              <label className="settings-language-field">
                Default language
                <LanguageToggle onChange={(language) => void savePreferredLanguage(language)} />
              </label>
              {languageSaveState && <p className="settings-save-state" role="status">{languageSaveState}</p>}
              <button className="primary-button full" onClick={() => setModal(null)}>Done</button>
            </div>
          ) : modal === "new" ? (
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
