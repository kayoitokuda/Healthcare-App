import { CheckCircle2, MessageSquare, Phone, Upload } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import Modal from '../components/Modal';
import StatusBadge from '../components/StatusBadge';
import Timeline from '../components/Timeline';
import TopBar from '../components/TopBar';
import UrgencyNote from '../components/UrgencyNote';
import { useReferrals } from '../data/ReferralsContext';
import { formatSentAt } from '../utils/date';

export default function ReferralDetail() {
  const { id } = useParams<{ id: string }>();
  const { getReferral } = useReferrals();
  const navigate = useNavigate();
  const [callOpen, setCallOpen] = useState(false);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<string | null>(null);

  const referral = id ? getReferral(id) : undefined;

  const referringOffice = useMemo(
    () => referral?.offices.find((o) => o.role === 'referring'),
    [referral],
  );

  if (!referral) return <Navigate to="/" replace />;

  const lastMessage = referral.messages[referral.messages.length - 1];
  const showActionNeeded = referral.status === 'action-needed' && !lastMessage;

  return (
    <div className="pb-10">
      <TopBar title={referral.type} onBack={() => navigate('/')} />

      <main className="mx-auto max-w-2xl px-4 pt-5 sm:px-6">
        <section className="rounded-2xl border border-line bg-card p-4 sm:p-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-lg font-semibold text-navy-900">{referral.type} referral</h2>
            <StatusBadge status={referral.status} />
          </div>
          <dl className="mt-3 grid grid-cols-1 gap-x-4 gap-y-2 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-navy-500">Referring provider</dt>
              <dd className="font-medium text-navy-800">{referral.referringProvider}</dd>
            </div>
            <div>
              <dt className="text-navy-500">Receiving provider</dt>
              <dd className="font-medium text-navy-800">{referral.receivingProvider}</dd>
            </div>
            <div>
              <dt className="text-navy-500">Date initiated</dt>
              <dd className="font-medium text-navy-800">{referral.dateInitiated}</dd>
            </div>
          </dl>
          <p className="mt-3 rounded-xl bg-paper px-3.5 py-3 text-sm leading-relaxed text-navy-800">
            {referral.summary}
          </p>
        </section>

        {lastMessage && (
          <section
            className="mt-4 flex gap-2.5 rounded-2xl border border-teal-600/30 bg-teal-50 p-4 text-sm text-navy-800 sm:p-5"
            role="status"
          >
            <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-teal-700" strokeWidth={2.25} aria-hidden="true" />
            <div>
              <p className="font-semibold text-navy-900">
                Your message was sent to {referral.referringProvider}.
              </p>
              <p className="mt-1 leading-relaxed">
                Sent {formatSentAt(lastMessage.sentAt)}. We&rsquo;ll let you know here as soon as
                there&rsquo;s an update.
              </p>
            </div>
          </section>
        )}

        <section className="mt-4">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-navy-500">Timeline</h2>
          <div className="mt-3 rounded-2xl border border-line bg-card p-4 sm:p-5">
            <Timeline steps={referral.timeline} />
          </div>
        </section>

        <section className="mt-4">
          <UrgencyNote urgency={referral.urgency} setBy={referral.urgencySetBy} />
        </section>

        {showActionNeeded && (
          <section className="mt-4 rounded-2xl border border-amber-600/40 bg-amber-50 p-4 sm:p-5">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-amber-800">
              Action needed
            </h2>
            <p className="mt-2 text-base font-semibold text-navy-900">
              {referral.recommendedAction}
            </p>
            <p className="mt-1 text-sm leading-relaxed text-navy-700">
              Choose how you&rsquo;d like to follow up. Sending a message is usually the fastest
              option.
            </p>

            <div className="mt-4 flex flex-col gap-2.5">
              <button
                type="button"
                onClick={() => navigate(`/referral/${referral.id}/message`)}
                className="flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-teal-600 px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-teal-700 active:bg-teal-800"
              >
                <MessageSquare className="h-4.5 w-4.5" strokeWidth={2.25} aria-hidden="true" />
                Send a prepared message
              </button>
              <button
                type="button"
                onClick={() => setCallOpen(true)}
                className="flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-navy-200 bg-card px-4 py-3 text-sm font-semibold text-navy-800 hover:bg-navy-100 active:bg-navy-200"
              >
                <Phone className="h-4.5 w-4.5" strokeWidth={2.25} aria-hidden="true" />
                Call {referral.referringProvider}
              </button>
              <button
                type="button"
                onClick={() => setUploadOpen(true)}
                className="flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-navy-200 bg-card px-4 py-3 text-sm font-semibold text-navy-800 hover:bg-navy-100 active:bg-navy-200"
              >
                <Upload className="h-4.5 w-4.5" strokeWidth={2.25} aria-hidden="true" />
                Upload a copy myself
              </button>
            </div>
          </section>
        )}
      </main>

      {callOpen && referringOffice && (
        <Modal title={`Call ${referringOffice.name}`} onClose={() => setCallOpen(false)}>
          <p className="text-sm text-navy-700">
            Call {referringOffice.name} to ask them to send your latest X-ray to Peninsula Oral
            Surgery.
          </p>
          <div className="mt-4 rounded-xl bg-paper p-3.5 text-sm">
            <p className="text-navy-500">Phone</p>
            <p className="text-lg font-semibold text-navy-900">{referringOffice.phone}</p>
            <p className="mt-2 text-navy-500">Hours</p>
            <p className="font-medium text-navy-800">{referringOffice.hours}</p>
          </div>
          <a
            href={`tel:${referringOffice.phone.replace(/[^\d+]/g, '')}`}
            className="mt-4 flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-teal-600 px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-teal-700 active:bg-teal-800"
          >
            <Phone className="h-4.5 w-4.5" strokeWidth={2.25} aria-hidden="true" />
            Call {referringOffice.phone}
          </a>
        </Modal>
      )}

      {uploadOpen && (
        <Modal title="Upload a copy yourself" onClose={() => setUploadOpen(false)}>
          {uploadedFile ? (
            <div className="text-center">
              <CheckCircle2
                className="mx-auto h-10 w-10 text-green-700"
                strokeWidth={2}
                aria-hidden="true"
              />
              <p className="mt-3 font-semibold text-navy-900">File added</p>
              <p className="mt-1 text-sm text-navy-600">
                &ldquo;{uploadedFile}&rdquo; will be sent to Peninsula Oral Surgery with your referral.
              </p>
              <button
                type="button"
                onClick={() => setUploadOpen(false)}
                className="mt-5 flex min-h-11 w-full items-center justify-center rounded-xl bg-teal-600 px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-teal-700 active:bg-teal-800"
              >
                Done
              </button>
            </div>
          ) : (
            <>
              <p className="text-sm leading-relaxed text-navy-700">
                If you have a digital copy of your latest dental X-ray, you can attach it here
                instead of contacting Bayview Dental.
              </p>
              <label className="mt-4 flex min-h-24 cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-navy-200 bg-paper px-4 py-6 text-center hover:bg-navy-100">
                <Upload className="h-5 w-5 text-navy-500" strokeWidth={2.25} aria-hidden="true" />
                <span className="text-sm font-medium text-navy-700">
                  Tap to choose a file (image or PDF)
                </span>
                <input
                  type="file"
                  accept="image/*,.pdf"
                  className="sr-only"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) setUploadedFile(file.name);
                  }}
                />
              </label>
            </>
          )}
        </Modal>
      )}
    </div>
  );
}
