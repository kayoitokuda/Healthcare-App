import { ArrowRight, Stethoscope } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { Referral } from '../types';
import StatusBadge from './StatusBadge';

export default function ReferralCard({ referral }: { referral: Referral }) {
  const navigate = useNavigate();

  return (
    <div className="rounded-2xl border border-line bg-card p-4 shadow-sm sm:p-5">
      <div className="flex items-start gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-teal-100 text-teal-700">
          <Stethoscope className="h-5 w-5" strokeWidth={2.25} aria-hidden="true" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-base font-semibold text-navy-900">{referral.type}</h3>
          </div>
          <p className="mt-0.5 text-sm text-navy-500">
            {referral.referringProvider} &rarr; {referral.receivingProvider}
          </p>
        </div>
      </div>

      <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
        <div>
          <dt className="text-navy-500">Date initiated</dt>
          <dd className="font-medium text-navy-800">{referral.dateInitiated}</dd>
        </div>
        <div>
          <dt className="text-navy-500">Status</dt>
          <dd className="mt-0.5">
            <StatusBadge status={referral.status} />
          </dd>
        </div>
      </dl>

      <p className="mt-4 rounded-xl bg-paper px-3 py-2.5 text-sm leading-relaxed text-navy-800">
        {referral.summary}
      </p>

      <button
        type="button"
        onClick={() => navigate(`/referral/${referral.id}`)}
        className="mt-4 flex min-h-11 w-full items-center justify-center gap-1.5 rounded-xl bg-teal-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-teal-700 active:bg-teal-800"
      >
        View referral
        <ArrowRight className="h-4 w-4" strokeWidth={2.25} aria-hidden="true" />
      </button>
    </div>
  );
}
