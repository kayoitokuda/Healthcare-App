export function formatSentAt(iso: string) {
  const d = new Date(iso);
  return d.toLocaleString('en-US', {
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export function formatReminderDate(iso: string) {
  const d = new Date(iso);
  d.setDate(d.getDate() + 4);
  return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric' });
}
