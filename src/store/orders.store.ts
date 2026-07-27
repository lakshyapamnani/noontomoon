import { create } from "zustand";
import type { Order, OrderStatus, PaymentMode } from "@/types";
import { issueToken, readDb, updateDb } from "@/services/db";
import { nowMs } from "@/utils/time";
import { createId } from "@/utils/id";
import { round2 } from "@/utils/money";

type CreateDraft = {
  channel: "kiosk" | "counter";
  paymentMode: PaymentMode;
  mode: "dine_in" | "takeaway";
  customerName?: string;
  customerPhone?: string;
  tableNo?: string;
  items: Array<{
    itemId: string;
    name: string;
    type: "veg" | "nonveg" | "dessert";
    qty: number;
    unitPrice: number;
    notes?: string;
    taxPercent?: number;
  }>;
  clientRequestId: string;
};

type State = {
  orders: Order[];
  load: () => void;
  createOrder: (draft: CreateDraft) => { ok: true; order: Order } | { ok: false; message: string };
  setStatus: (orderId: string, status: OrderStatus) => void;
  markPrinted: (orderId: string, which: "veg" | "nonveg" | "bill") => void;
  cancel: (orderId: string) => void;
  refund: (orderId: string) => void;
};

const REQUEST_DEDUP_KEY = "dinex:orderRequestIds";

function getSeenRequestIds() {
  try {
    const raw = localStorage.getItem(REQUEST_DEDUP_KEY);
    const ids = raw ? (JSON.parse(raw) as string[]) : [];
    return new Set(ids);
  } catch {
    return new Set<string>();
  }
}
function addSeenRequestId(id: string) {
  const set = getSeenRequestIds();
  set.add(id);
  localStorage.setItem(REQUEST_DEDUP_KEY, JSON.stringify([...set].slice(-250)));
}

export const useOrdersStore = create<State>((set) => ({
  orders: [],
  load: () => {
    const db = readDb();
    set({ orders: db.orders });
  },
  createOrder: (draft) => {
    const seen = getSeenRequestIds();
    if (seen.has(draft.clientRequestId)) return { ok: false, message: "Duplicate checkout prevented." };

    if (!draft.items.length) return { ok: false, message: "Cart is empty." };
    if (draft.customerPhone && !/^\d{10}$/.test(draft.customerPhone)) {
      return { ok: false, message: "Phone must be 10 digits." };
    }

    const t = nowMs();
    const token = issueToken();
    const subtotal = round2(draft.items.reduce((sum, it) => sum + it.unitPrice * it.qty, 0));
    const tax = round2(
      draft.items.reduce((sum, it) => {
        const pct = it.taxPercent ?? 0;
        return sum + (it.unitPrice * it.qty * pct) / 100;
      }, 0)
    );
    const total = round2(subtotal + tax);

    const status: OrderStatus =
      draft.paymentMode === "cash" ? "cash_pending" : draft.paymentMode === "upi" ? "upi_pending" : "active";

    const order: Order = {
      id: createId("ord"),
      token,
      createdAt: t,
      updatedAt: t,
      channel: draft.channel,
      status,
      paymentMode: draft.paymentMode,
      mode: draft.mode,
      customerName: draft.customerName?.trim() || undefined,
      customerPhone: draft.customerPhone?.trim() || undefined,
      tableNo: draft.tableNo?.trim() || undefined,
      items: draft.items.map((it) => ({
        itemId: it.itemId,
        name: it.name,
        type: it.type,
        qty: it.qty,
        unitPrice: it.unitPrice,
        notes: it.notes?.trim() || undefined
      })),
      subtotal,
      tax,
      total,
      flags: {}
    };

    const updated = updateDb((db) => ({ ...db, orders: [order, ...db.orders] }));
    addSeenRequestId(draft.clientRequestId);
    set({ orders: updated.orders });
    return { ok: true, order };
  },
  setStatus: (orderId, status) => {
    const t = nowMs();
    const updated = updateDb((db) => ({
      ...db,
      orders: db.orders.map((o) => (o.id === orderId ? { ...o, status, updatedAt: t } : o))
    }));
    set({ orders: updated.orders });
  },
  markPrinted: (orderId, which) => {
    const t = nowMs();
    const updated = updateDb((db) => ({
      ...db,
      orders: db.orders.map((o) => {
        if (o.id !== orderId) return o;
        const flags = { ...(o.flags ?? {}) };
        if (which === "veg") flags.vegPrintedAt = flags.vegPrintedAt ?? t;
        if (which === "nonveg") flags.nonvegPrintedAt = flags.nonvegPrintedAt ?? t;
        if (which === "bill") flags.billPrintedAt = flags.billPrintedAt ?? t;
        return { ...o, flags, updatedAt: t };
      })
    }));
    set({ orders: updated.orders });
  },
  cancel: (orderId) => {
    const t = nowMs();
    const updated = updateDb((db) => ({
      ...db,
      orders: db.orders.map((o) => (o.id === orderId ? { ...o, status: "cancelled", updatedAt: t } : o))
    }));
    set({ orders: updated.orders });
  },
  refund: (orderId) => {
    const t = nowMs();
    const updated = updateDb((db) => ({
      ...db,
      orders: db.orders.map((o) => (o.id === orderId ? { ...o, status: "refunded", updatedAt: t } : o))
    }));
    set({ orders: updated.orders });
  }
}));

