export type TimelineStepStatus = 'complete' | 'paused' | 'upcoming';

export interface TimelineStep {
  id: string;
  label: string;
  status: TimelineStepStatus;
  date?: string;
  detail?: string;
}

export type ReferralStatus = 'action-needed' | 'in-progress' | 'completed';

export type Urgency = 'Routine' | 'Soon' | 'Urgent';

export interface OfficeContact {
  name: string;
  role: 'referring' | 'receiving';
  phone: string;
  hours: string;
  address: string;
}

export interface MessageRecord {
  to: string;
  body: string;
  sentAt: string;
}

export interface Referral {
  id: string;
  type: string;
  referringProvider: string;
  receivingProvider: string;
  dateInitiated: string;
  status: ReferralStatus;
  summary: string;
  urgency: Urgency;
  urgencySetBy: string;
  missingDocument?: string;
  timeline: TimelineStep[];
  offices: OfficeContact[];
  recommendedAction?: string;
  aiDraftMessage?: string;
  messages: MessageRecord[];
}
