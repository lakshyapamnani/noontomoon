/** Live elapsed timer for table occupancy (MM:SS, or H:MM:SS after 1 hour). */
export function getOccupiedTimerLabel(itemsAddedAt?: number, now = Date.now()): string | null {
  if (!itemsAddedAt || itemsAddedAt <= 0) return null;

  const elapsedSec = Math.max(0, Math.floor((now - itemsAddedAt) / 1000));
  const hours = Math.floor(elapsedSec / 3600);
  const mins = Math.floor((elapsedSec % 3600) / 60);
  const secs = elapsedSec % 60;
  const pad = (n: number) => String(n).padStart(2, '0');

  if (hours > 0) {
    return `${hours}:${pad(mins)}:${pad(secs)}`;
  }
  return `${pad(mins)}:${pad(secs)}`;
}
