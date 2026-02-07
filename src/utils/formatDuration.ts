import type { Timestamp } from 'firebase/firestore';

/**
 * Format the duration between two Firestore Timestamps as a human-readable
 * string like "1h 30m" or "45m".
 */
export const formatDuration = (
  startedAt: Timestamp,
  completedAt: Timestamp,
): string => {
  const ms = completedAt.toDate().getTime() - startedAt.toDate().getTime();
  const totalMinutes = Math.round(ms / 60000);

  if (totalMinutes < 1) return '<1m';

  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (hours === 0) return `${minutes}m`;
  if (minutes === 0) return `${hours}h`;
  return `${hours}h ${minutes}m`;
};
