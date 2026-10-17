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
  Menu,
  MessageCircle,
  Phone,
  Plus,
  ShieldCheck,
  Stethoscope,
  X,
} from "lucide-react";

type Source = "You" | "Referring office" | "Specialist office" | "Health plan";
type Milestone = "referral-sent" | "referral-received" | "ready-to-schedule";
type Update = {
  id: number;
  title: string;
  detail: string;
  date: string;
  source: Source;
  milestone?: Milestone;
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
    ],
    done: [],
    notes: "",
  },
];

const steps = [
  { title: "Recommendation", copy: "A clinician suggests specialist care" },
  { title: "Referral sent", copy: "Check with the referring office" },
  { title: "Receipt confirmed", copy: "Check with the specialist’s office" },
  { title: "Ready to schedule", copy: "Ask how to book your visit" },
];

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

export default function App() {
  const [referrals, setReferrals] = useState(initial);
  const [selected, setSelected] = useState<number | null>(null);
  const [modal, setModal] = useState<
    "new" | "update" | "message" | "notes" | "help" | null
  >(null);
  const [updateTitle, setUpdateTitle] = useState("");
  const [updateDetail, setUpdateDetail] = useState("");
  const [updateSource, setUpdateSource] = useState<Source>("You");
  const [updateMilestone, setUpdateMilestone] = useState<Milestone | "">("");
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
    referral?.updates.some((u) => u.milestone === "referral-sent") ?? false;
  const receiptRecorded =
    referral?.updates.some((u) => u.milestone === "referral-received") ?? false;
  const confirmedReceived =
    referral?.updates.some(
      (u) =>
        u.milestone === "referral-received" && u.source === "Specialist office",
    ) ?? false;
  const readyRecorded =
    referral?.updates.some((u) => u.milestone === "ready-to-schedule") ?? false;
  const status = useMemo(() => {
    if (confirmedReceived) return "Specialist office confirmation recorded";
    if (receiptRecorded) return "Receipt update recorded";
    if (sentRecorded) return "Waiting for receipt";
    return "Not confirmed yet";
  }, [confirmedReceived, receiptRecorded, sentRecorded]);

  function flash(message: string) {
    setToast(message);
    window.setTimeout(() => setToast(""), 2800);
  }

  function addUpdate(title = "", detail = "", source: Source = "You") {
    setUpdateTitle(title);
    setUpdateDetail(detail);
    setUpdateSource(source);
    setUpdateMilestone("");
    setModal("update");
  }

  function saveUpdate() {
    if (!referral || !updateTitle.trim()) return;
    const update = {
      id: Date.now(),
      title: updateTitle.trim(),
      detail: updateDetail.trim() || "No additional notes.",
      date: today,
      source: updateSource,
      ...(updateMilestone ? { milestone: updateMilestone } : {}),
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
  ) {
    setMessageKind(kind);
    setMessageDraft(
      kind === "Call script"
        ? `Hi, my name is Maya Chen. ${referral?.from || "My clinician"} recommended that I see ${referral?.specialty || "a specialist"}, and I’m checking on the referral. Could you tell me whether it has been sent? If so, when and to which office? If not, is anything needed from me?`
        : `Hello, I’m following up on a referral for ${referral?.specialty || "specialty care"}. ${referral?.from || "My referring office"} recommended this on ${referral?.date || "the date of my visit"}. Could you let me know whether the referral has been sent and whether you need anything else from me? Thank you.`,
    );
    setCopied(false);
    setModal("message");
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
    setSelected(created.id);
    setModal(null);
    setNewSpecialty("");
    setNewFrom("");
    setNewTo("");
    setNewDate("");
    flash("Referral added.");
  }

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
                setModal("new");
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
                        <span>
                          {done ? "Recorded" : i < 3 ? "Not confirmed" : "Next"}
                        </span>
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
                        <span>{update.date}</span>
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
                : modal === "message"
                  ? "Prepare a message"
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
                    onChange={(e) =>
                      setUpdateMilestone(e.target.value as Milestone | "")
                    }
                  >
                    <option value="">General update</option>
                    <option value="referral-sent">Referral sent</option>
                    <option value="referral-received">Referral received</option>
                    <option value="ready-to-schedule">Ready to schedule</option>
                  </select>
                </label>
                <label>
                  Who provided this update?
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
            {modal === "message" && (
              <div className="form-body">
                <p className="modal-intro">
                  Review and edit this draft. Referral Navigator won’t send it
                  for you.
                </p>
                <div className="segmented">
                  {(["Call script", "Portal message", "Email"] as const).map(
                    (kind) => (
                      <button
                        className={messageKind === kind ? "selected" : ""}
                        key={kind}
                        onClick={() => startMessage(kind)}
                      >
                        {kind}
                      </button>
                    ),
                  )}
                </div>
                <label>
                  {messageKind} draft
                  <textarea
                    className="draft-area"
                    value={messageDraft}
                    onChange={(e) => setMessageDraft(e.target.value)}
                    rows={7}
                  />
                </label>
                <button className="primary-button full" onClick={copyDraft}>
                  {copied ? <Check size={16} /> : <Copy size={16} />}
                  {copied ? "Copied to clipboard" : "Copy draft to review"}
                </button>
                <button
                  className="text-button center"
                  onClick={() => {
                    setModal(null);
                    addUpdate(
                      "Contacted an office",
                      "I used a prepared draft. Add the office’s response when you have it.",
                      "You",
                    );
                  }}
                >
                  I contacted an office
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
        <nav className="nav">
          <button className="nav-active" onClick={() => setMenuOpen(false)}>
            My referrals
          </button>
          <button
            onClick={() => {
              setMenuOpen(false);
              setModal("help");
            }}
          >
            How it works
          </button>
        </nav>
        <div className="top-actions">
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
              setModal("new");
            }}
            onHelp={() => {
              setMenuOpen(false);
              setModal("help");
            }}
            referralCount={referrals.length}
          />
        </div>
      </header>
      <main className="dashboard-wrap">
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
        <section className="dashboard-section">
          <div className="section-title-row list-title">
            <div>
              <h2>Your referrals</h2>
              <p>Updates are entered by you and labeled by source.</p>
            </div>
            <button
              className="primary-button add-button"
              onClick={() => setModal("new")}
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
                onClick={() => setModal("new")}
              >
                <Plus size={17} /> Add your first referral
              </button>
            </div>
          ) : (
            <div className="referral-list-layout">
              <div className="referral-grid">
                {referrals.map((r) => {
                  const receipt = r.updates.some(
                    (u) => u.milestone === "referral-received",
                  );
                  const officeConfirmed = r.updates.some(
                    (u) =>
                      u.milestone === "referral-received" &&
                      u.source === "Specialist office",
                  );
                  const sent = r.updates.some(
                    (u) => u.milestone === "referral-sent",
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
                        className="card-link"
                        onClick={() => setSelected(r.id)}
                      >
                        Open referral <ArrowRight size={17} />
                      </button>
                    </article>
                  );
                })}
              </div>
              <aside className="first-step-card">
                <span className="guide-icon">
                  <MessageCircle size={18} />
                </span>
                <p className="eyebrow">A GOOD FIRST QUESTION</p>
                <h3>Has my referral been sent?</h3>
                <p>
                  Ask the referring office when it was sent and which specialist
                  received it. Then record what they tell you.
                </p>
                <button
                  className="text-button"
                  onClick={() => setSelected(referrals[0].id)}
                >
                  See your next steps <ArrowRight size={15} />
                </button>
                <div className="guide-foot">
                  <ShieldCheck size={14} /> No automatic status checks
                </div>
              </aside>
            </div>
          )}
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
