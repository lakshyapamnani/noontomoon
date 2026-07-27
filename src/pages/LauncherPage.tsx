import { motion } from "framer-motion";
import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuthStore } from "@/store/auth.store";
import type { Role } from "@/types";
import { Card, CardContent } from "@/components/ui/Card";
import { cn } from "@/utils/cn";

type Tile = {
  title: string;
  subtitle: string;
  route: string;
  allow: Role[];
  tone: "indigo" | "emerald" | "rose" | "amber" | "zinc";
};

const tiles: Tile[] = [
  { title: "Counter", subtitle: "Billing · Payments · Bills", route: "/counter", allow: ["admin", "counter", "manager"], tone: "indigo" },
  { title: "Kitchen", subtitle: "Veg/Non‑Veg queues · KDS", route: "/kitchen", allow: ["admin", "kitchen", "manager"], tone: "emerald" },
  { title: "Waiter", subtitle: "Ready orders · Serve flow", route: "/waiter", allow: ["admin", "waiter", "manager"], tone: "amber" },
  { title: "Orders", subtitle: "History · Invoices · Search", route: "/orders", allow: ["admin", "counter", "manager"], tone: "zinc" },
  { title: "Reports", subtitle: "Charts · Peak hours · KPIs", route: "/reports", allow: ["admin", "manager"], tone: "indigo" },
  { title: "Inventory", subtitle: "Stock · Low alerts · Units", route: "/inventory", allow: ["admin", "manager"], tone: "emerald" },
  { title: "Admin", subtitle: "Menu · Users · Printers", route: "/admin", allow: ["admin"], tone: "rose" },
  { title: "Kiosk Control", subtitle: "Launch kiosk · Fullscreen", route: "/kiosk", allow: ["admin", "manager"], tone: "zinc" }
];

export function LauncherPage() {
  const navigate = useNavigate();
  const session = useAuthStore((s) => s.session);

  const allowed = useMemo(() => {
    if (!session) return new Set<string>();
    return new Set(tiles.filter((t) => t.allow.includes(session.role)).map((t) => t.route));
  }, [session]);

  return (
    <div>
      <div className="flex items-end justify-between gap-4">
        <div>
          <div className="text-2xl font-semibold tracking-tight">Launcher</div>
          <div className="mt-1 text-sm text-zinc-400">
            Pick a workspace. Everything is role-aware and built for touch + speed.
          </div>
        </div>
        {!session ? (
          <button
            type="button"
            onClick={() => navigate("/login")}
            className="rounded-2xl bg-white/6 px-4 py-2 text-sm font-semibold ring-1 ring-white/10 transition hover:bg-white/8"
          >
            Sign in
          </button>
        ) : (
          <div className="text-right">
            <div className="text-sm font-semibold text-zinc-100">{session.displayName}</div>
            <div className="text-[12px] text-zinc-400">{session.role.toUpperCase()}</div>
          </div>
        )}
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {tiles.map((t, idx) => {
          const can = session ? t.allow.includes(session.role) : false;
          return (
            <motion.button
              key={t.route}
              type="button"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.32, ease: "easeOut", delay: 0.03 * idx }}
              onClick={() => {
                if (!session) {
                  toast.message("Sign in required.");
                  navigate("/login");
                  return;
                }
                if (!can) {
                  toast.error("Access denied for your role.");
                  return;
                }
                navigate(t.route);
              }}
              className="text-left"
            >
              <Card
                className={cn(
                  "group relative overflow-hidden transition",
                  can ? "hover:bg-white/6" : "opacity-60",
                  "focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400/30"
                )}
              >
                <div
                  className={cn(
                    "absolute -right-24 -top-20 size-56 rounded-full blur-3xl opacity-55 transition group-hover:opacity-70",
                    t.tone === "indigo"
                      ? "bg-indigo-500/25"
                      : t.tone === "emerald"
                        ? "bg-emerald-500/22"
                        : t.tone === "rose"
                          ? "bg-rose-500/22"
                          : t.tone === "amber"
                            ? "bg-amber-500/18"
                            : "bg-white/10"
                  )}
                />
                <CardContent className="relative px-5 py-5">
                  <div className="text-lg font-semibold tracking-tight">{t.title}</div>
                  <div className="mt-1 text-sm text-zinc-400">{t.subtitle}</div>
                  <div className="mt-5 flex items-center justify-between">
                    <div className="text-[12px] text-zinc-500">{can ? "Open" : "Not permitted"}</div>
                    <div className="rounded-2xl bg-white/6 px-3 py-1.5 text-[12px] font-semibold text-zinc-200 ring-1 ring-white/10 transition group-hover:bg-white/8">
                      →
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.button>
          );
        })}
      </div>

      {session && allowed.has("/admin") ? (
        <div className="mt-7 rounded-2.5xl border border-white/8 bg-white/3 px-5 py-4">
          <div className="text-sm font-semibold text-zinc-100">First run?</div>
          <div className="mt-1 text-sm text-zinc-400">
            Use <span className="text-zinc-200">Seed</span> to reset demo data quickly.
          </div>
          <button
            type="button"
            onClick={() => navigate("/seed")}
            className="mt-3 inline-flex h-10 items-center rounded-2xl bg-white/6 px-4 text-sm font-semibold ring-1 ring-white/10 transition hover:bg-white/8"
          >
            Open Seed Tools
          </button>
        </div>
      ) : null}
    </div>
  );
}

