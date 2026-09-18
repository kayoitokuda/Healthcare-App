import type { Referral } from '../types';

export const initialReferrals: Referral[] = [
  {
    id: 'oral-surgery-maya',
    type: 'Oral Surgery',
    referringProvider: 'Bayview Dental',
    receivingProvider: 'Peninsula Oral Surgery',
    dateInitiated: 'September 10, 2026',
    status: 'action-needed',
    summary:
      'The specialist needs one more document before reviewing your referral.',
    urgency: 'Routine',
    urgencySetBy: 'Bayview Dental',
    missingDocument: 'latest dental X-ray',
    recommendedAction: 'Ask Bayview Dental to send your latest X-ray.',
    aiDraftMessage:
      'Hello, Peninsula Oral Surgery has received my referral but is still waiting for my latest dental X-ray. Could you please send it to their office and confirm when it has been sent? Thank you.',
    timeline: [
      {
        id: 'requested',
        label: 'Referral requested',
        status: 'complete',
        date: 'September 10, 2026',
        detail: 'Bayview Dental created a referral for evaluation of a possible failing dental implant.',
      },
      {
        id: 'sent',
        label: 'Referral sent',
        status: 'complete',
        date: 'September 10, 2026',
        detail: 'Bayview Dental sent your referral to Peninsula Oral Surgery.',
      },
      {
        id: 'received',
        label: 'Referral received',
        status: 'complete',
        date: 'September 11, 2026',
        detail: 'Peninsula Oral Surgery confirmed receipt and opened your file.',
      },
      {
        id: 'review',
        label: 'Specialist review',
        status: 'paused',
        detail:
          'Peninsula Oral Surgery received your referral, but it still needs your latest dental X-ray before the clinical team can review it.',
      },
      {
        id: 'schedule',
        label: 'Ready to schedule',
        status: 'upcoming',
      },
      {
        id: 'completed',
        label: 'Appointment completed',
        status: 'upcoming',
      },
    ],
    offices: [
      {
        name: 'Bayview Dental',
        role: 'referring',
        phone: '(415) 555-0148',
        hours: 'Mon–Fri, 8:00 am–5:00 pm',
        address: '221 Bayview Ave, San Francisco, CA',
      },
      {
        name: 'Peninsula Oral Surgery',
        role: 'receiving',
        phone: '(650) 555-0193',
        hours: 'Mon–Thu, 7:30 am–4:30 pm',
        address: '48 Peninsula Blvd, Suite 300, San Mateo, CA',
      },
    ],
    messages: [],
  },
  {
    id: 'physical-therapy-maya',
    type: 'Physical Therapy',
    referringProvider: 'Dr. Elena Ruiz, Golden Gate Primary Care',
    receivingProvider: 'Marina Physical Therapy',
    dateInitiated: 'July 22, 2026',
    status: 'completed',
    summary: 'Your physical therapy referral is complete. No action needed.',
    urgency: 'Routine',
    urgencySetBy: 'Golden Gate Primary Care',
    timeline: [
      {
        id: 'requested',
        label: 'Referral requested',
        status: 'complete',
        date: 'July 22, 2026',
        detail: 'Golden Gate Primary Care referred you for evaluation of knee pain.',
      },
      {
        id: 'sent',
        label: 'Referral sent',
        status: 'complete',
        date: 'July 22, 2026',
        detail: 'Golden Gate Primary Care sent your referral to Marina Physical Therapy.',
      },
      {
        id: 'received',
        label: 'Referral received',
        status: 'complete',
        date: 'July 23, 2026',
        detail: 'Marina Physical Therapy confirmed receipt and opened your file.',
      },
      {
        id: 'review',
        label: 'Specialist review',
        status: 'complete',
        date: 'July 24, 2026',
        detail: 'Marina Physical Therapy reviewed your referral and approved an evaluation.',
      },
      {
        id: 'schedule',
        label: 'Ready to schedule',
        status: 'complete',
        date: 'July 26, 2026',
        detail: 'You scheduled your evaluation appointment.',
      },
      {
        id: 'completed',
        label: 'Appointment completed',
        status: 'complete',
        date: 'August 4, 2026',
        detail: 'You completed your evaluation appointment with Marina Physical Therapy.',
      },
    ],
    offices: [
      {
        name: 'Golden Gate Primary Care',
        role: 'referring',
        phone: '(415) 555-0122',
        hours: 'Mon–Fri, 8:00 am–6:00 pm',
        address: '900 Golden Gate Ave, San Francisco, CA',
      },
      {
        name: 'Marina Physical Therapy',
        role: 'receiving',
        phone: '(415) 555-0177',
        hours: 'Mon–Sat, 7:00 am–6:00 pm',
        address: '3150 Marina Blvd, San Francisco, CA',
      },
    ],
    messages: [],
  },
];

export const patientName = 'Maya Chen';
