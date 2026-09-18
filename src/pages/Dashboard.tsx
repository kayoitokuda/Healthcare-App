import { HelpCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ReferralCard from '../components/ReferralCard';
import { useReferrals } from '../data/ReferralsContext';

export default function Dashboard() {
  const { referrals, patientName } = useReferrals();
  const navigate = useNavigate();
  const firstName = patientName.split(' ')[0];

  return (
    <div className="pb-10">
      <header className="border-b border-line bg-card">
        <div className="mx-auto flex max-w-2xl items-start justify-between gap-3 px-4 pt-7 pb-5 sm:px-6">
          <div>
            <p className="text-sm text-navy-500">Good afternoon</p>
            <h1 className="mt-0.5 text-2xl font-semibold text-navy-900">{firstName}</h1>
          </div>
          <button
            type="button"
            onClick={() => navigate('/help')}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-line bg-card text-navy-700 hover:bg-navy-100 active:bg-navy-200"
            aria-label="Get help"
          >
            <HelpCircle className="h-5 w-5" strokeWidth={2.25} aria-hidden="true" />
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-4 pt-5 sm:px-6">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-navy-500">
          Your referrals
        </h2>
        <p className="mt-1 text-sm text-navy-500">
          Track where each referral stands and what happens next.
        </p>

        <div className="mt-4 flex flex-col gap-4">
          {referrals.map((referral) => (
            <ReferralCard key={referral.id} referral={referral} />
          ))}
        </div>
      </main>
    </div>
  );
}
