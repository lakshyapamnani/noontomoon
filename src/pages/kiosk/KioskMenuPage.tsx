import { useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useIdleTimeout } from "@/hooks/useIdleTimeout";
import { useCartStore } from "@/store/cart.store";
import { useMenuStore } from "@/store/menu.store";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { inr } from "@/utils/money";
import { cn } from "@/utils/cn";
import type { FoodType, MenuItem } from "@/types";

const tabs: Array<{ type: FoodType; label: string; tone: string }> = [
  { type: "veg", label: "VEG", tone: "from-emerald-500/20 to-emerald-500/8" },
  { type: "nonveg", label: "NON VEG", tone: "from-rose-500/20 to-rose-500/8" },
  { type: "dessert", label: "DESSERT", tone: "from-amber-500/15 to-zinc-900/10" }
];

export function KioskMenuPage() {
  const navigate = useNavigate();
  const { categories, items } = useMenuStore();
  const cart = useCartStore();

  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, []);

  useIdleTimeout(45_000, () => navigate("/kiosk", { replace: true }), true);

  const filteredCategories = useMemo(() => {
    return categories.filter((c) => c.type === cart.activeType).sort((a, b) => a.sort - b.sort);
  }, [categories, cart.activeType]);

  const filteredItems = useMemo(() => {
    const byType = items.filter((i) => i.isActive && i.type === cart.activeType);
    const byCat = cart.activeCategoryId ? byType.filter((i) => i.categoryId === cart.activeCategoryId) : byType;
    const q = cart.search.trim().toLowerCase();
    const bySearch = q ? byCat.filter((i) => i.name.toLowerCase().includes(q)) : byCat;
    return bySearch.sort((a, b) => a.name.localeCompare(b.name));
  }, [items, cart.activeType, cart.activeCategoryId, cart.search]);

  const headerTone = tabs.find((t) => t.type === cart.activeType)?.tone ?? "from-white/10 to-transparent";

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-50">
      <div className={cn("sticky top-0 z-40 border-b border-white/6 bg-zinc-950/70 backdrop-blur-xl")}>
        <div className={cn("mx-auto max-w-[1400px] px-5 py-4")}>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate("/kiosk")}
              className="grid size-11 place-items-center rounded-2xl bg-white/5 ring-1 ring-white/10 transition hover:bg-white/7"
            >
              ←
            </button>
            <div className="flex-1">
              <div className="text-sm font-semibold tracking-tight">Menu</div>
              <div className="mt-1 text-[12px] text-zinc-400">Tap items to add. Swipe-friendly layout.</div>
            </div>
            <div className="hidden md:block">
              <Input
                value={cart.search}
                onChange={(e) => cart.setSearch(e.target.value)}
                placeholder="Search items…"
                className="w-[340px]"
              />
            </div>
          </div>

          <div className="mt-4 flex gap-2">
            {tabs.map((t) => (
              <button
                key={t.type}
                type="button"
                onClick={() => cart.setActiveType(t.type)}
                className={cn(
                  "flex-1 rounded-2xl border px-4 py-3 text-sm font-semibold tracking-tight transition",
                  cart.activeType === t.type
                    ? "border-white/10 bg-white/6 ring-2 ring-white/10"
                    : "border-white/8 bg-white/3 hover:bg-white/5"
                )}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
        <div className={cn("h-px bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.12),transparent)]")} />
        <div className={cn("h-10 bg-[linear-gradient(90deg,var(--tw-gradient-stops))]", headerTone)} />
      </div>

      <div className="mx-auto grid max-w-[1400px] grid-cols-12 gap-4 px-5 py-5">
        <aside className="col-span-12 md:col-span-3">
          <div className="md:hidden">
            <Input value={cart.search} onChange={(e) => cart.setSearch(e.target.value)} placeholder="Search items…" />
          </div>
          <div className="mt-4 rounded-2.5xl border border-white/8 bg-white/3 p-3">
            <div className="px-2 pb-2 text-[12px] font-semibold text-zinc-200">Categories</div>
            <div className="space-y-1">
              <button
                type="button"
                onClick={() => cart.setActiveCategoryId(null)}
                className={cn(
                  "w-full rounded-2xl px-3 py-2 text-left text-sm transition",
                  cart.activeCategoryId === null ? "bg-white/7 ring-1 ring-white/10" : "hover:bg-white/5"
                )}
              >
                All
              </button>
              {filteredCategories.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => cart.setActiveCategoryId(c.id)}
                  className={cn(
                    "w-full rounded-2xl px-3 py-2 text-left text-sm transition",
                    cart.activeCategoryId === c.id ? "bg-white/7 ring-1 ring-white/10" : "hover:bg-white/5"
                  )}
                >
                  {c.name}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-4 rounded-2.5xl border border-white/8 bg-white/3 p-4">
            <div className="text-sm font-semibold text-zinc-100">Upsell</div>
            <div className="mt-1 text-[12px] text-zinc-400">People also add these with your picks.</div>
            <div className="mt-3 space-y-2">
              {pickUpsell(items, cart.activeType).map((u) => (
                <button
                  key={u.id}
                  type="button"
                  onClick={() => cart.add(u)}
                  className="flex w-full items-center justify-between rounded-2xl border border-white/8 bg-white/4 px-3 py-2 text-left transition hover:bg-white/6"
                >
                  <div>
                    <div className="text-sm font-semibold">{u.name}</div>
                    <div className="text-[12px] text-zinc-400">{inr(u.price)}</div>
                  </div>
                  <div className="rounded-xl bg-white/6 px-2 py-1 text-[12px] font-semibold ring-1 ring-white/10">
                    Add
                  </div>
                </button>
              ))}
            </div>
          </div>
        </aside>

        <section className="col-span-12 md:col-span-6">
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-2">
            {filteredItems.map((it) => (
              <MenuCard key={it.id} item={it} />
            ))}
            {filteredItems.length === 0 ? (
              <div className="col-span-full rounded-2.5xl border border-white/8 bg-white/3 p-8 text-center">
                <div className="text-sm font-semibold text-zinc-100">No items found</div>
                <div className="mt-1 text-sm text-zinc-400">Try changing category or clearing search.</div>
                <div className="mt-5">
                  <Button variant="secondary" onClick={() => cart.setSearch("")}>
                    Clear search
                  </Button>
                </div>
              </div>
            ) : null}
          </div>
        </section>

        <aside className="col-span-12 md:col-span-3">
          <div className="sticky top-[176px]">
            <Card className="overflow-hidden">
              <div className="border-b border-white/8 bg-white/3 px-5 py-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-semibold">Cart</div>
                    <div className="mt-1 text-[12px] text-zinc-400">{cart.lines.length} items</div>
                  </div>
                  <button
                    type="button"
                    onClick={() => cart.clear()}
                    className="rounded-2xl bg-white/6 px-3 py-1.5 text-[12px] font-semibold ring-1 ring-white/10 transition hover:bg-white/8"
                  >
                    Clear
                  </button>
                </div>
              </div>

              <div className="max-h-[52vh] overflow-auto px-5 py-4">
                {cart.lines.length === 0 ? (
                  <div className="rounded-2xl border border-white/8 bg-white/3 p-4 text-sm text-zinc-400">
                    Your cart is empty. Add items to continue.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {cart.lines.map((l) => (
                      <div key={l.itemId} className="rounded-2xl border border-white/8 bg-white/3 p-3">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <div className="truncate text-sm font-semibold text-zinc-100">{l.name}</div>
                            <div className="mt-1 text-[12px] text-zinc-400">{inr(l.unitPrice)}</div>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => cart.dec(l.itemId)}
                              className="grid size-9 place-items-center rounded-2xl bg-white/5 ring-1 ring-white/10 transition hover:bg-white/7"
                            >
                              −
                            </button>
                            <div className="w-7 text-center text-sm font-semibold">{l.qty}</div>
                            <button
                              type="button"
                              onClick={() => {
                                const item = items.find((i) => i.id === l.itemId);
                                if (item) cart.add(item);
                              }}
                              className="grid size-9 place-items-center rounded-2xl bg-white/5 ring-1 ring-white/10 transition hover:bg-white/7"
                            >
                              +
                            </button>
                          </div>
                        </div>
                        {l.notes ? (
                          <div className="mt-2 rounded-2xl bg-white/4 px-3 py-2 text-[12px] text-zinc-300">
                            Note: {l.notes}
                          </div>
                        ) : null}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="border-t border-white/8 bg-white/3 px-5 py-4">
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between text-zinc-300">
                    <span>Subtotal</span>
                    <span className="font-semibold">{inr(cart.subtotal())}</span>
                  </div>
                  <div className="flex items-center justify-between text-zinc-300">
                    <span>Tax</span>
                    <span className="font-semibold">{inr(cart.tax())}</span>
                  </div>
                  <div className="h-px bg-white/8" />
                  <div className="flex items-center justify-between text-zinc-50">
                    <span className="font-semibold">Total</span>
                    <span className="text-lg font-semibold tracking-tight">{inr(cart.total())}</span>
                  </div>
                </div>
                <Button
                  variant="primary"
                  size="xl"
                  className="mt-4 w-full"
                  onClick={() => {
                    if (cart.lines.length === 0) {
                      toast.message("Add items first.");
                      return;
                    }
                    navigate("/kiosk/checkout");
                  }}
                >
                  Checkout
                </Button>
              </div>
            </Card>
          </div>
        </aside>
      </div>
    </div>
  );
}

function MenuCard({ item }: { item: MenuItem }) {
  const cart = useCartStore();
  const inCart = cart.lines.find((l) => l.itemId === item.id)?.qty ?? 0;
  return (
    <button type="button" onClick={() => cart.add(item)} className="text-left">
      <Card className="group overflow-hidden transition hover:bg-white/6">
        <div className="flex gap-3 p-4">
          <div className="relative h-20 w-24 overflow-hidden rounded-2xl bg-white/5 ring-1 ring-white/10">
            {item.imageUrl ? (
              <img src={item.imageUrl} alt={item.name} className="h-full w-full object-cover" />
            ) : null}
            <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,transparent,rgba(0,0,0,0.24))]" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="truncate text-sm font-semibold tracking-tight text-zinc-100">{item.name}</div>
            {item.description ? (
              <div className="mt-1 max-h-9 overflow-hidden text-[12px] leading-[18px] text-zinc-400">
                {item.description}
              </div>
            ) : null}
            <div className="mt-3 flex items-center justify-between">
              <div className="text-sm font-semibold text-zinc-50">{inr(item.price)}</div>
              <div
                className={cn(
                  "rounded-2xl px-3 py-1.5 text-[12px] font-semibold ring-1 ring-white/10 transition",
                  inCart > 0 ? "bg-indigo-500/18 text-indigo-200" : "bg-white/6 text-zinc-200 group-hover:bg-white/8"
                )}
              >
                {inCart > 0 ? `In cart: ${inCart}` : "Tap to add"}
              </div>
            </div>
          </div>
        </div>
      </Card>
    </button>
  );
}

function pickUpsell(items: MenuItem[], active: FoodType) {
  const pool = items.filter((i) => i.isActive && i.type !== active);
  return pool.slice(0, 3);
}

