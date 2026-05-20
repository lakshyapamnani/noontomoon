import { CartItem, KotPrintState } from '../types';

export type { KotPrintState };

export const DEFAULT_KOT_MERGE_WINDOW_MINUTES = 3;

/** Firebase-safe storage (dynamic keys in printedItems break RTDB). */
export interface KotPrintStateStored {
  lastPrintedAt: number;
  printedLines?: Array<{ k: string; q: number }>;
  /** @deprecated legacy map format */
  printedItems?: Record<string, number>;
}

export function getKotMergeWindowMinutes(value: unknown): number {
  const n = Number(value);
  if (!Number.isNaN(n) && n >= 0) return n;
  return DEFAULT_KOT_MERGE_WINDOW_MINUTES;
}

export function getKotMergeWindowMs(minutes: number | undefined): number {
  return getKotMergeWindowMinutes(minutes) * 60 * 1000;
}

function deserializePrintedItems(raw: unknown): Record<string, number> {
  const printed: Record<string, number> = {};

  if (Array.isArray(raw)) {
    raw.forEach((entry) => {
      if (!entry || typeof entry !== 'object') return;
      const row = entry as { k?: unknown; q?: unknown; id?: unknown; qty?: unknown };
      const key = String(row.k ?? row.id ?? '');
      const qty = Number(row.q ?? row.qty);
      if (key && !Number.isNaN(qty) && qty > 0) printed[key] = qty;
    });
    return printed;
  }

  if (raw && typeof raw === 'object') {
    Object.entries(raw as Record<string, unknown>).forEach(([id, qty]) => {
      const n = Number(qty);
      if (!Number.isNaN(n) && n > 0) printed[id] = n;
    });
  }

  return printed;
}

export function normalizeKotPrintState(value: unknown): KotPrintState | undefined {
  if (!value || typeof value !== 'object') return undefined;
  const raw = value as KotPrintStateStored;
  const lastPrintedAt = Number(raw.lastPrintedAt);
  if (Number.isNaN(lastPrintedAt) || lastPrintedAt <= 0) return undefined;

  const printedItems = deserializePrintedItems(
    raw.printedLines ?? raw.printedItems ?? []
  );

  return { lastPrintedAt, printedItems };
}

export function toStoredKotPrintState(state: KotPrintState): KotPrintStateStored {
  return {
    lastPrintedAt: state.lastPrintedAt,
    printedLines: Object.entries(state.printedItems).map(([k, q]) => ({ k, q })),
  };
}

export type KotPrintMode = 'all' | 'new';

export function getKotItemsToPrint(
  currentCart: CartItem[],
  kotState: KotPrintState | undefined,
  mergeWindowMinutes: number | undefined
): { items: CartItem[]; mode: KotPrintMode } {
  if (currentCart.length === 0) return { items: [], mode: 'all' };

  const now = Date.now();
  const windowMs = getKotMergeWindowMs(mergeWindowMinutes);
  const hasPriorPrint = !!kotState?.lastPrintedAt && kotState.lastPrintedAt > 0;
  const withinWindow = hasPriorPrint && now - kotState!.lastPrintedAt < windowMs;

  // First print, or re-print within merge window → full cart
  if (!hasPriorPrint || withinWindow) {
    return { items: currentCart, mode: 'all' };
  }

  // After merge window → only items/qty not yet sent to kitchen
  const newItems: CartItem[] = [];
  currentCart.forEach(item => {
    const lineKey = getKotLineKey(item);
    const printedQty = kotState!.printedItems[lineKey] ?? kotState!.printedItems[item.id] ?? 0;
    const delta = item.quantity - printedQty;
    if (delta > 0) {
      newItems.push({ ...item, quantity: delta });
    }
  });

  return { items: newItems, mode: 'new' };
}

/** Stable key for KOT tracking (matches cart line identity). */
export function getKotLineKey(item: CartItem): string {
  return item.id;
}

export function buildKotStateAfterPrint(currentCart: CartItem[], printedAt = Date.now()): KotPrintState {
  const printedItems: Record<string, number> = {};
  currentCart.forEach(item => {
    const key = getKotLineKey(item);
    printedItems[key] = item.quantity;
  });
  return { lastPrintedAt: printedAt, printedItems };
}

export function mergeKotPrintStates(
  a: KotPrintState | undefined,
  b: KotPrintState | undefined
): KotPrintState | undefined {
  if (!a && !b) return undefined;
  const printedItems: Record<string, number> = { ...(a?.printedItems || {}) };
  Object.entries(b?.printedItems || {}).forEach(([id, qty]) => {
    printedItems[id] = Math.max(printedItems[id] || 0, qty);
  });
  const lastPrintedAt = Math.max(a?.lastPrintedAt || 0, b?.lastPrintedAt || 0);
  if (lastPrintedAt <= 0 && Object.keys(printedItems).length === 0) return undefined;
  return { lastPrintedAt, printedItems };
}
