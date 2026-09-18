import { Sparkles } from 'lucide-react';
import { useState } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import TopBar from '../components/TopBar';
import { useReferrals } from '../data/ReferralsContext';

export default function MessageComposer() {
  const { id } = useParams<{ id: string }>();
  const { getReferral, sendMessage } = useReferrals();
  const navigate = useNavigate();

  const referral = id ? getReferral(id) : undefined;
  const [message, setMessage] = useState(referral?.aiDraftMessage ?? '');

  if (!referral) return <Navigate to="/" replace />;

  const recipient = referral.referringProvider;

  const handleSend = () => {
    const sentAt = new Date();
    sendMessage(referral.id, {
      to: recipient,
      body: message,
      sentAt: sentAt.toISOString(),
    });
    navigate(`/referral/${referral.id}/confirmation`);
  };

  return (
    <div className="flex min-h-screen flex-col pb-6">
      <TopBar
        title="Message"
        onBack={() => navigate(`/referral/${referral.id}`)}
      />

      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col px-4 pt-5 sm:px-6">
        <div className="rounded-2xl border border-line bg-card p-4 sm:p-5">
          <p className="text-sm text-navy-500">To</p>
          <p className="font-semibold text-navy-900">{recipient}</p>
        </div>

        <div className="mt-4 flex items-center gap-2 rounded-xl bg-teal-50 px-3.5 py-2.5 text-sm font-medium text-teal-800">
          <Sparkles className="h-4 w-4 shrink-0" strokeWidth={2.25} aria-hidden="true" />
          Drafted with AI. Review before sending.
        </div>

        <label htmlFor="message-body" className="mt-4 text-sm font-semibold text-navy-800">
          Message
        </label>
        <textarea
          id="message-body"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={8}
          className="mt-2 w-full flex-1 resize-none rounded-2xl border border-line bg-card p-4 text-base leading-relaxed text-navy-900 shadow-sm focus:border-teal-600"
        />

        <p className="mt-3 text-xs leading-relaxed text-navy-500">
          This message only asks {recipient} to send your missing X-ray to your specialist. It
          does not share medical advice or clinical decisions on your behalf.
        </p>

        <div className="mt-5 flex flex-col gap-2.5 sm:flex-row-reverse">
          <button
            type="button"
            onClick={handleSend}
            disabled={message.trim().length === 0}
            className="flex min-h-11 w-full items-center justify-center rounded-xl bg-teal-600 px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-teal-700 active:bg-teal-800 disabled:cursor-not-allowed disabled:bg-navy-200 disabled:text-navy-500 sm:flex-1"
          >
            Send message
          </button>
          <button
            type="button"
            onClick={() => navigate(`/referral/${referral.id}`)}
            className="flex min-h-11 w-full items-center justify-center rounded-xl border border-navy-200 bg-card px-4 py-3 text-sm font-semibold text-navy-800 hover:bg-navy-100 active:bg-navy-200 sm:flex-1"
          >
            Cancel
          </button>
        </div>
      </main>
    </div>
  );
}
