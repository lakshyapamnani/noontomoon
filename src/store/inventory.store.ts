import { create } from "zustand";
import type { InventoryItem } from "@/types";
import { readDb, updateDb } from "@/services/db";

type State = {
  inventory: InventoryItem[];
  load: () => void;
  upsert: (item: InventoryItem) => void;
  remove: (id: string) => void;
};

export const useInventoryStore = create<State>((set) => ({
  inventory: [],
  load: () => {
    const db = readDb();
    set({ inventory: db.inventory });
  },
  upsert: (item) => {
    const updated = updateDb((db) => {
      const inventory = db.inventory.some((i) => i.id === item.id)
        ? db.inventory.map((i) => (i.id === item.id ? item : i))
        : [item, ...db.inventory];
      return { ...db, inventory };
    });
    set({ inventory: updated.inventory });
  },
  remove: (id) => {
    const updated = updateDb((db) => ({ ...db, inventory: db.inventory.filter((i) => i.id !== id) }));
    set({ inventory: updated.inventory });
  }
}));

