import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Modal } from "@/components/ui/Modal";
import { Tabs } from "@/components/ui/Tabs";
import { Input } from "@/components/ui/Input";
import { useMenuStore } from "@/store/menu.store";
import { useOrdersStore } from "@/store/orders.store";
import { useCustomersStore } from "@/store/customers.store";
import { minutesBetween, nowMs } from "@/utils/time";
import { inr } from "@/utils/money";
import type { MenuItem, Order, OrderStatus } from "@/types";
import { printBill, printKot } from "@/services/printClient";
import { createId } from "@/utils/id";

type Tab = "cash_pending" | "upi_pending" | "active" | "completed";

const tabItems: Array<{ value: Tab; label: string; hint: string }> = [
  { value: "cash_pending", label: "Cash Pending", hint: "Pay at counter" },
  { value: "upi_pending", label: "UPI Pending", hint: "Await confirmation" },
  { value: "active", label: "Active", hint: "Preparing / Ready" },
  { value: "completed", label: "Completed", hint: "Served / Closed" }
];

export function CounterPage() {
  const { items } = useMenuStore();
  const orders = useOrdersStore((s) => s.orders);
  const setStatus = useOrdersStore((s) => s.setStatus);
  const cancel = useOrdersStore((s) => s.cancel);
  const refund = useOrdersStore((s) => s.refund);
  const markPrinted = useOrdersStore((s) => s.markPrinted);
  const ingestCustomer = useCustomersStore((s) => s.ingestOrderCustomer);

  const [tab, setTab] = useState<Tab>("cash_pending");
  const [selectedId, setSelectedId] = useState<string | null>(orders[0]?.id ?? null);
  const [openPOS, setOpenPOS] = useState(false);

  const filtered = useMemo(() => {
    if (tab === "completed") return orders.filter((o) => ["completed", "served"].includes(o.status));
    if (tab === "active") return orders.filter((o) => ["active", "preparing", "ready"].includes(o.status));
    return orders.filter((o) => o.status === tab);
  }, [orders, tab]);

  const selected = useMemo(() => orders.find((o) => o.id === selectedId) ?? filtered[0] ?? null, [orders, selectedId, filtered]);

  async function doPrint(type: "kot" | "bill", order: Order) {
    try {
      const res = type === "kot" ? await printKot(order) : await printBill(order);
      if (!res.ok) throw new Error("print_failed");
      toast.success(type === "kot" ? "KOT queued to printer." : "Bill queued to printer.");
      if (type === "bill") markPrinted(order.id, "bill");
    } catch {
      toast.error("Print server not reachable. Start local print server.");
    }
  }

  return (
    <div className="grid gap-4 xl:grid-cols-12">
      <div className="xl:col-span-4">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-semibold text-zinc-100">Counter</div>
                <div className="mt-1 text-[12px] text-zinc-400">Select an order to manage</div>
              </div>
              <Button variant="glass" size="sm" onClick={() => setOpenPOS(true)}>
                Emergency POS
              </Button>
            </div>
            <div className="mt-4">
              <Tabs value={tab} onChange={setTab} items={tabItems} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {filtered.length === 0 ? (
                <div className="rounded-2.5xl border border-white/8 bg-white/3 p-5 text-sm text-zinc-400">
                  No orders in this queue.
                </div>
              ) : (
                filtered.map((o) => (
                  <button
                    key={o.id}
                    type="button"
                    onClick={() => setSelectedId(o.id)}
                    className="w-full text-left"
                  >
                    <div
                      className={[
                        "rounded-2.5xl border px-4 py-3 transition",
                        selected?.id === o.id ? "border-indigo-400/30 bg-indigo-500/10" : "border-white/8 bg-white/3 hover:bg-white/5"
                      ].join(" ")}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="truncate text-sm font-semibold text-zinc-100">
                            Token <span className="text-zinc-50">#{o.token}</span>
                          </div>
                          <div className="mt-1 text-[12px] text-zinc-400">
                            {o.items.length} items · {o.paymentMode.toUpperCase()} · {o.mode === "dine_in" ? "Dine In" : "Takeaway"}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-semibold">{inr(o.total)}</div>
                          <div className="mt-1 text-[11px] text-zinc-500">{minutesBetween(nowMs(), o.createdAt)}m</div>
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

      <div className="xl:col-span-5">
        <Card>
          <CardHeader>
            <div className="text-sm font-semibold text-zinc-100">Order details</div>
            <div className="mt-1 text-[12px] text-zinc-400">Items, notes and amounts</div>
          </CardHeader>
          <CardContent>
            {!selected ? (
              <div className="rounded-2.5xl border border-white/8 bg-white/3 p-6 text-sm text-zinc-400">
                Select an order from the left.
              </div>
            ) : (
              <div className="space-y-3">
                <div className="rounded-2.5xl border border-white/8 bg-white/3 p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="text-lg font-semibold tracking-tight">Token #{selected.token}</div>
                      <div className="mt-1 text-[12px] text-zinc-400">
                        {selected.customerName ?? "Guest"} · {selected.customerPhone ?? "—"} · {selected.channel.toUpperCase()}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-zinc-400">Status</div>
                      <div className="mt-1 text-sm font-semibold text-zinc-100">{labelStatus(selected.status)}</div>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  {selected.items.map((it) => (
                    <div key={it.itemId} className="rounded-2xl border border-white/8 bg-white/3 px-4 py-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="truncate text-sm font-semibold">{it.name}</div>
                          <div className="mt-1 text-[12px] text-zinc-400">
                            {it.qty} × {inr(it.unitPrice)} · {it.type.toUpperCase()}
                          </div>
                          {it.notes ? (
                            <div className="mt-2 rounded-2xl bg-white/4 px-3 py-2 text-[12px] text-zinc-300">
                              Note: {it.notes}
                            </div>
                          ) : null}
                        </div>
                        <div className="text-sm font-semibold">{inr(it.unitPrice * it.qty)}</div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="rounded-2.5xl border border-white/8 bg-white/3 px-5 py-4 text-sm">
                  <div className="flex items-center justify-between text-zinc-300">
                    <span>Subtotal</span>
                    <span className="font-semibold">{inr(selected.subtotal)}</span>
                  </div>
                  <div className="mt-2 flex items-center justify-between text-zinc-300">
                    <span>Tax</span>
                    <span className="font-semibold">{inr(selected.tax)}</span>
                  </div>
                  <div className="mt-3 h-px bg-white/8" />
                  <div className="mt-3 flex items-center justify-between text-zinc-50">
                    <span className="font-semibold">Total</span>
                    <span className="text-lg font-semibold tracking-tight">{inr(selected.total)}</span>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="xl:col-span-3">
        <Card>
          <CardHeader>
            <div className="text-sm font-semibold text-zinc-100">Actions</div>
            <div className="mt-1 text-[12px] text-zinc-400">Confirm, prepare, ready, print</div>
          </CardHeader>
          <CardContent>
            {!selected ? (
              <div className="rounded-2.5xl border border-white/8 bg-white/3 p-6 text-sm text-zinc-400">
                Select an order to enable actions.
              </div>
            ) : (
              <div className="space-y-2">
                <Button
                  variant="primary"
                  size="lg"
                  className="w-full"
                  onClick={() => {
                    if (selected.status === "cash_pending" || selected.status === "upi_pending") {
                      setStatus(selected.id, "active");
                      ingestCustomer(selected);
                      toast.success("Payment confirmed.");
                      return;
                    }
                    toast.message("Payment already confirmed.");
                  }}
                >
                  Confirm Payment
                </Button>

                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant="secondary"
                    size="lg"
                    onClick={() => setStatus(selected.id, "preparing")}
                    className="w-full"
                  >
                    Preparing
                  </Button>
                  <Button variant="secondary" size="lg" onClick={() => setStatus(selected.id, "ready")} className="w-full">
                    Ready
                  </Button>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <Button variant="glass" size="lg" onClick={() => void doPrint("kot", selected)} className="w-full">
                    Print KOT
                  </Button>
                  <Button variant="glass" size="lg" onClick={() => void doPrint("bill", selected)} className="w-full">
                    Print Bill
                  </Button>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <Button variant="danger" size="lg" onClick={() => cancel(selected.id)} className="w-full">
                    Cancel
                  </Button>
                  <Button variant="danger" size="lg" onClick={() => refund(selected.id)} className="w-full">
                    Refund
                  </Button>
                </div>

                <div className="mt-3 rounded-2.5xl border border-white/8 bg-white/3 p-4 text-[12px] text-zinc-400">
                  Printing is routed by item type (veg/nonveg) in the local print server.
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <EmergencyPosModal open={openPOS} onClose={() => setOpenPOS(false)} items={items} />
    </div>
  );
}

function labelStatus(s: OrderStatus) {
  if (s === "cash_pending") return "Cash Pending";
  if (s === "upi_pending") return "UPI Pending";
  if (s === "active") return "Active";
  if (s === "preparing") return "Preparing";
  if (s === "ready") return "Ready";
  if (s === "served") return "Served";
  if (s === "completed") return "Completed";
  if (s === "cancelled") return "Cancelled";
  if (s === "refunded") return "Refunded";
  return s;
}

function EmergencyPosModal({ open, onClose, items }: { open: boolean; onClose: () => void; items: MenuItem[] }) {
  const createOrder = useOrdersStore((s) => s.createOrder);
  const ingestCustomer = useCustomersStore((s) => s.ingestOrderCustomer);
  const [q, setQ] = useState("");
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [cart, setCart] = useState<Record<string, number>>({});

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    const active = items.filter((i) => i.isActive);
    if (!query) return active.slice(0, 20);
    return active.filter((i) => i.name.toLowerCase().includes(query)).slice(0, 20);
  }, [items, q]);

  const lines = useMemo(() => {
    return Object.entries(cart)
      .map(([id, qty]) => {
        const it = items.find((x) => x.id === id);
        if (!it) return null;
        return { it, qty };
      })
      .filter(Boolean) as Array<{ it: MenuItem; qty: number }>;
  }, [cart, items]);

  const total = useMemo(() => lines.reduce((s, l) => s + l.it.price * l.qty, 0), [lines]);

  function add(it: MenuItem) {
    setCart((c) => ({ ...c, [it.id]: (c[it.id] ?? 0) + 1 }));
  }
  function dec(it: MenuItem) {
    setCart((c) => {
      const n = (c[it.id] ?? 0) - 1;
      const next = { ...c };
      if (n <= 0) delete next[it.id];
      else next[it.id] = n;
      return next;
    });
  }

  function createCashOrder() {
    const clientRequestId = createId("posreq");
    const draftItems = lines.map((l) => ({
      itemId: l.it.id,
      name: l.it.name,
      type: l.it.type,
      qty: l.qty,
      unitPrice: l.it.price,
      taxPercent: l.it.taxPercent ?? 0
    }));
    const res = createOrder({
      channel: "counter",
      paymentMode: "cash",
      mode: "takeaway",
      customerName: name || undefined,
      customerPhone: phone || undefined,
      items: draftItems,
      clientRequestId
    });
    if (!res.ok) {
      toast.error(res.message);
      return;
    }
    ingestCustomer(res.order);
    toast.success(`Order created. Token #${res.order.token}`);
    setCart({});
    setName("");
    setPhone("");
    setQ("");
    onClose();
  }

  return (
    <Modal open={open} onClose={onClose} title="Emergency POS (manual order)" maxWidth="max-w-4xl">
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <div className="text-[12px] font-semibold text-zinc-300">Search items</div>
          <div className="mt-2">
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Type to search…" />
          </div>
          <div className="mt-3 space-y-2">
            {filtered.map((it) => (
              <div key={it.id} className="flex items-center justify-between rounded-2xl border border-white/8 bg-white/3 px-3 py-2">
                <div className="min-w-0">
                  <div className="truncate text-sm font-semibold">{it.name}</div>
                  <div className="mt-1 text-[12px] text-zinc-400">{inr(it.price)}</div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => dec(it)}
                    className="grid size-9 place-items-center rounded-2xl bg-white/6 ring-1 ring-white/10 transition hover:bg-white/8"
                  >
                    −
                  </button>
                  <div className="w-8 text-center text-sm font-semibold">{cart[it.id] ?? 0}</div>
                  <button
                    type="button"
                    onClick={() => add(it)}
                    className="grid size-9 place-items-center rounded-2xl bg-white/6 ring-1 ring-white/10 transition hover:bg-white/8"
                  >
                    +
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <div className="rounded-2.5xl border border-white/8 bg-white/3 p-4">
            <div className="text-sm font-semibold text-zinc-100">Customer (optional)</div>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Name" />
              <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Phone (10 digits)" />
            </div>
          </div>

          <div className="mt-4 rounded-2.5xl border border-white/8 bg-white/3 p-4">
            <div className="text-sm font-semibold text-zinc-100">Cart</div>
            <div className="mt-3 space-y-2">
              {lines.length === 0 ? (
                <div className="rounded-2xl border border-white/8 bg-white/3 p-4 text-sm text-zinc-400">
                  Add items from the left.
                </div>
              ) : (
                lines.map((l) => (
                  <div key={l.it.id} className="flex items-center justify-between rounded-2xl border border-white/8 bg-white/3 px-3 py-2">
                    <div>
                      <div className="text-sm font-semibold">{l.it.name}</div>
                      <div className="mt-1 text-[12px] text-zinc-400">
                        {l.qty} × {inr(l.it.price)}
                      </div>
                    </div>
                    <div className="text-sm font-semibold">{inr(l.it.price * l.qty)}</div>
                  </div>
                ))
              )}
            </div>
            <div className="mt-3 flex items-center justify-between rounded-2xl border border-white/8 bg-white/3 px-4 py-3">
              <div className="text-sm text-zinc-300">Total</div>
              <div className="text-lg font-semibold tracking-tight">{inr(total)}</div>
            </div>
            <Button variant="primary" size="xl" className="mt-3 w-full" onClick={createCashOrder} disabled={lines.length === 0}>
              Create Cash Order
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}

