import { Order } from '../types';

/** Parse order date + time into a timestamp (local timezone). */
export function getOrderTimestamp(order: Order): number {
  const d = order.date;
  if (!d) return 0;

  if (/^\d{4}-\d{2}-\d{2}$/.test(d)) {
    const timeStr = (order.time || '12:00 AM').trim();
    const parsed = new Date(`${d} ${timeStr}`);
    if (!isNaN(parsed.getTime())) return parsed.getTime();
    return new Date(`${d}T12:00:00`).getTime();
  }

  const parsed = new Date(d);
  return isNaN(parsed.getTime()) ? 0 : parsed.getTime();
}

/** Calendar-day key YYYY-MM-DD in local timezone. */
export function getCalendarDayKey(date: Date = new Date()): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

/** True if order falls on the current calendar day (fallback when no session). */
export function isOrderOnCalendarDay(order: Order, dayKey = getCalendarDayKey()): boolean {
  const d = order.date;
  if (!d) return false;
  if (/^\d{4}-\d{2}-\d{2}$/.test(d)) return d === dayKey;
  const parsed = new Date(d);
  if (isNaN(parsed.getTime())) return false;
  return getCalendarDayKey(parsed) === dayKey;
}

/**
 * "Today" = orders since last Start New Day click.
 * If never started, uses calendar today only (no midnight auto-reset of stored data).
 */
export function isOrderInCurrentBusinessDay(order: Order, lastNewDayAt: string | null | undefined): boolean {
  if (lastNewDayAt) {
    const sessionStart = new Date(lastNewDayAt).getTime();
    if (!isNaN(sessionStart)) {
      return getOrderTimestamp(order) >= sessionStart;
    }
  }
  return isOrderOnCalendarDay(order);
}
