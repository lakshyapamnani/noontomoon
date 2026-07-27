import { create } from "zustand";
import type { AuthSession, Role, User } from "@/types";
import { readDb, updateDb } from "@/services/db";
import { storageGet, storageKey, storageRemove, storageSet } from "@/services/storage";
import { nowMs } from "@/utils/time";

const SESSION_KEY = storageKey(["session"]);

type State = {
  session: AuthSession | null;
  users: User[];
  load: () => void;
  loginWithPin: (role: Role, pin: string) => Promise<{ ok: true } | { ok: false; message: string }>;
  logout: () => void;
};

export const useAuthStore = create<State>((set, get) => ({
  session: storageGet<AuthSession>(SESSION_KEY),
  users: [],
  load: () => {
    const db = readDb();
    set({ users: db.users });
  },
  loginWithPin: async (role, pin) => {
    const { sha256Hex } = await import("@/utils/crypto");
    const pinHash = await sha256Hex(pin.trim());
    const db = readDb();
    const user = db.users.find((u) => u.role === role && u.isActive);
    if (!user) return { ok: false as const, message: "No active user for this role." };
    if (user.pinHash !== pinHash) return { ok: false as const, message: "Incorrect PIN." };
    const session: AuthSession = {
      userId: user.id,
      displayName: user.displayName,
      role: user.role,
      issuedAt: nowMs()
    };
    storageSet(SESSION_KEY, session as any);
    set({ session });
    return { ok: true as const };
  },
  logout: () => {
    storageRemove(SESSION_KEY);
    set({ session: null });
  }
}));

// One-time session timeout safeguard (8 hours)
const MAX_SESSION_MS = 8 * 60 * 60 * 1000;
export function enforceSessionTimeout() {
  const s = storageGet<AuthSession>(SESSION_KEY);
  if (!s) return;
  if (nowMs() - s.issuedAt > MAX_SESSION_MS) storageRemove(SESSION_KEY);
}

export function upsertUser(next: User) {
  const updated = updateDb((db) => {
    const users = db.users.some((u) => u.id === next.id)
      ? db.users.map((u) => (u.id === next.id ? next : u))
      : [next, ...db.users];
    return { ...db, users };
  });
  useAuthStore.setState({ users: updated.users });
}

