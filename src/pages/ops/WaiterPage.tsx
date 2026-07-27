import { useMemo } from "react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useOrdersStore } from "@/store/orders.store";
import { minutesBetween, nowMs } from "@/utils/time";
import type { Order } from "@/types";

export function WaiterPage() {
  const orders = useOrdersStore((s) => s.orders);
  const setStatus = useOrdersStore((s) => s.setStatus);

  const ready = useMemo(() => orders.filter((o) => o.status === "ready"), [orders]);

  return (
    <div>
      <div className="flex items-end justify-between gap-4">
        <div>
          <div className="text-2xl font-semibold tracking-tight">Ready Orders</div>
          <div className="mt-1 text-sm text-zinc-400">Pickup or table delivery, then mark served.</div>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/4 px-4 py-2 text-sm">
          Ready: <span className="font-semibold">{ready.length}</span>
        </div>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
        {ready.length === 0 ? (
          <Card className="lg:col-span-2 xl:col-span-3">
            <CardContent className="p-10 text-center">
              <div className="text-sm font-semibold text-zinc-100">No ready orders</div>
              <div className="mt-1 text-sm text-zinc-400">Orders will appear here when the kitchen marks them ready.</div>
            </CardContent>
          </Card>
        ) : (
          ready.map((o) => (
            <Card key={o.id} className="overflow-hidden">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <div className="text-lg font-semibold tracking-tight">Token #{o.token}</div>
                    <div className="mt-1 text-[12px] text-zinc-400">
                      {o.mode === "dine_in" ? "Dine In" : "Takeaway"} · {minutesBetween(nowMs(), o.createdAt)}m
                    </div>
                  </div>
                  <div className="rounded-2xl bg-emerald-500/12 px-3 py-1.5 text-[12px] font-semibold text-emerald-200 ring-1 ring-emerald-500/25">
                    Ready
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {o.items.map((it) => (
                    <div key={it.itemId} className="flex items-center justify-between rounded-2xl border border-white/8 bg-white/3 px-3 py-2">
                      <div className="text-sm font-semibold text-zinc-100">
                        {it.qty}× {it.name}
                      </div>
                      <div className="text-[12px] text-zinc-400">{it.type.toUpperCase()}</div>
                    </div>
                  ))}
                </div>
                <Button
                  variant="primary"
                  size="lg"
                  className="mt-4 w-full"
                  onClick={() => {
                    setStatus(o.id, "served");
                    toast.success(`Served token #${o.token}`);
                  }}
                >
                  Mark Served
                </Button>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}

