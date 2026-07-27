import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Tabs } from "@/components/ui/Tabs";
import { Modal } from "@/components/ui/Modal";
import { useMenuStore } from "@/store/menu.store";
import { useSettingsStore } from "@/store/settings.store";
import { useAuthStore, upsertUser } from "@/store/auth.store";
import type { FoodType, MenuCategory, MenuItem, Role, User } from "@/types";
import { createId } from "@/utils/id";
import { nowMs } from "@/utils/time";
import { sha256Hex } from "@/utils/crypto";
import { inr } from "@/utils/money";

type Tab = "menu" | "printers" | "users" | "kiosk";

export function AdminPage() {
  const [tab, setTab] = useState<Tab>("menu");

  return (
    <div>
      <div className="flex items-end justify-between gap-4">
        <div>
          <div className="text-2xl font-semibold tracking-tight">Admin</div>
          <div className="mt-1 text-sm text-zinc-400">Menu, users, printers, and kiosk settings.</div>
        </div>
      </div>

      <div className="mt-6">
        <Tabs
          value={tab}
          onChange={setTab}
          items={[
            { value: "menu", label: "Menu" },
            { value: "printers", label: "Printers" },
            { value: "users", label: "Users & Roles" },
            { value: "kiosk", label: "Kiosk" }
          ]}
        />
      </div>

      <div className="mt-4">
        {tab === "menu" ? <MenuAdmin /> : null}
        {tab === "printers" ? <PrinterAdmin /> : null}
        {tab === "users" ? <UsersAdmin /> : null}
        {tab === "kiosk" ? <KioskAdmin /> : null}
      </div>
    </div>
  );
}

function MenuAdmin() {
  const { categories, items, upsertCategory, upsertItem } = useMenuStore();
  const [openCat, setOpenCat] = useState(false);
  const [openItem, setOpenItem] = useState(false);
  const [editCat, setEditCat] = useState<MenuCategory | null>(null);
  const [editItem, setEditItem] = useState<MenuItem | null>(null);

  const catsByType = useMemo(() => {
    const by: Record<FoodType, MenuCategory[]> = { veg: [], nonveg: [], dessert: [] };
    for (const c of categories) by[c.type].push(c);
    for (const t of Object.keys(by) as FoodType[]) by[t].sort((a, b) => a.sort - b.sort);
    return by;
  }, [categories]);

  return (
    <div className="grid gap-4 lg:grid-cols-12">
      <Card className="lg:col-span-4">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-semibold text-zinc-100">Categories</div>
              <div className="mt-1 text-[12px] text-zinc-400">Type + ordering</div>
            </div>
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                setEditCat(null);
                setOpenCat(true);
              }}
            >
              Add
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {(Object.keys(catsByType) as FoodType[]).map((t) => (
              <div key={t}>
                <div className="px-1 pb-2 text-[12px] font-semibold text-zinc-300">{t.toUpperCase()}</div>
                <div className="space-y-2">
                  {catsByType[t].map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => {
                        setEditCat(c);
                        setOpenCat(true);
                      }}
                      className="w-full text-left"
                    >
                      <div className="rounded-2xl border border-white/8 bg-white/3 px-3 py-2 transition hover:bg-white/5">
                        <div className="text-sm font-semibold text-zinc-100">{c.name}</div>
                        <div className="mt-1 text-[12px] text-zinc-400">Sort: {c.sort}</div>
                      </div>
                    </button>
                  ))}
                  {catsByType[t].length === 0 ? (
                    <div className="rounded-2xl border border-white/8 bg-white/3 p-4 text-sm text-zinc-400">No categories</div>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="lg:col-span-8">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-semibold text-zinc-100">Menu items</div>
              <div className="mt-1 text-[12px] text-zinc-400">Price, type, and availability</div>
            </div>
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                setEditItem(null);
                setOpenItem(true);
              }}
            >
              Add item
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-2">
            {items
              .slice()
              .sort((a, b) => a.name.localeCompare(b.name))
              .map((it) => (
                <button
                  key={it.id}
                  type="button"
                  onClick={() => {
                    setEditItem(it);
                    setOpenItem(true);
                  }}
                  className="text-left"
                >
                  <div className="rounded-2.5xl border border-white/8 bg-white/3 p-4 transition hover:bg-white/5">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="truncate text-sm font-semibold text-zinc-100">{it.name}</div>
                        <div className="mt-1 text-[12px] text-zinc-400">
                          {it.type.toUpperCase()} · {inr(it.price)} · Tax {it.taxPercent ?? 0}%
                        </div>
                      </div>
                      <div className={it.isActive ? "rounded-2xl bg-emerald-500/12 px-3 py-1.5 text-[12px] font-semibold text-emerald-200 ring-1 ring-emerald-500/25" : "rounded-2xl bg-amber-500/12 px-3 py-1.5 text-[12px] font-semibold text-amber-200 ring-1 ring-amber-500/25"}>
                        {it.isActive ? "Active" : "Hidden"}
                      </div>
                    </div>
                    {it.description ? (
                      <div className="mt-2 max-h-9 overflow-hidden text-[12px] leading-[18px] text-zinc-500">
                        {it.description}
                      </div>
                    ) : null}
                  </div>
                </button>
              ))}
          </div>
        </CardContent>
      </Card>

      <CategoryModal
        open={openCat}
        onClose={() => setOpenCat(false)}
        value={editCat}
        onSave={(cat) => {
          upsertCategory(cat);
          toast.success("Category saved.");
          setOpenCat(false);
        }}
      />
      <ItemModal
        open={openItem}
        onClose={() => setOpenItem(false)}
        value={editItem}
        categories={categories}
        onSave={(it) => {
          upsertItem(it);
          toast.success("Item saved.");
          setOpenItem(false);
        }}
      />
    </div>
  );
}

