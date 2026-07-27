import type { AppSettings, Customer, InventoryItem, MenuCategory, MenuItem, Order, User } from "@/types";
import { storageGet, storageKey, storageSet } from "@/services/storage";
import { nowMs } from "@/utils/time";
import { createId } from "@/utils/id";

export type DinexDb = {
  version: 1;
  meta: {
    nextToken: number;
    lastSeedAt?: number;
  };
  settings: AppSettings;
  users: User[];
  categories: MenuCategory[];
  items: MenuItem[];
  orders: Order[];
  customers: Customer[];
  inventory: InventoryItem[];
};

const KEY = storageKey(["db"]);

export function defaultSettings(): AppSettings {
  return {
    restaurantName: "DINEX Kitchen",
    upiMerchantVpa: "merchant@upi",
    upiMerchantName: "DINEX",
    kioskAutoReturnMs: 45_000,
    kioskSoundEnabled: true,
    printers: {
      vegIp: "192.168.1.50",
      nonvegIp: "192.168.1.51",
      billIp: "192.168.1.52"
    },
    theme: { accent: "indigo" }
  };
}

export function createEmptyDb(): DinexDb {
  const t = nowMs();
  return {
    version: 1,
    meta: { nextToken: 101, lastSeedAt: t },
    settings: defaultSettings(),
    users: [],
    categories: [],
    items: [],
    orders: [],
    customers: [],
    inventory: []
  };
}

export function readDb(): DinexDb {
  const existing = storageGet<DinexDb>(KEY);
  if (existing && existing.version === 1) return existing;
  const fresh = createEmptyDb();
  storageSet(KEY, fresh);
  return fresh;
}

export function writeDb(next: DinexDb) {
  storageSet(KEY, next);
}

export function updateDb(mutator: (db: DinexDb) => DinexDb) {
  const db = readDb();
  const next = mutator(db);
  writeDb(next);
  return next;
}

export function issueToken(): number {
  const next = updateDb((db) => ({
    ...db,
    meta: { ...db.meta, nextToken: db.meta.nextToken + 1 }
  }));
  return next.meta.nextToken - 1;
}

export function ensureAdminUser(seedPinHash: string) {
  updateDb((db) => {
    if (db.users.some((u) => u.role === "admin")) return db;
    const t = nowMs();
    const admin: User = {
      id: createId("usr"),
      displayName: "Admin",
      role: "admin",
      pinHash: seedPinHash,
      isActive: true,
      createdAt: t
    };
    return { ...db, users: [admin, ...db.users] };
  });
}

