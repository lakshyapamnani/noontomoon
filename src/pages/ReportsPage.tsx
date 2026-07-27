import { useMemo } from "react";
import { format, subDays } from "date-fns";
import { ResponsiveContainer, Area, AreaChart, CartesianGrid, Tooltip, XAxis, YAxis, Pie, PieChart, Cell, Bar, BarChart, Legend } from "recharts";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { useOrdersStore } from "@/store/orders.store";
import { inr } from "@/utils/money";

const COLORS = {
  indigo: "#6366F1",
  emerald: "#10B981",
  rose: "#F43F5E",
  amber: "#F59E0B",
  zinc: "#A1A1AA"
};

export function ReportsPage() {
  const orders = useOrdersStore((s) => s.orders);

  const paidOrders = useMemo(() => orders.filter((o) => !["cash_pending", "upi_pending", "cancelled", "refunded"].includes(o.status)), [orders]);

  const last7 = useMemo(() => {
    const days = Array.from({ length: 7 }).map((_, i) => subDays(new Date(), 6 - i));
    return days.map((d) => {
      const dayOrders = paidOrders.filter((o) => {
        const od = new Date(o.createdAt);
        return od.toDateString() === d.toDateString();
      });
      const total = dayOrders.reduce((s, o) => s + o.total, 0);
      return { day: format(d, "EEE"), total };
    });
  }, [paidOrders]);

  const paymentSplit = useMemo(() => {
    const cash = paidOrders.filter((o) => o.paymentMode === "cash").reduce((s, o) => s + o.total, 0);
    const upi = paidOrders.filter((o) => o.paymentMode === "upi").reduce((s, o) => s + o.total, 0);
    return [
      { name: "Cash", value: cash },
      { name: "UPI", value: upi }
    ].filter((x) => x.value > 0);
  }, [paidOrders]);

  const bestSellers = useMemo(() => {
    const map = new Map<string, { name: string; qty: number }>();
    for (const o of paidOrders) {
      for (const it of o.items) {
        const cur = map.get(it.itemId) ?? { name: it.name, qty: 0 };
        cur.qty += it.qty;
        map.set(it.itemId, cur);
      }
    }
    return [...map.values()].sort((a, b) => b.qty - a.qty).slice(0, 8);
  }, [paidOrders]);

  const kpis = useMemo(() => {
    const gross = paidOrders.reduce((s, o) => s + o.total, 0);
    const count = paidOrders.length;
    const aov = count ? gross / count : 0;
    return { gross, count, aov };
  }, [paidOrders]);

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="text-2xl font-semibold tracking-tight">Reports</div>
          <div className="mt-1 text-sm text-zinc-400">Commercial-grade snapshots for daily operations.</div>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/4 px-4 py-2 text-sm">
          Gross: <span className="font-semibold">{inr(kpis.gross)}</span>
        </div>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-12">
        <Card className="lg:col-span-4">
          <CardHeader>
            <div className="text-sm font-semibold text-zinc-100">KPIs</div>
            <div className="mt-1 text-[12px] text-zinc-400">Based on non-pending orders</div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3">
              <Kpi label="Orders" value={String(kpis.count)} />
              <Kpi label="Avg. order value" value={inr(kpis.aov)} />
              <Kpi label="Gross sales" value={inr(kpis.gross)} />
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-8">
          <CardHeader>
            <div className="text-sm font-semibold text-zinc-100">Weekly sales</div>
            <div className="mt-1 text-[12px] text-zinc-400">Last 7 days</div>
          </CardHeader>
          <CardContent>
            <div className="h-[260px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={last7}>
                  <defs>
                    <linearGradient id="c1" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0" stopColor={COLORS.indigo} stopOpacity={0.35} />
                      <stop offset="1" stopColor={COLORS.indigo} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
                  <XAxis dataKey="day" stroke="rgba(244,244,245,0.45)" tickLine={false} axisLine={false} />
                  <YAxis stroke="rgba(244,244,245,0.45)" tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{
                      background: "rgba(20,20,24,0.92)",
                      border: "1px solid rgba(255,255,255,0.08)",
                      borderRadius: 16
                    }}
                    formatter={(v) => inr(Number(v))}
                  />
                  <Area type="monotone" dataKey="total" stroke={COLORS.indigo} fill="url(#c1)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-5">
          <CardHeader>
            <div className="text-sm font-semibold text-zinc-100">Payment split</div>
            <div className="mt-1 text-[12px] text-zinc-400">Cash vs UPI</div>
          </CardHeader>
          <CardContent>
            <div className="h-[260px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={paymentSplit} dataKey="value" nameKey="name" innerRadius={70} outerRadius={100} paddingAngle={3}>
                    {paymentSplit.map((_, idx) => (
                      <Cell key={idx} fill={idx === 0 ? COLORS.emerald : COLORS.indigo} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: "rgba(20,20,24,0.92)",
                      border: "1px solid rgba(255,255,255,0.08)",
                      borderRadius: 16
                    }}
                    formatter={(v) => inr(Number(v))}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-7">
          <CardHeader>
            <div className="text-sm font-semibold text-zinc-100">Best selling items</div>
            <div className="mt-1 text-[12px] text-zinc-400">By quantity</div>
          </CardHeader>
          <CardContent>
            <div className="h-[260px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={bestSellers}>
                  <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
                  <XAxis dataKey="name" stroke="rgba(244,244,245,0.45)" tickLine={false} axisLine={false} hide />
                  <YAxis stroke="rgba(244,244,245,0.45)" tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{
                      background: "rgba(20,20,24,0.92)",
                      border: "1px solid rgba(255,255,255,0.08)",
                      borderRadius: 16
                    }}
                  />
                  <Bar dataKey="qty" fill={COLORS.rose} radius={[10, 10, 10, 10]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              {bestSellers.slice(0, 6).map((b) => (
                <div key={b.name} className="flex items-center justify-between rounded-2xl border border-white/8 bg-white/3 px-3 py-2">
                  <div className="truncate text-sm font-semibold text-zinc-100">{b.name}</div>
                  <div className="rounded-xl bg-white/6 px-2 py-1 text-[12px] font-semibold ring-1 ring-white/10">
                    {b.qty}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function Kpi({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2.5xl border border-white/8 bg-white/3 p-4">
      <div className="text-[12px] font-semibold text-zinc-300">{label}</div>
      <div className="mt-2 text-2xl font-semibold tracking-tight text-zinc-50">{value}</div>
    </div>
  );
}

