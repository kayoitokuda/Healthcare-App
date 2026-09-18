import { AlertTriangle, CheckCircle2, Circle } from 'lucide-react';
import type { TimelineStep } from '../types';

const STEP_STYLES = {
  complete: {
    icon: CheckCircle2,
    ring: 'bg-green-600 text-white',
    line: 'bg-green-600',
    badge: 'text-green-800',
    badgeLabel: 'Complete',
  },
  paused: {
    icon: AlertTriangle,
    ring: 'bg-amber-600 text-white',
    line: 'bg-navy-200',
    badge: 'text-amber-800',
    badgeLabel: 'Paused',
  },
  upcoming: {
    icon: Circle,
    ring: 'bg-navy-100 text-navy-400 border border-navy-200',
    line: 'bg-navy-200',
    badge: 'text-navy-500',
    badgeLabel: 'Upcoming',
  },
} as const;

export default function Timeline({ steps }: { steps: TimelineStep[] }) {
  return (
    <ol className="relative">
      {steps.map((step, index) => {
        const style = STEP_STYLES[step.status];
        const Icon = style.icon;
        const isLast = index === steps.length - 1;
        const isPaused = step.status === 'paused';

        return (
          <li key={step.id} className="relative flex gap-4 pb-8 last:pb-0">
            {!isLast && (
              <span
                className={`absolute left-[15px] top-8 h-[calc(100%-1.5rem)] w-0.5 ${style.line}`}
                aria-hidden="true"
              />
            )}
            <span
              className={`relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${style.ring}`}
              aria-hidden="true"
            >
              <Icon className="h-4.5 w-4.5" strokeWidth={2.5} />
            </span>
            <div className={`min-w-0 flex-1 pt-0.5 ${isPaused ? '-mt-0.5' : ''}`}>
              <div
                className={
                  isPaused
                    ? 'rounded-xl border border-amber-600/40 bg-amber-50 p-3.5'
                    : ''
                }
              >
                <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                  <p className="font-semibold text-navy-900">{step.label}</p>
                  <span className={`text-sm font-medium ${style.badge}`}>
                    {style.badgeLabel}
                    {step.date ? ` · ${step.date}` : ''}
                  </span>
                </div>
                {step.detail && (
                  <p className="mt-1 text-sm leading-relaxed text-navy-700">{step.detail}</p>
                )}
              </div>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
