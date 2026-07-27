import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import type { Role } from "@/types";
import { useAuthStore } from "@/store/auth.store";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { cn } from "@/utils/cn";
import { demoPin } from "@/services/seed";

const roles: Array<{ role: Role; label: string; hint: string }> = [
  { role: "admin", label: "Admin", hint: "Setup & control" },
  { role: "counter", label: "Counter", hint: "Billing & payments" },
  { role: "kitchen", label: "Kitchen", hint: "KDS & KOT" },
  { role: "waiter", label: "Waiter", hint: "Ready → Served" },
  { role: "manager", label: "Manager", hint: "Reports & ops" }
];

export function LoginPage() {
  const navigate = useNavigate();
  const loginWithPin = useAuthStore((s) => s.loginWithPin);
  const [role, setRole] = useState<Role>("counter");
  const [pin, setPin] = useState("");
  const pinMasked = useMemo(() => "•".repeat(pin.length), [pin.length]);

  async function onLogin() {
    const res = await loginWithPin(role, pin);
    if (!res.ok) {
      toast.error(res.message);
      setPin("");
      return;
    }
    toast.success("Welcome back.");
    navigate("/launcher", { replace: true });
  }

  return (
    <div className="dinex-grain min-h-screen bg-zinc-950">
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_10%,rgba(99,102,241,0.18),transparent_42%),radial-gradient(circle_at_85%_25%,rgba(16,185,129,0.10),transparent_45%),radial-gradient(circle_at_45%_90%,rgba(244,63,94,0.08),transparent_50%)]" />
      </div>

      <div className="mx-auto grid max-w-6xl gap-6 px-4 py-10 md:grid-cols-2 md:gap-7 md:px-6 md:py-16">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
        >
          <div className="flex items-center gap-3">
            <div className="grid size-12 place-items-center rounded-3xl bg-white/6 ring-1 ring-white/10 shadow-glass">
              <span className="text-base font-semibold tracking-tight">DX</span>
            </div>
            <div>
              <div className="text-lg font-semibold tracking-tight">DINEX</div>
              <div className="text-sm text-zinc-400">Premium Restaurant POS + Kiosk</div>
            </div>
          </div>

          <div className="mt-10">
            <div className="text-sm font-semibold text-zinc-100">Select role</div>
            <div className="mt-3 grid grid-cols-2 gap-3 lg:grid-cols-3">
              {roles.map((r) => (
                <button
                  key={r.role}
                  type="button"
                  onClick={() => setRole(r.role)}
                  className={cn(
                    "rounded-2.5xl border px-4 py-4 text-left transition",
                    "bg-white/4 hover:bg-white/6",
                    role === r.role ? "border-indigo-400/35 ring-2 ring-indigo-400/15" : "border-white/8"
                  )}
                >
                  <div className="text-sm font-semibold tracking-tight">{r.label}</div>
                  <div className="mt-1 text-[12px] text-zinc-400">{r.hint}</div>
                </button>
              ))}
            </div>
          </div>

          <div className="mt-10 rounded-2.5xl border border-white/8 bg-white/3 p-4">
            <div className="text-[12px] text-zinc-400">Demo access (localStorage seed)</div>
            <div className="mt-1 text-sm text-zinc-200">
              Default PIN: <span className="font-semibold tracking-tight">{demoPin()}</span>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut", delay: 0.06 }}
        >
          <Card className="overflow-hidden">
            <CardHeader>
              <div className="flex items-end justify-between">
                <div>
                  <div className="text-sm font-semibold text-zinc-100">PIN login</div>
                  <div className="mt-1 text-[12px] text-zinc-400">Fast sign-in for staff stations</div>
                </div>
                <div className="text-[12px] text-zinc-400">
                  Role: <span className="text-zinc-200">{role.toUpperCase()}</span>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="rounded-2xl border border-white/10 bg-white/4 px-4 py-4">
                <div className="text-[11px] text-zinc-400">Enter PIN</div>
                <div className="mt-2 h-10 text-2xl font-semibold tracking-[0.22em] text-zinc-100">
                  {pinMasked || "— — — —"}
                </div>
              </div>

              <div className="mt-5">
                <PinPad
                  onDigit={(d) => setPin((p) => (p.length >= 6 ? p : p + d))}
                  onBack={() => setPin((p) => p.slice(0, -1))}
                  onClear={() => setPin("")}
                  onEnter={onLogin}
                />
              </div>

              <div className="mt-6 flex items-center gap-2">
                <Button variant="primary" size="lg" className="flex-1" onClick={onLogin} disabled={pin.length < 4}>
                  Sign in
                </Button>
                <Button variant="ghost" size="lg" onClick={() => setPin("")}>
                  Reset
                </Button>
              </div>

              <div className="mt-4 text-[12px] text-zinc-500">
                This build runs entirely on-device using localStorage. Replace auth + DB with Firebase later.
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}

function PinPad({
  onDigit,
  onBack,
  onClear,
  onEnter
}: {
  onDigit: (d: string) => void;
  onBack: () => void;
  onClear: () => void;
  onEnter: () => void;
}) {
  const keys = ["1", "2", "3", "4", "5", "6", "7", "8", "9"];
  return (
    <div className="grid grid-cols-3 gap-2">
      {keys.map((k) => (
        <button
          key={k}
          type="button"
          onClick={() => onDigit(k)}
          className={cn(
            "h-14 rounded-2xl border border-white/10 bg-white/4 text-lg font-semibold text-zinc-100",
            "transition hover:bg-white/7 active:translate-y-[1px]"
          )}
        >
          {k}
        </button>
      ))}
      <button
        type="button"
        onClick={onClear}
        className="h-14 rounded-2xl border border-white/10 bg-white/4 text-sm font-semibold text-zinc-200 transition hover:bg-white/7"
      >
        Clear
      </button>
      <button
        type="button"
        onClick={() => onDigit("0")}
        className="h-14 rounded-2xl border border-white/10 bg-white/4 text-lg font-semibold text-zinc-100 transition hover:bg-white/7"
      >
        0
      </button>
      <button
        type="button"
        onClick={onBack}
        className="h-14 rounded-2xl border border-white/10 bg-white/4 text-sm font-semibold text-zinc-200 transition hover:bg-white/7"
      >
        Back
      </button>
      <Button
        variant="glass"
        size="lg"
        className="col-span-3 h-12 rounded-2xl"
        onClick={onEnter}
        type="button"
      >
        Enter
      </Button>
    </div>
  );
}

