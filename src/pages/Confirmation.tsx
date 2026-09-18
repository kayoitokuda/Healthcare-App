import { CheckCircle2 } from 'lucide-react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import TopBar from '../components/TopBar';
import { useReferrals } from '../data/ReferralsContext';
import { formatReminderDate, formatSentAt } from '../utils/date';

export default function Confirmation() {
  const { id } = useParams<{ id: string }>();
  const { getReferral } = useReferrals();
  const navigate = useNavigate();

  const referral = id ? getReferral(id) : undefined;
  const lastMessage = referral?.messages[referral.messages.length - 1];

  if (!referral || !lastMessage) return <Navigate to={id ? `/referral/${id}` : '/'} replace />;

  return (
    <div className="pb-10">
      <TopBar
        title="Message sent"
        onBack={() => navigate(`/referral/${referral.id}`)}
        showHelp={false}
      />

      <main className="mx-auto max-w-2xl px-4 pt-6 sm:px-6">
        <div className="flex flex-col items-center rounded-2xl border border-green-600/30 bg-green-50 px-5 py-8 text-center">
          <CheckCircle2 className="h-12 w-12 text-green-700" strokeWidth={2} aria-hidden="true" />
          <h2 className="mt-3 text-xl font-semibold text-navy-900">
            Your message was sent to {lastMessage.to}.
          </h2>
        </div>

        <dl className="mt-4 flex flex-col gap-3 rounded-2xl border border-line bg-card p-4 text-sm sm:p-5">
          <div className="flex items-center justify-between gap-3">
            <dt className="text-navy-500">Sent</dt>
            <dd className="font-medium text-navy-800">{formatSentAt(lastMessage.sentAt)}</dd>
          </div>
          <div className="flex items-center justify-between gap-3 border-t border-line pt-3">
            <dt className="text-navy-500">Expected response window</dt>
            <dd className="text-right font-medium text-navy-800">
              Most offices respond within 2 business days.
            </dd>
          </div>
        </dl>

        <p className="mt-4 rounded-2xl bg-teal-50 px-4 py-3.5 text-sm leading-relaxed text-navy-800">
          We&rsquo;ll remind you if you haven&rsquo;t received an update by{' '}
          <strong className="font-semibold">{formatReminderDate(lastMessage.sentAt)}</strong>.
        </p>

        <div className="mt-5 rounded-2xl border border-line bg-card p-4 sm:p-5">
          <p className="text-sm font-semibold text-navy-800">Your message</p>
          <p className="mt-1.5 text-sm leading-relaxed text-navy-700">{lastMessage.body}</p>
        </div>

        <button
          type="button"
          onClick={() => navigate(`/referral/${referral.id}`)}
          className="mt-6 flex min-h-11 w-full items-center justify-center rounded-xl bg-teal-600 px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-teal-700 active:bg-teal-800"
        >
          Back to referral
        </button>
      </main>
    </div>
  );
}