function CategoryModal({
  open,
  onClose,
  value,
  onSave
}: {
  open: boolean;
  onClose: () => void;
  value: MenuCategory | null;
  onSave: (next: MenuCategory) => void;
}) {
  const [name, setName] = useState(value?.name ?? "");
  const [type, setType] = useState<FoodType>(value?.type ?? "veg");
  const [sort, setSort] = useState(String(value?.sort ?? 10));

  useEffect(() => {
    if (!open) return;
    setName(value?.name ?? "");
    setType(value?.type ?? "veg");
    setSort(String(value?.sort ?? 10));
  }, [open, value]);

  return (
    <Modal open={open} onClose={onClose} title={value ? "Edit category" : "Add category"}>
      <div className="space-y-3">
        <div>
          <div className="mb-2 text-[12px] font-semibold text-zinc-300">Name</div>
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Starters" />
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <div className="mb-2 text-[12px] font-semibold text-zinc-300">Type</div>
            <Select value={type} onChange={(e) => setType(e.target.value as FoodType)}>
              <option value="veg">Veg</option>
              <option value="nonveg">Non Veg</option>
              <option value="dessert">Dessert</option>
            </Select>
          </div>
          <div>
            <div className="mb-2 text-[12px] font-semibold text-zinc-300">Sort</div>
            <Input value={sort} onChange={(e) => setSort(e.target.value)} inputMode="numeric" />
          </div>
        </div>

        <div className="flex gap-2 pt-2">
          <Button
            variant="primary"
            size="lg"
            onClick={() => {
              const clean = name.trim();
              if (!clean) return toast.error("Name required.");
              onSave({
                id: value?.id ?? createId("cat"),
                name: clean,
                type,
                sort: Number(sort) || 10
              });
            }}
          >
            Save
          </Button>
          <Button variant="secondary" size="lg" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </div>
    </Modal>
  );
}

