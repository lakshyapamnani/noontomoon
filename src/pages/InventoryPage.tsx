import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Modal } from "@/components/ui/Modal";
import { useInventoryStore } from "@/store/inventory.store";
import type { InventoryItem } from "@/types";
import { createId } from "@/utils/id";
import { nowMs } from "@/utils/time";

type Unit = InventoryItem["unit"];

export function InventoryPage() {
  const inventory = useInventoryStore((s) => s.inventory);
  const upsert = useInventoryStore((s) => s.upsert);
  const remove = useInventoryStore((s) => s.remove);

  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [edit, setEdit] = useState<InventoryItem | null>(null);

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    const list = [...inventory].sort((a, b) => a.name.localeCompare(b.name));
    if (!query) return list;
    return list.filter((i) => i.name.toLowerCase().includes(query));
  }, [inventory, q]);

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="text-2xl font-semibold tracking-tight">Inventory</div>
          <div className="mt-1 text-sm text-zinc-400">Track raw materials and low-stock warnings.</div>
        </div>
        <div className="flex items-center gap-2">
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search inventory…" className="w-[260px]" />
          <Button
            variant="primary"
            onClick={() => {
              setEdit(null);
              setOpen(true);
            }}
          >
            Add item
          </Button>
        </div>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-12">
        <Card className="lg:col-span-12">
          <CardHeader>
            <div className="text-sm font-semibold text-zinc-100">Stock</div>
            <div className="mt-1 text-[12px] text-zinc-400">{filtered.length} items</div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {filtered.map((i) => {
                const low = i.stock <= i.lowStockAt;
                return (
                  <button
                    key={i.id}
                    type="button"
                    onClick={() => {
                      setEdit(i);
                      setOpen(true);
                    }}
                    className="text-left"
                  >
                    <div className="rounded-2.5xl border border-white/8 bg-white/3 p-4 transition hover:bg-white/5">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="truncate text-sm font-semibold text-zinc-100">{i.name}</div>
                          <div className="mt-1 text-[12px] text-zinc-400">
                            Unit: <span className="text-zinc-200">{i.unit}</span>
                          </div>
                        </div>
                        <div className={low ? "rounded-2xl bg-amber-500/12 px-3 py-1.5 text-[12px] font-semibold text-amber-200 ring-1 ring-amber-500/25" : "rounded-2xl bg-emerald-500/12 px-3 py-1.5 text-[12px] font-semibold text-emerald-200 ring-1 ring-emerald-500/25"}>
                          {low ? "Low" : "OK"}
                        </div>
                      </div>
                      <div className="mt-4 flex items-end justify-between">
                        <div>
                          <div className="text-[12px] text-zinc-400">Stock</div>
                          <div className="mt-1 text-2xl font-semibold tracking-tight text-zinc-50">
                            {i.stock} <span className="text-sm text-zinc-400">{i.unit}</span>
                          </div>
                        </div>
                        <div className="text-right text-[12px] text-zinc-500">Edit →</div>
                      </div>
                      <div className="mt-3 text-[12px] text-zinc-500">Low alert at {i.lowStockAt} {i.unit}</div>
                    </div>
                  </button>
                );
              })}
              {filtered.length === 0 ? (
                <div className="rounded-2.5xl border border-white/8 bg-white/3 p-10 text-center md:col-span-2 xl:col-span-3">
                  <div className="text-sm font-semibold text-zinc-100">No inventory items</div>
                  <div className="mt-1 text-sm text-zinc-400">Add your raw materials to start tracking stock.</div>
                </div>
              ) : null}
            </div>
          </CardContent>
        </Card>
      </div>

      <InventoryModal
        open={open}
        onClose={() => setOpen(false)}
        value={edit}
        onSave={(next) => {
          upsert(next);
          toast.success("Saved.");
          setOpen(false);
        }}
        onDelete={(id) => {
          remove(id);
          toast.success("Deleted.");
          setOpen(false);
        }}
      />
    </div>
  );
}

function InventoryModal({
  open,
  onClose,
  value,
  onSave,
  onDelete
}: {
  open: boolean;
  onClose: () => void;
  value: InventoryItem | null;
  onSave: (next: InventoryItem) => void;
  onDelete: (id: string) => void;
}) {
  const [name, setName] = useState(value?.name ?? "");
  const [unit, setUnit] = useState<Unit>(value?.unit ?? "kg");
  const [stock, setStock] = useState(String(value?.stock ?? 0));
  const [low, setLow] = useState(String(value?.lowStockAt ?? 0));

  // Reset inputs when opening/editing changes
  useEffect(() => {
    if (!open) return;
    setName(value?.name ?? "");
    setUnit(value?.unit ?? "kg");
    setStock(String(value?.stock ?? 0));
    setLow(String(value?.lowStockAt ?? 0));
  }, [open, value]);

  return (
    <Modal open={open} onClose={onClose} title={value ? "Edit inventory item" : "Add inventory item"}>
      <div className="space-y-3">
        <div>
          <div className="mb-2 text-[12px] font-semibold text-zinc-300">Name</div>
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Tomatoes" />
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          <div>
            <div className="mb-2 text-[12px] font-semibold text-zinc-300">Unit</div>
            <Select value={unit} onChange={(e) => setUnit(e.target.value as Unit)}>
              <option value="kg">kg</option>
              <option value="g">g</option>
              <option value="l">l</option>
              <option value="ml">ml</option>
              <option value="pcs">pcs</option>
            </Select>
          </div>
          <div>
            <div className="mb-2 text-[12px] font-semibold text-zinc-300">Stock</div>
            <Input value={stock} onChange={(e) => setStock(e.target.value)} inputMode="decimal" />
          </div>
          <div>
            <div className="mb-2 text-[12px] font-semibold text-zinc-300">Low at</div>
            <Input value={low} onChange={(e) => setLow(e.target.value)} inputMode="decimal" />
          </div>
        </div>

        <div className="flex items-center gap-2 pt-2">
          <Button
            variant="primary"
            size="lg"
            onClick={() => {
              const clean = name.trim();
              if (!clean) return toast.error("Name required.");
              const next: InventoryItem = {
                id: value?.id ?? createId("inv"),
                name: clean,
                unit,
                stock: Number(stock) || 0,
                lowStockAt: Number(low) || 0,
                updatedAt: nowMs()
              };
              onSave(next);
            }}
          >
            Save
          </Button>
          {value ? (
            <Button variant="danger" size="lg" onClick={() => onDelete(value.id)}>
              Delete
            </Button>
          ) : null}
          <Button variant="secondary" size="lg" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </div>
    </Modal>
  );
}

