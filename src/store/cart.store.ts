import { create } from "zustand";
import type { FoodType, MenuItem } from "@/types";
import { round2 } from "@/utils/money";

export type CartLine = {
  itemId: string;
  name: string;
  type: FoodType;
  unitPrice: number;
  qty: number;
  notes?: string;
  taxPercent?: number;
};

type State = {
  lines: CartLine[];
  search: string;
  activeType: FoodType;
  activeCategoryId: string | null;
  setSearch: (s: string) => void;
  setActiveType: (t: FoodType) => void;
  setActiveCategoryId: (id: string | null) => void;
  add: (item: MenuItem) => void;
  dec: (itemId: string) => void;
  setQty: (itemId: string, qty: number) => void;
  setNotes: (itemId: string, notes: string) => void;
  clear: () => void;
  subtotal: () => number;
  tax: () => number;
  total: () => number;
};

export const useCartStore = create<State>((set, get) => ({
  lines: [],
  search: "",
  activeType: "veg",
  activeCategoryId: null,
  setSearch: (s) => set({ search: s }),
  setActiveType: (t) => set({ activeType: t, activeCategoryId: null }),
  setActiveCategoryId: (id) => set({ activeCategoryId: id }),
  add: (item) => {
    const existing = get().lines.find((l) => l.itemId === item.id);
    if (!existing) {
      set({
        lines: [
          ...get().lines,
          {
            itemId: item.id,
            name: item.name,
            type: item.type,
            unitPrice: item.price,
            qty: 1,
            taxPercent: item.taxPercent ?? 0
          }
        ]
      });
      return;
    }
    set({
      lines: get().lines.map((l) => (l.itemId === item.id ? { ...l, qty: l.qty + 1 } : l))
    });
  },
  dec: (itemId) => {
    const line = get().lines.find((l) => l.itemId === itemId);
    if (!line) return;
    if (line.qty <= 1) {
      set({ lines: get().lines.filter((l) => l.itemId !== itemId) });
      return;
    }
    set({ lines: get().lines.map((l) => (l.itemId === itemId ? { ...l, qty: l.qty - 1 } : l)) });
  },
  setQty: (itemId, qty) => {
    const q = Math.max(0, Math.floor(qty));
    if (q === 0) {
      set({ lines: get().lines.filter((l) => l.itemId !== itemId) });
      return;
    }
    set({ lines: get().lines.map((l) => (l.itemId === itemId ? { ...l, qty: q } : l)) });
  },
  setNotes: (itemId, notes) => {
    const clean = notes.trim();
    set({
      lines: get().lines.map((l) => (l.itemId === itemId ? { ...l, notes: clean || undefined } : l))
    });
  },
  clear: () => set({ lines: [], search: "", activeCategoryId: null }),
  subtotal: () => round2(get().lines.reduce((sum, l) => sum + l.unitPrice * l.qty, 0)),
  tax: () =>
    round2(get().lines.reduce((sum, l) => sum + (l.unitPrice * l.qty * (l.taxPercent ?? 0)) / 100, 0)),
  total: () => round2(get().subtotal() + get().tax())
}));

