import { create } from "zustand";
import type { AppSettings } from "@/types";
import { defaultSettings, readDb, updateDb } from "@/services/db";

type State = {
  settings: AppSettings;
  load: () => void;
  patch: (partial: Partial<AppSettings>) => void;
};

export const useSettingsStore = create<State>((set) => ({
  settings: defaultSettings(),
  load: () => {
    const db = readDb();
    set({ settings: db.settings });
  },
  patch: (partial) => {
    const updated = updateDb((db) => ({
      ...db,
      settings: {
        ...db.settings,
        ...partial,
        printers: { ...db.settings.printers, ...(partial.printers ?? {}) },
        theme: { ...db.settings.theme, ...(partial.theme ?? {}) }
      }
    }));
    set({ settings: updated.settings });
  }
}));

