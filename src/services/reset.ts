import { createEmptyDb, writeDb } from "@/services/db";
import { storageKey } from "@/services/storage";

export function hardResetDinex() {
  // Keep request-id dedupe small state separate; reset it too.
  localStorage.removeItem(storageKey(["db"]));
  localStorage.removeItem("dinex:orderRequestIds");
  writeDb(createEmptyDb());
}

