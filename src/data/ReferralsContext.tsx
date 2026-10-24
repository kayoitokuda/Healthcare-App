import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { useAuth } from '../auth/AuthContext';
import { isSupabaseConfigured, supabase } from '../lib/supabase';
import type { MessageRecord, Referral } from '../types';
import { initialReferrals, patientName as demoPatientName } from './referrals';

interface ReferralsContextValue {
  referrals: Referral[];
  patientName: string;
  loading: boolean;
  error: string | null;
  canLoadDemoData: boolean;
  getReferral: (id: string) => Referral | undefined;
  sendMessage: (referralId: string, message: MessageRecord) => Promise<void>;
  loadDemoData: () => Promise<void>;
}

const ReferralsContext = createContext<ReferralsContextValue | null>(null);
const canLoadDemoData = import.meta.env.VITE_ENABLE_DEMO_DATA === 'true';

export function ReferralsProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [referrals, setReferrals] = useState<Referral[]>(
    isSupabaseConfigured ? [] : initialReferrals,
  );
  const [loading, setLoading] = useState(isSupabaseConfigured);
  const [error, setError] = useState<string | null>(null);
  const ownerId = user?.id;

  useEffect(() => {
    if (!supabase || !ownerId) {
      setReferrals(supabase ? [] : initialReferrals);
      setLoading(false);
      return;
    }

    let active = true;
    setLoading(true);
    setError(null);

    void supabase
      .from('referrals')
      .select('referral_key, data')
      .order('created_at', { ascending: false })
      .then(({ data, error: loadError }) => {
        if (!active) return;
        if (loadError) {
          setError(loadError.message);
          setReferrals([]);
        } else {
          setReferrals((data ?? []).map((row) => row.data as Referral));
        }
        setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [ownerId]);

  const value = useMemo<ReferralsContextValue>(
    () => ({
      referrals,
      patientName:
        user?.user_metadata?.full_name ||
        user?.email?.split('@')[0] ||
        demoPatientName,
      loading,
      error,
      canLoadDemoData,
      getReferral: (id) => referrals.find((referral) => referral.id === id),
      sendMessage: async (referralId, message) => {
        const current = referrals.find((referral) => referral.id === referralId);
        if (!current) return;

        const updated = { ...current, messages: [...current.messages, message] };
        setReferrals((previous) =>
          previous.map((referral) => (referral.id === referralId ? updated : referral)),
        );

        if (!supabase || !ownerId) return;
        const { error: saveError } = await supabase.from('referrals').upsert(
          {
            owner_id: ownerId,
            referral_key: updated.id,
            data: updated,
          },
          { onConflict: 'owner_id,referral_key' },
        );
        if (saveError) {
          setError(saveError.message);
          setReferrals((previous) =>
            previous.map((referral) => (referral.id === referralId ? current : referral)),
          );
        }
      },
      loadDemoData: async () => {
        if (!supabase || !ownerId || !canLoadDemoData) return;
        setError(null);
        const { error: saveError } = await supabase.from('referrals').upsert(
          initialReferrals.map((referral) => ({
            owner_id: ownerId,
            referral_key: referral.id,
            data: referral,
          })),
          { onConflict: 'owner_id,referral_key' },
        );
        if (saveError) {
          setError(saveError.message);
          return;
        }
        setReferrals(initialReferrals);
      },
    }),
    [error, loading, ownerId, referrals, user],
  );

  return <ReferralsContext.Provider value={value}>{children}</ReferralsContext.Provider>;
}

export function useReferrals() {
  const context = useContext(ReferralsContext);
  if (!context) throw new Error('useReferrals must be used within ReferralsProvider');
  return context;
}
