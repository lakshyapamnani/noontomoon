import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useOrdersStore } from "@/store/orders.store";
import { useSettingsStore } from "@/store/settings.store";
import { minutesBetween, nowMs } from "@/utils/time";
import type { Order } from "@/types";

export function KitchenPage() {
  const orders = useOrdersStore((s) => s.orders);
  const setStatus = useOrdersStore((s) => s.setStatus);
  const settings = useSettingsStore((s) => s.settings);
  const [soundEnabled, setSoundEnabled] = useState(() => settings.kioskSoundEnabled);
  const lastSeenRef = useRef<number>(orders.length);

  useEffect(() => {
    if (orders.length > lastSeenRef.current) {
      const latest = orders[0];
      if (latest && ["active", "preparing"].includes(latest.status)) {
        toast.message(`New order: Token #${latest.token}`);
        if (soundEnabled) beep();
      }
      lastSeenRef.current = orders.length;
    }
  }, [orders, soundEnabled]);

  const active = useMemo(() => orders.filter((o) => ["active", "preparing"].includes(o.status)), [orders]);
  const vegOrders = useMemo(() => active.filter((o) => o.items.some((i) => i.type === "veg")), [active]);
  const nonvegOrders = useMemo(() => active.filter((o) => o.items.some((i) => i.type === "nonveg")), [active]);

  return (
    <div>
      <div className="flex items-end justify-between gap-4">
        <div>
          <div className="text-2xl font-semibold tracking-tight">Kitchen Display</div>
          <div className="mt-1 text-sm text-zinc-400">Large readable queues. Tap to move states.</div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant={soundEnabled ? "secondary" : "ghost"} size="sm" onClick={() => setSoundEnabled((s) => !s)}>
            Sound: {soundEnabled ? "On" : "Off"}
          </Button>
        </div>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <Queue
          title="Veg Orders"
          subtitle={`${vegOrders.length} in queue`}
          tone="emerald"
          orders={vegOrders}
          onAccept={(o) => setStatus(o.id, "preparing")}
          onReady={(o) => setStatus(o.id, "ready")}
        />
        <Queue
          title="Non‑Veg Orders"
          subtitle={`${nonvegOrders.length} in queue`}
          tone="rose"
          orders={nonvegOrders}
          onAccept={(o) => setStatus(o.id, "preparing")}
          onReady={(o) => setStatus(o.id, "ready")}
        />
      </div>
    </div>
  );
}

function Queue({
  title,
  subtitle,
  tone,
  orders,
  onAccept,
  onReady
}: {
  title: string;
  subtitle: string;
  tone: "emerald" | "rose";
  orders: Order[];
  onAccept: (o: Order) => void;
  onReady: (o: Order) => void;
}) {
  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm font-semibold text-zinc-100">{title}</div>
            <div className="mt-1 text-[12px] text-zinc-400">{subtitle}</div>
          </div>
          <div
            className={[
              "rounded-2xl px-3 py-1.5 text-[12px] font-semibold ring-1 ring-white/10",
              tone === "emerald" ? "bg-emerald-500/14 text-emerald-200" : "bg-rose-500/14 text-rose-200"
            ].join(" ")}
          >
            Live
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {orders.length === 0 ? (
          <div className="rounded-2.5xl border border-white/8 bg-white/3 p-8 text-center">
            <div className="text-sm font-semibold text-zinc-100">All caught up</div>
            <div className="mt-1 text-sm text-zinc-400">New orders will appear here instantly.</div>
          </div>
        ) : (
          <div className="space-y-3">
            {orders.map((o) => (
              <div key={o.id} className="rounded-2.5xl border border-white/8 bg-white/3 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-lg font-semibold tracking-tight">#{o.token}</div>
                    <div className="mt-1 text-[12px] text-zinc-400">
                      {o.mode === "dine_in" ? "Dine In" : "Takeaway"} · {o.paymentMode.toUpperCase()} ·{" "}
                      {minutesBetween(nowMs(), o.createdAt)}m
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="secondary" size="sm" onClick={() => onAccept(o)}>
                      Preparing
                    </Button>
                    <Button variant="primary" size="sm" onClick={() => onReady(o)}>
                      Ready
                    </Button>
                  </div>
                </div>
                <div className="mt-3 space-y-2">
                  {o.items
                    .filter((it) => (tone === "emerald" ? it.type === "veg" : it.type === "nonveg"))
                    .map((it) => (
                      <div key={it.itemId} className="flex items-center justify-between rounded-2xl bg-white/4 px-3 py-2">
                        <div className="text-sm font-semibold text-zinc-100">
                          {it.qty}× {it.name}
                        </div>
                        <div className="text-[12px] text-zinc-400">{it.notes ? "Note" : ""}</div>
                      </div>
                    ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function beep() {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = "sine";
    o.frequency.value = 880;
    g.gain.value = 0.04;
    o.connect(g);
    g.connect(ctx.destination);
    o.start();
    setTimeout(() => {
      o.stop();
      ctx.close();
    }, 140);
  } catch {
    // ignore
  }
}

