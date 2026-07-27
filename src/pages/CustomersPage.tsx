import { useMemo, useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { useCustomersStore } from "@/store/customers.store";
import { inr } from "@/utils/money";

export function CustomersPage() {
  const customers = useCustomersStore((s) => s.customers);
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    const list = [...customers].sort((a, b) => b.lastVisitAt - a.lastVisitAt);
    if (!query) return list;
    return list.filter((c) => c.phone.includes(query) || c.name.toLowerCase().includes(query));
  }, [customers, q]);

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="text-2xl font-semibold tracking-tight">Customers</div>
          <div className="mt-1 text-sm text-zinc-400">CRM capture from kiosk/pos checkouts.</div>
        </div>
        <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by name or phone…" className="w-[320px]" />
      </div>

      <div className="mt-6">
        <Card>
          <CardHeader>
            <div className="text-sm font-semibold text-zinc-100">Customer list</div>
            <div className="mt-1 text-[12px] text-zinc-400">{filtered.length} customers</div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {filtered.map((c) => (
                <div key={c.id} className="rounded-2.5xl border border-white/8 bg-white/3 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="truncate text-sm font-semibold text-zinc-100">{c.name}</div>
                      <div className="mt-1 text-[12px] text-zinc-400">{c.phone}</div>
                    </div>
                    <div className="rounded-2xl bg-white/6 px-3 py-1.5 text-[12px] font-semibold text-zinc-200 ring-1 ring-white/10">
                      {c.ordersCount} orders
                    </div>
                  </div>
                  <div className="mt-4 grid grid-cols-2 gap-2">
                    <div className="rounded-2xl border border-white/8 bg-white/3 p-3">
                      <div className="text-[11px] font-semibold text-zinc-300">Total spent</div>
                      <div className="mt-1 text-sm font-semibold text-zinc-50">{inr(c.totalSpent)}</div>
                    </div>
                    <div className="rounded-2xl border border-white/8 bg-white/3 p-3">
                      <div className="text-[11px] font-semibold text-zinc-300">Last visit</div>
                      <div className="mt-1 text-sm font-semibold text-zinc-50">
                        {formatDistanceToNow(new Date(c.lastVisitAt), { addSuffix: true })}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              {filtered.length === 0 ? (
                <div className="rounded-2.5xl border border-white/8 bg-white/3 p-10 text-center md:col-span-2 xl:col-span-3">
                  <div className="text-sm font-semibold text-zinc-100">No customers yet</div>
                  <div className="mt-1 text-sm text-zinc-400">Place an order with name + phone to capture CRM.</div>
                </div>
              ) : null}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

