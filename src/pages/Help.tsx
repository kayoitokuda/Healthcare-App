import { AlertOctagon, CheckCircle2, ChevronDown, Clock, Flag, Phone } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Modal from '../components/Modal';
import TopBar from '../components/TopBar';
import { useReferrals } from '../data/ReferralsContext';

const STATUS_MEANINGS = [
  {
    term: 'Referral requested',
    meaning: 'Your provider has created the referral in their system.',
  },
  {
    term: 'Referral sent',
    meaning: 'Your provider has sent the referral to the specialist’s office.',
  },
  {
    term: 'Referral received',
    meaning: 'The specialist’s office has confirmed they received the referral and opened your file.',
  },
  {
    term: 'Specialist review',
    meaning:
      'The specialist’s clinical team is reviewing your case to decide next steps. This can pause if something is missing, like a document.',
  },
  {
    term: 'Ready to schedule',
    meaning: 'The specialist has approved your referral and you can book an appointment.',
  },
  {
    term: 'Appointment completed',
    meaning: 'You’ve been seen by the specialist for this referral.',
  },
];

function Disclosure({
  title,
  children,
  defaultOpen = false,
}: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="rounded-2xl border border-line bg-card">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex min-h-11 w-full items-center justify-between gap-3 rounded-2xl px-4 py-3.5 text-left font-semibold text-navy-900 hover:bg-navy-100"
      >
        {title}
        <ChevronDown
          className={`h-4.5 w-4.5 shrink-0 text-navy-500 transition-transform ${open ? 'rotate-180' : ''}`}
          strokeWidth={2.25}
          aria-hidden="true"
        />
      </button>
      {open && <div className="px-4 pb-4 text-sm leading-relaxed text-navy-700">{children}</div>}
    </div>
  );
}

export default function Help() {
  const navigate = useNavigate();
  const { referrals } = useReferrals();
  const [reportOpen, setReportOpen] = useState(false);
  const [reportText, setReportText] = useState('');
  const [reportSent, setReportSent] = useState(false);

  const offices = referrals.flatMap((r) =>
    r.offices.map((office) => ({ ...office, referralType: r.type })),
  );
  const uniqueOffices = Array.from(new Map(offices.map((o) => [o.name, o])).values());

  const closeReport = () => {
    setReportOpen(false);
    setReportSent(false);
    setReportText('');
  };

  return (
    <div className="pb-10">
      <TopBar title="Get help" onBack={() => navigate(-1)} showHelp={false} />

      <main className="mx-auto flex max-w-2xl flex-col gap-4 px-4 pt-5 sm:px-6">
        <div className="flex gap-2.5 rounded-2xl border border-red-700/30 bg-red-50 p-4 text-sm leading-relaxed text-navy-800">
          <AlertOctagon className="mt-0.5 h-5 w-5 shrink-0 text-red-700" strokeWidth={2.25} aria-hidden="true" />
          <p>
            <strong className="font-semibold text-red-800">
              If you are experiencing a medical emergency,
            </strong>{' '}
            call 911 or go to your nearest emergency room. This app is not monitored for
            emergencies and cannot respond in real time.
          </p>
        </div>

        <section>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-navy-500">
            Who to contact
          </h2>
          <div className="mt-3 flex flex-col gap-3">
            {uniqueOffices.map((office) => (
              <div key={office.name} className="rounded-2xl border border-line bg-card p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-semibold text-navy-900">{office.name}</p>
                  <span className="rounded-full bg-navy-100 px-2.5 py-0.5 text-xs font-medium text-navy-700">
                    {office.role === 'referring' ? 'Referring office' : 'Specialist office'}
                  </span>
                </div>
                <div className="mt-2.5 flex flex-col gap-1.5 text-sm text-navy-700">
                  <p className="flex items-center gap-2">
                    <Phone className="h-4 w-4 shrink-0 text-navy-500" strokeWidth={2.25} aria-hidden="true" />
                    <a href={`tel:${office.phone.replace(/[^\d+]/g, '')}`} className="font-medium text-teal-700 underline-offset-2 hover:underline">
                      {office.phone}
                    </a>
                  </p>
                  <p className="flex items-center gap-2">
                    <Clock className="h-4 w-4 shrink-0 text-navy-500" strokeWidth={2.25} aria-hidden="true" />
                    {office.hours}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-navy-500">
            What does this status mean?
          </h2>
          <div className="mt-3 flex flex-col gap-2.5">
            {STATUS_MEANINGS.map((item) => (
              <Disclosure key={item.term} title={item.term}>
                {item.meaning}
              </Disclosure>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-navy-500">
            Something not right?
          </h2>
          <button
            type="button"
            onClick={() => setReportOpen(true)}
            className="mt-3 flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-navy-200 bg-card px-4 py-3 text-sm font-semibold text-navy-800 hover:bg-navy-100 active:bg-navy-200"
          >
            <Flag className="h-4.5 w-4.5" strokeWidth={2.25} aria-hidden="true" />
            Report that this information is incorrect
          </button>
        </section>

        <section>
          <Disclosure title="Prototype assumptions">
            <p>
              Referral Navigator is a design prototype. It assumes secure, real-time integration
              with the referring provider&rsquo;s, specialist&rsquo;s, and insurer&rsquo;s
              referral systems. In a live product, the accuracy of each status shown here would
              depend on those organizations keeping their own records up to date, and any delay
              or gap in their systems would be reflected here as a delay in what the patient
              sees.
            </p>
          </Disclosure>
        </section>
      </main>

      {reportOpen && (
        <Modal title="Report incorrect information" onClose={closeReport}>
          {reportSent ? (
            <div className="text-center">
              <CheckCircle2 className="mx-auto h-10 w-10 text-green-700" strokeWidth={2} aria-hidden="true" />
              <p className="mt-3 font-semibold text-navy-900">Thanks, we received your report.</p>
              <p className="mt-1 text-sm text-navy-600">
                Our team will review the referral information shown here. This does not change
                your care in progress.
              </p>
              <button
                type="button"
                onClick={closeReport}
                className="mt-5 flex min-h-11 w-full items-center justify-center rounded-xl bg-teal-600 px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-teal-700 active:bg-teal-800"
              >
                Done
              </button>
            </div>
          ) : (
            <>
              <label htmlFor="report-text" className="text-sm text-navy-700">
                Tell us what looks wrong &mdash; for example, a status that seems outdated or a
                detail that doesn&rsquo;t match what your office told you.
              </label>
              <textarea
                id="report-text"
                value={reportText}
                onChange={(e) => setReportText(e.target.value)}
                rows={4}
                className="mt-2 w-full resize-none rounded-xl border border-line bg-card p-3 text-sm text-navy-900 focus:border-teal-600"
                placeholder="Describe what seems incorrect..."
              />
              <button
                type="button"
                onClick={() => setReportSent(true)}
                disabled={reportText.trim().length === 0}
                className="mt-4 flex min-h-11 w-full items-center justify-center rounded-xl bg-teal-600 px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-teal-700 active:bg-teal-800 disabled:cursor-not-allowed disabled:bg-navy-200 disabled:text-navy-500"
              >
                Submit report
              </button>
            </>
          )}
        </Modal>
      )}
    </div>
  );
}
