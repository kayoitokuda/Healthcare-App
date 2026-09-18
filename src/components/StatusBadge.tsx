import { AlertTriangle, CheckCircle2, Clock } from 'lucide-react';
import type { ReferralStatus } from '../types';

const STYLES: Record<
  ReferralStatus,
  { label: string; classes: string; Icon: typeof AlertTriangle }
> = {
  'action-needed': {
    label: 'Action needed',
    classes: 'bg-amber-100 text-amber-800 border-amber-600/30',
    Icon: AlertTriangle,
  },
  'in-progress': {
    label: 'In progress',
    classes: 'bg-teal-100 text-teal-800 border-teal-600/30',
    Icon: Clock,
  },
  completed: {
    label: 'Completed',
    classes: 'bg-green-100 text-green-800 border-green-600/30',
    Icon: CheckCircle2,
  },
};

export default function StatusBadge({ status }: { status: ReferralStatus }) {
  const { label, classes, Icon } = STYLES[status];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm font-medium ${classes}`}
    >
      <Icon className="h-4 w-4" aria-hidden="true" strokeWidth={2.25} />
      {label}
    </span>
  );
}
