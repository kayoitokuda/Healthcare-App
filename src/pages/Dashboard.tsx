import { HelpCircle, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import ReferralCard from '../components/ReferralCard';
import { useReferrals } from '../data/ReferralsContext';

export default function Dashboard() {
  const { referrals, patientName, loading, error, canLoadDemoData, loadDemoData } =
    useReferrals();
  const { configured, signOut } = useAuth();
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
          <div className="flex items-center gap-2">
            {configured && (
              <button
                type="button"
                onClick={() => void signOut()}
                className="flex h-11 items-center gap-2 rounded-full border border-line bg-card px-3 text-sm font-medium text-navy-700 hover:bg-navy-100"
              >
                <LogOut className="h-4 w-4" aria-hidden="true" />
                Sign out
              </button>
            )}
            <button
              type="button"
              onClick={() => navigate('/help')}
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-line bg-card text-navy-700 hover:bg-navy-100 active:bg-navy-200"
              aria-label="Get help"
            >
              <HelpCircle className="h-5 w-5" strokeWidth={2.25} aria-hidden="true" />
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-4 pt-5 sm:px-6">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-navy-500">
          Your referrals
        </h2>
        <p className="mt-1 text-sm text-navy-500">
          Track where each referral stands and what happens next.
        </p>

        {error && (
          <p role="alert" className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-800">
            We couldn’t save or load your referral data. {error}
          </p>
        )}

        {loading ? (
          <p className="mt-6 text-sm text-navy-500">Loading your referrals…</p>
        ) : referrals.length > 0 ? (
          <div className="mt-4 flex flex-col gap-4">
            {referrals.map((referral) => (
              <ReferralCard key={referral.id} referral={referral} />
            ))}
          </div>
        ) : (
          <section className="mt-5 rounded-2xl border border-line bg-card px-5 py-8 text-center">
            <h3 className="font-semibold text-navy-900">No referrals yet</h3>
            <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-navy-500">
              When a referral is added to your account, you’ll see its status and next steps here.
            </p>
            {canLoadDemoData && (
              <button
                className="mt-5 min-h-11 rounded-xl bg-teal-700 px-4 text-sm font-semibold text-white hover:bg-teal-800"
                onClick={() => void loadDemoData()}
                type="button"
              >
                Load fictional demo referrals
              </button>
            )}
          </section>
        )}
      </main>
    </div>
  );
}
