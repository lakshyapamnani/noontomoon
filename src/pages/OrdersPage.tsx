import { useMemo, useState } from "react";
import { format, isSameDay, subDays } from "date-fns";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Tabs } from "@/components/ui/Tabs";
import { useOrdersStore } from "@/store/orders.store";
import type { Order } from "@/types";
import { inr } from "@/utils/money";

type Range = "today" | "yesterday" | "all";

export function OrdersPage() {
  const orders = useOrdersStore((s) => s.orders);
  const [range, setRange] = useState<Range>("today");
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<Order | null>(null);

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    const today = new Date();
    const yday = subDays(today, 1);
    return orders
      .filter((o) => {
        const d = new Date(o.createdAt);
        if (range === "today") return isSameDay(d, today);
        if (range === "yesterday") return isSameDay(d, yday);
        return true;
      })
      .filter((o) => {
        if (!query) return true;
        return (
          String(o.token).includes(query) ||
          o.id.toLowerCase().includes(query) ||
          (o.customerPhone ?? "").includes(query) ||
          (o.customerName ?? "").toLowerCase().includes(query)
        );
      });
  }, [orders, range, q]);

  const total = useMemo(() => filtered.reduce((s, o) => s + o.total, 0), [filtered]);

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="text-2xl font-semibold tracking-tight">Order History</div>
          <div className="mt-1 text-sm text-zinc-400">Search by phone, token or order id.</div>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/4 px-4 py-2 text-sm">
          Total: <span className="font-semibold">{inr(total)}</span>
        </div>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-12">
        <Card className="lg:col-span-4">
          <CardHeader>
            <div className="text-sm font-semibold text-zinc-100">Filters</div>
            <div className="mt-1 text-[12px] text-zinc-400">Quick date ranges</div>
            <div className="mt-4">
              <Tabs
                value={range}
                onChange={setRange}
                items={[
                  { value: "today", label: "Today" },
                  { value: "yesterday", label: "Yesterday" },
                  { value: "all", label: "All" }
                ]}
              />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-[12px] font-semibold text-zinc-300">Search</div>
            <div className="mt-2">
              <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Token, phone, order id…" />
            </div>
            <div className="mt-4 rounded-2.5xl border border-white/8 bg-white/3 p-4 text-sm text-zinc-400">
              Showing <span className="text-zinc-200 font-semibold">{filtered.length}</span> orders
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-8">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-semibold text-zinc-100">Orders</div>
                <div className="mt-1 text-[12px] text-zinc-400">Tap an order to view invoice</div>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setQ("")}>
                Clear
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {filtered.length === 0 ? (
                <div className="rounded-2.5xl border border-white/8 bg-white/3 p-10 text-center">
                  <div className="text-sm font-semibold text-zinc-100">No orders</div>
                  <div className="mt-1 text-sm text-zinc-400">Try expanding the date range.</div>
                </div>
              ) : (
                filtered.map((o) => (
                  <button
                    key={o.id}
                    type="button"
                    onClick={() => {
                      setSelected(o);
                      setOpen(true);
                    }}
                    className="w-full text-left"
                  >
                    <div className="rounded-2.5xl border border-white/8 bg-white/3 px-4 py-3 transition hover:bg-white/5">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="truncate text-sm font-semibold text-zinc-100">
                            Token #{o.token} · {o.customerName ?? "Guest"}
                          </div>
                          <div className="mt-1 text-[12px] text-zinc-400">
                            {format(new Date(o.createdAt), "dd MMM, hh:mm a")} · {o.paymentMode.toUpperCase()} · {o.status.replaceAll("_", " ")}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-semibold">{inr(o.total)}</div>
                          <div className="mt-1 text-[11px] text-zinc-500">{o.items.length} items</div>
                        </div>
                      </div>
                    </div>
                  </button>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <InvoiceModal open={open} onClose={() => setOpen(false)} order={selected} />
    </div>
  );
}

function InvoiceModal({ open, onClose, order }: { open: boolean; onClose: () => void; order: Order | null }) {
  return (
    <Modal open={open} onClose={onClose} title={order ? `Invoice · Token #${order.token}` : "Invoice"} maxWidth="max-w-2xl">
      {!order ? (
        <div className="text-sm text-zinc-400">No order selected.</div>
      ) : (
        <div className="space-y-3">
          <div className="rounded-2.5xl border border-white/8 bg-white/3 p-4">
            <div className="flex items-start justify-between">
              <div>
                <div className="text-sm font-semibold text-zinc-100">{order.customerName ?? "Guest"}</div>
                <div className="mt-1 text-[12px] text-zinc-400">{order.customerPhone ?? "—"}</div>
              </div>
              <div className="text-right text-[12px] text-zinc-400">
                <div>{format(new Date(order.createdAt), "dd MMM yyyy")}</div>
                <div>{format(new Date(order.createdAt), "hh:mm a")}</div>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            {order.items.map((it) => (
              <div key={it.itemId} className="flex items-center justify-between rounded-2xl border border-white/8 bg-white/3 px-3 py-2">
                <div className="text-sm font-semibold text-zinc-100">
                  {it.qty}× {it.name}
                </div>
                <div className="text-sm font-semibold">{inr(it.unitPrice * it.qty)}</div>
              </div>
            ))}
          </div>

          <div className="rounded-2.5xl border border-white/8 bg-white/3 px-4 py-3 text-sm">
            <div className="flex items-center justify-between text-zinc-300">
              <span>Subtotal</span>
              <span className="font-semibold">{inr(order.subtotal)}</span>
            </div>
            <div className="mt-2 flex items-center justify-between text-zinc-300">
              <span>Tax</span>
              <span className="font-semibold">{inr(order.tax)}</span>
            </div>
            <div className="mt-3 h-px bg-white/8" />
            <div className="mt-3 flex items-center justify-between text-zinc-50">
              <span className="font-semibold">Total</span>
              <span className="text-lg font-semibold tracking-tight">{inr(order.total)}</span>
            </div>
          </div>

          <div className="flex gap-2">
            <Button variant="primary" size="lg" onClick={() => window.print()}>
              Print (browser)
            </Button>
            <Button variant="secondary" size="lg" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
}

