import { create } from "zustand";
import type { MenuCategory, MenuItem } from "@/types";
import { readDb, updateDb } from "@/services/db";

type State = {
  categories: MenuCategory[];
  items: MenuItem[];
  load: () => void;
  upsertCategory: (cat: MenuCategory) => void;
  upsertItem: (item: MenuItem) => void;
};

export const useMenuStore = create<State>((set) => ({
  categories: [],
  items: [],
  load: () => {
    const db = readDb();
    set({ categories: db.categories, items: db.items });
  },
  upsertCategory: (cat) => {
    const updated = updateDb((db) => {
      const categories = db.categories.some((c) => c.id === cat.id)
        ? db.categories.map((c) => (c.id === cat.id ? cat : c))
        : [...db.categories, cat].sort((a, b) => a.sort - b.sort);
      return { ...db, categories };
    });
    set({ categories: updated.categories });
  },
  upsertItem: (item) => {
    const updated = updateDb((db) => {
      const items = db.items.some((i) => i.id === item.id)
        ? db.items.map((i) => (i.id === item.id ? item : i))
        : [...db.items, item];
      return { ...db, items };
    });
    set({ items: updated.items });
  }
}));

