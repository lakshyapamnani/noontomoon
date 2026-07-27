import { create } from "zustand";
import type { Customer, Order } from "@/types";
import { readDb, updateDb } from "@/services/db";
import { nowMs } from "@/utils/time";
import { createId } from "@/utils/id";

function normalizePhone(phone: string) {
  return phone.replace(/\D/g, "").slice(-10);
}

type State = {
  customers: Customer[];
  load: () => void;
  ingestOrderCustomer: (order: Order) => void;
};

export const useCustomersStore = create<State>((set) => ({
  customers: [],
  load: () => {
    const db = readDb();
    set({ customers: db.customers });
  },
  ingestOrderCustomer: (order) => {
    const phoneRaw = order.customerPhone?.trim();
    if (!phoneRaw) return;
    const phone = normalizePhone(phoneRaw);
    if (!/^\d{10}$/.test(phone)) return;

    const t = nowMs();
    const name = order.customerName?.trim() || "Guest";

    const updated = updateDb((db) => {
      const existing = db.customers.find((c) => c.phone === phone);
      if (!existing) {
        const fresh: Customer = {
          id: createId("cus"),
          name,
          phone,
          ordersCount: 1,
          totalSpent: order.total,
          lastVisitAt: t,
          createdAt: t
        };
        return { ...db, customers: [fresh, ...db.customers] };
      }
      const next: Customer = {
        ...existing,
        name: existing.name === "Guest" && name !== "Guest" ? name : existing.name,
        ordersCount: existing.ordersCount + 1,
        totalSpent: Math.round((existing.totalSpent + order.total) * 100) / 100,
        lastVisitAt: t
      };
      return { ...db, customers: db.customers.map((c) => (c.id === existing.id ? next : c)) };
    });

    set({ customers: updated.customers });
  }
}));

