import { useState } from "react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { hardResetDinex } from "@/services/reset";
import { ensureDemoSeed } from "@/services/seed";
import { useAuthStore } from "@/store/auth.store";
import { useMenuStore } from "@/store/menu.store";
import { useOrdersStore } from "@/store/orders.store";
import { useCustomersStore } from "@/store/customers.store";
import { useInventoryStore } from "@/store/inventory.store";
import { useSettingsStore } from "@/store/settings.store";

export function SeedPage() {
  const session = useAuthStore((s) => s.session);
  const [busy, setBusy] = useState(false);

  async function resetAndSeed() {
    setBusy(true);
    try {
      hardResetDinex();
      await ensureDemoSeed();
      useAuthStore.getState().load();
      useMenuStore.getState().load();
      useOrdersStore.getState().load();
      useCustomersStore.getState().load();
      useInventoryStore.getState().load();
      useSettingsStore.getState().load();
      toast.success("Seed completed.");
    } catch {
      toast.error("Seed failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader>
          <div className="text-sm font-semibold text-zinc-100">Seed Tools</div>
          <div className="mt-1 text-[12px] text-zinc-400">Reset demo data for local development.</div>
        </CardHeader>
        <CardContent>
          <div className="rounded-2xl border border-white/8 bg-white/3 p-4">
            <div className="text-sm text-zinc-200">Signed in as</div>
            <div className="mt-1 text-sm font-semibold text-zinc-50">
              {session ? `${session.displayName} · ${session.role.toUpperCase()}` : "Not signed in"}
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2">
            <Button variant="danger" size="lg" onClick={resetAndSeed} disabled={busy}>
              Hard reset + seed demo
            </Button>
          </div>
          <div className="mt-3 text-[12px] text-zinc-500">
            This clears the DINEX local DB and recreates menu, users, and inventory.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

