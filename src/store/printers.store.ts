import { create } from "zustand";
import { readDb } from "@/services/db";

type OnePrinter = { ip: string; ok: boolean; lastCheckedAt: number };
type PrinterStatus = { veg: OnePrinter; nonveg: OnePrinter; bill: OnePrinter };

function computeStatus(): PrinterStatus {
  const db = readDb();
  const t = Date.now();
  const mk = (ip: string): OnePrinter => ({ ip, ok: Boolean(ip?.trim()), lastCheckedAt: t });
  return {
    veg: mk(db.settings.printers.vegIp),
    nonveg: mk(db.settings.printers.nonvegIp),
    bill: mk(db.settings.printers.billIp)
  };
}

export const usePrinterStatusStore = create<{
  status: PrinterStatus;
  refresh: () => void;
}>((set) => ({
  status: computeStatus(),
  refresh: () => set({ status: computeStatus() })
}));

