import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';
import { initialReferrals, patientName } from './referrals';
import type { MessageRecord, Referral } from '../types';

interface ReferralsContextValue {
  referrals: Referral[];
  patientName: string;
  getReferral: (id: string) => Referral | undefined;
  sendMessage: (referralId: string, message: MessageRecord) => void;
}

const ReferralsContext = createContext<ReferralsContextValue | null>(null);

export function ReferralsProvider({ children }: { children: ReactNode }) {
  const [referrals, setReferrals] = useState<Referral[]>(initialReferrals);

  const value = useMemo<ReferralsContextValue>(
    () => ({
      referrals,
      patientName,
      getReferral: (id) => referrals.find((r) => r.id === id),
      sendMessage: (referralId, message) => {
        setReferrals((prev) =>
          prev.map((r) =>
            r.id === referralId ? { ...r, messages: [...r.messages, message] } : r,
          ),
        );
      },
    }),
    [referrals],
  );

  return <ReferralsContext.Provider value={value}>{children}</ReferralsContext.Provider>;
}

export function useReferrals() {
  const ctx = useContext(ReferralsContext);
  if (!ctx) throw new Error('useReferrals must be used within ReferralsProvider');
  return ctx;
}