function ItemModal({
  open,
  onClose,
  value,
  categories,
  onSave
}: {
  open: boolean;
  onClose: () => void;
  value: MenuItem | null;
  categories: MenuCategory[];
  onSave: (next: MenuItem) => void;
}) {
  const [name, setName] = useState(value?.name ?? "");
  const [desc, setDesc] = useState(value?.description ?? "");
  const [price, setPrice] = useState(String(value?.price ?? 0));
  const [type, setType] = useState<FoodType>(value?.type ?? "veg");
  const [categoryId, setCategoryId] = useState(value?.categoryId ?? categories[0]?.id ?? "");
  const [tax, setTax] = useState(String(value?.taxPercent ?? 5));
  const [active, setActive] = useState(value?.isActive ?? true);

  useEffect(() => {
    if (!open) return;
    setName(value?.name ?? "");
    setDesc(value?.description ?? "");
    setPrice(String(value?.price ?? 0));
    setType(value?.type ?? "veg");
    setCategoryId(value?.categoryId ?? categories.find((c) => c.type === (value?.type ?? "veg"))?.id ?? categories[0]?.id ?? "");
    setTax(String(value?.taxPercent ?? 5));
    setActive(value?.isActive ?? true);
  }, [open, value, categories]);

  const catsForType = useMemo(() => categories.filter((c) => c.type === type).sort((a, b) => a.sort - b.sort), [categories, type]);

  useEffect(() => {
    if (!open) return;
    if (!catsForType.some((c) => c.id === categoryId)) setCategoryId(catsForType[0]?.id ?? "");
  }, [catsForType, categoryId, open]);

  return (
    <Modal open={open} onClose={onClose} title={value ? "Edit menu item" : "Add menu item"} maxWidth="max-w-2xl">
      <div className="space-y-3">
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <div className="mb-2 text-[12px] font-semibold text-zinc-300">Name</div>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Paneer Tikka" />
          </div>
          <div>
            <div className="mb-2 text-[12px] font-semibold text-zinc-300">Price</div>
            <Input value={price} onChange={(e) => setPrice(e.target.value)} inputMode="numeric" />
          </div>
        </div>
        <div>
          <div className="mb-2 text-[12px] font-semibold text-zinc-300">Description</div>
          <Input value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="Short, menu-grade description" />
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          <div>
            <div className="mb-2 text-[12px] font-semibold text-zinc-300">Type</div>
            <Select value={type} onChange={(e) => setType(e.target.value as FoodType)}>
              <option value="veg">Veg</option>
              <option value="nonveg">Non Veg</option>
              <option value="dessert">Dessert</option>
            </Select>
          </div>
          <div className="sm:col-span-2">
            <div className="mb-2 text-[12px] font-semibold text-zinc-300">Category</div>
            <Select value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
              {catsForType.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </Select>
          </div>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <div className="mb-2 text-[12px] font-semibold text-zinc-300">Tax %</div>
            <Input value={tax} onChange={(e) => setTax(e.target.value)} inputMode="numeric" />
          </div>
          <div className="flex items-end gap-2">
            <Button variant={active ? "secondary" : "ghost"} size="lg" onClick={() => setActive((a) => !a)}>
              {active ? "Item Active" : "Item Hidden"}
            </Button>
          </div>
        </div>

        <div className="flex gap-2 pt-2">
          <Button
            variant="primary"
            size="lg"
            onClick={() => {
              const clean = name.trim();
              if (!clean) return toast.error("Name required.");
              if (!categoryId) return toast.error("Category required.");
              onSave({
                id: value?.id ?? createId("itm"),
                name: clean,
                description: desc.trim() || undefined,
                price: Number(price) || 0,
                type,
                categoryId,
                imageUrl: value?.imageUrl,
                isActive: active,
                taxPercent: Number(tax) || 0
              });
            }}
          >
            Save
          </Button>
          <Button variant="secondary" size="lg" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </div>
    </Modal>
  );
}

function PrinterAdmin() {
  const settings = useSettingsStore((s) => s.settings);
  const patch = useSettingsStore((s) => s.patch);
  const [vegIp, setVegIp] = useState(settings.printers.vegIp);
  const [nonvegIp, setNonvegIp] = useState(settings.printers.nonvegIp);
  const [billIp, setBillIp] = useState(settings.printers.billIp);

  useEffect(() => {
    setVegIp(settings.printers.vegIp);
    setNonvegIp(settings.printers.nonvegIp);
    setBillIp(settings.printers.billIp);
  }, [settings.printers]);

  return (
    <Card>
      <CardHeader>
        <div className="text-sm font-semibold text-zinc-100">Printer routing</div>
        <div className="mt-1 text-[12px] text-zinc-400">Ethernet printers by IP (veg / nonveg / bill)</div>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3 md:grid-cols-3">
          <div>
            <div className="mb-2 text-[12px] font-semibold text-zinc-300">Veg printer IP</div>
            <Input value={vegIp} onChange={(e) => setVegIp(e.target.value)} placeholder="192.168.1.50" />
          </div>
          <div>
            <div className="mb-2 text-[12px] font-semibold text-zinc-300">Non‑veg printer IP</div>
            <Input value={nonvegIp} onChange={(e) => setNonvegIp(e.target.value)} placeholder="192.168.1.51" />
          </div>
          <div>
            <div className="mb-2 text-[12px] font-semibold text-zinc-300">Bill printer IP</div>
            <Input value={billIp} onChange={(e) => setBillIp(e.target.value)} placeholder="192.168.1.52" />
          </div>
        </div>
        <div className="mt-4 flex items-center gap-2">
          <Button
            variant="primary"
            size="lg"
            onClick={() => {
              patch({ printers: { vegIp: vegIp.trim(), nonvegIp: nonvegIp.trim(), billIp: billIp.trim() } as any });
              toast.success("Printer settings saved.");
            }}
          >
            Save
          </Button>
        </div>
        <div className="mt-3 rounded-2.5xl border border-white/8 bg-white/3 p-4 text-[12px] text-zinc-400">
          Start the local Node print server to actually print KOT/Bills and prevent duplicates via a persistent job ledger.
        </div>
      </CardContent>
    </Card>
  );
}

function UsersAdmin() {
  const users = useAuthStore((s) => s.users);
  const load = useAuthStore((s) => s.load);
  const [open, setOpen] = useState(false);
  const [edit, setEdit] = useState<User | null>(null);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="grid gap-4 lg:grid-cols-12">
      <Card className="lg:col-span-12">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-semibold text-zinc-100">Users</div>
              <div className="mt-1 text-[12px] text-zinc-400">PIN-based local auth</div>
            </div>
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                setEdit(null);
                setOpen(true);
              }}
            >
              Add user
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {users.map((u) => (
              <button
                key={u.id}
                type="button"
                onClick={() => {
                  setEdit(u);
                  setOpen(true);
                }}
                className="text-left"
              >
                <div className="rounded-2.5xl border border-white/8 bg-white/3 p-4 transition hover:bg-white/5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="truncate text-sm font-semibold text-zinc-100">{u.displayName}</div>
                      <div className="mt-1 text-[12px] text-zinc-400">{u.role.toUpperCase()}</div>
                    </div>
                    <div className={u.isActive ? "rounded-2xl bg-emerald-500/12 px-3 py-1.5 text-[12px] font-semibold text-emerald-200 ring-1 ring-emerald-500/25" : "rounded-2xl bg-amber-500/12 px-3 py-1.5 text-[12px] font-semibold text-amber-200 ring-1 ring-amber-500/25"}>
                      {u.isActive ? "Active" : "Disabled"}
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      <UserModal open={open} onClose={() => setOpen(false)} value={edit} />
    </div>
  );
}

function UserModal({ open, onClose, value }: { open: boolean; onClose: () => void; value: User | null }) {
  const [displayName, setDisplayName] = useState(value?.displayName ?? "");
  const [role, setRole] = useState<Role>(value?.role ?? "counter");
  const [pin, setPin] = useState("");
  const [active, setActive] = useState(value?.isActive ?? true);

  useEffect(() => {
    if (!open) return;
    setDisplayName(value?.displayName ?? "");
    setRole(value?.role ?? "counter");
    setPin("");
    setActive(value?.isActive ?? true);
  }, [open, value]);

  return (
    <Modal open={open} onClose={onClose} title={value ? "Edit user" : "Add user"} maxWidth="max-w-xl">
      <div className="space-y-3">
        <div>
          <div className="mb-2 text-[12px] font-semibold text-zinc-300">Display name</div>
          <Input value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="e.g. Counter 1" />
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <div className="mb-2 text-[12px] font-semibold text-zinc-300">Role</div>
            <Select value={role} onChange={(e) => setRole(e.target.value as Role)}>
              <option value="admin">Admin</option>
              <option value="counter">Counter</option>
              <option value="kitchen">Kitchen</option>
              <option value="waiter">Waiter</option>
              <option value="manager">Manager</option>
            </Select>
          </div>
          <div>
            <div className="mb-2 text-[12px] font-semibold text-zinc-300">{value ? "New PIN (optional)" : "PIN"}</div>
            <Input value={pin} onChange={(e) => setPin(e.target.value)} inputMode="numeric" placeholder="4-6 digits" />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant={active ? "secondary" : "ghost"} size="lg" onClick={() => setActive((a) => !a)}>
            {active ? "Enabled" : "Disabled"}
          </Button>
        </div>
        <div className="flex gap-2 pt-2">
          <Button
            variant="primary"
            size="lg"
            onClick={async () => {
              const clean = displayName.trim();
              if (!clean) return toast.error("Display name required.");
              if (!value && pin.trim().length < 4) return toast.error("PIN must be at least 4 digits.");
              if (pin && !/^\d{4,6}$/.test(pin.trim())) return toast.error("PIN must be 4-6 digits.");
              const pinHash = pin ? await sha256Hex(pin.trim()) : value?.pinHash ?? "";
              const next: User = {
                id: value?.id ?? createId("usr"),
                displayName: clean,
                role,
                pinHash,
                isActive: active,
                createdAt: value?.createdAt ?? nowMs()
              };
              upsertUser(next);
              toast.success("User saved.");
              useAuthStore.getState().load();
              onClose();
            }}
          >
            Save
          </Button>
          <Button variant="secondary" size="lg" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </div>
    </Modal>
  );
}

function KioskAdmin() {
  const settings = useSettingsStore((s) => s.settings);
  const patch = useSettingsStore((s) => s.patch);
  const [restaurantName, setRestaurantName] = useState(settings.restaurantName);
  const [vpa, setVpa] = useState(settings.upiMerchantVpa);
  const [merchantName, setMerchantName] = useState(settings.upiMerchantName);
  const [autoReturn, setAutoReturn] = useState(String(settings.kioskAutoReturnMs));

  useEffect(() => {
    setRestaurantName(settings.restaurantName);
    setVpa(settings.upiMerchantVpa);
    setMerchantName(settings.upiMerchantName);
    setAutoReturn(String(settings.kioskAutoReturnMs));
  }, [settings]);

  return (
    <Card>
      <CardHeader>
        <div className="text-sm font-semibold text-zinc-100">Kiosk settings</div>
        <div className="mt-1 text-[12px] text-zinc-400">Idle timeout, restaurant profile and UPI QR</div>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3 md:grid-cols-2">
          <div>
            <div className="mb-2 text-[12px] font-semibold text-zinc-300">Restaurant name</div>
            <Input value={restaurantName} onChange={(e) => setRestaurantName(e.target.value)} />
          </div>
          <div>
            <div className="mb-2 text-[12px] font-semibold text-zinc-300">Auto return (ms)</div>
            <Input value={autoReturn} onChange={(e) => setAutoReturn(e.target.value)} inputMode="numeric" />
          </div>
          <div>
            <div className="mb-2 text-[12px] font-semibold text-zinc-300">UPI VPA</div>
            <Input value={vpa} onChange={(e) => setVpa(e.target.value)} placeholder="merchant@upi" />
          </div>
          <div>
            <div className="mb-2 text-[12px] font-semibold text-zinc-300">UPI Merchant name</div>
            <Input value={merchantName} onChange={(e) => setMerchantName(e.target.value)} placeholder="DINEX" />
          </div>
        </div>
        <div className="mt-4 flex items-center gap-2">
          <Button
            variant="primary"
            size="lg"
            onClick={() => {
              patch({
                restaurantName: restaurantName.trim() || "DINEX Kitchen",
                upiMerchantVpa: vpa.trim() || "merchant@upi",
                upiMerchantName: merchantName.trim() || "DINEX",
                kioskAutoReturnMs: Number(autoReturn) || 45_000
              });
              toast.success("Kiosk settings saved.");
            }}
          >
            Save
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

