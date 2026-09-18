import { Info } from 'lucide-react';
import type { Urgency } from '../types';

export default function UrgencyNote({
  urgency,
  setBy,
}: {
  urgency: Urgency;
  setBy: string;
}) {
  return (
    <div className="rounded-2xl border border-line bg-card p-4 sm:p-5">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-navy-500">
          Clinical urgency
        </h3>
      </div>
      <p className="mt-2 text-lg font-semibold text-navy-900">Urgency: {urgency}</p>
      <div className="mt-3 flex gap-2.5 rounded-xl bg-teal-50 p-3.5 text-sm leading-relaxed text-navy-700">
        <Info className="mt-0.5 h-4 w-4 shrink-0 text-teal-700" strokeWidth={2.25} aria-hidden="true" />
        <p>
          This label was provided by {setBy}, not determined by this app. It describes how the
          referral is being handled administratively, separate from the status of your care. If
          your symptoms change or get worse, contact a healthcare professional directly rather
          than waiting for an update here.
        </p>
      </div>
    </div>
  );
}
