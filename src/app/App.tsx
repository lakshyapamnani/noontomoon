import { Navigate, Route, Routes } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { RequireRole } from "@/components/auth/RequireRole";
import { LoginPage } from "@/pages/LoginPage";
import { LauncherPage } from "@/pages/LauncherPage";
import { KioskIdlePage } from "@/pages/kiosk/KioskIdlePage";
import { KioskMenuPage } from "@/pages/kiosk/KioskMenuPage";
import { KioskCheckoutPage } from "@/pages/kiosk/KioskCheckoutPage";
import { CounterPage } from "@/pages/pos/CounterPage";
import { KitchenPage } from "@/pages/ops/KitchenPage";
import { WaiterPage } from "@/pages/ops/WaiterPage";
import { OrdersPage } from "@/pages/OrdersPage";
import { ReportsPage } from "@/pages/ReportsPage";
import { InventoryPage } from "@/pages/InventoryPage";
import { AdminPage } from "@/pages/AdminPage";
import { CustomersPage } from "@/pages/CustomersPage";
import { SeedPage } from "@/pages/SeedPage";
import { useEffect } from "react";
import { enforceSessionTimeout, useAuthStore } from "@/store/auth.store";
import { useMenuStore } from "@/store/menu.store";
import { useOrdersStore } from "@/store/orders.store";
import { useCustomersStore } from "@/store/customers.store";
import { useInventoryStore } from "@/store/inventory.store";
import { useSettingsStore } from "@/store/settings.store";
import { ensureDemoSeed } from "@/services/seed";

export default function App() {
  useEffect(() => {
    enforceSessionTimeout();
    void (async () => {
      await ensureDemoSeed();
      useAuthStore.getState().load();
      useMenuStore.getState().load();
      useOrdersStore.getState().load();
      useCustomersStore.getState().load();
      useInventoryStore.getState().load();
      useSettingsStore.getState().load();
    })();
  }, []);

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      {/* Kiosk routes */}
      <Route path="/kiosk" element={<KioskIdlePage />} />
      <Route path="/kiosk/menu" element={<KioskMenuPage />} />
      <Route path="/kiosk/checkout" element={<KioskCheckoutPage />} />

      {/* Staff app */}
      <Route element={<AppLayout />}>
        <Route path="/" element={<Navigate to="/launcher" replace />} />
        <Route path="/launcher" element={<LauncherPage />} />
        <Route path="/seed" element={<SeedPage />} />

        <Route
          path="/counter"
          element={
            <RequireRole allow={["admin", "counter", "manager"]}>
              <CounterPage />
            </RequireRole>
          }
        />
        <Route
          path="/kitchen"
          element={
            <RequireRole allow={["admin", "kitchen", "manager"]}>
              <KitchenPage />
            </RequireRole>
          }
        />
        <Route
          path="/waiter"
          element={
            <RequireRole allow={["admin", "waiter", "manager"]}>
              <WaiterPage />
            </RequireRole>
          }
        />
        <Route
          path="/orders"
          element={
            <RequireRole allow={["admin", "counter", "manager"]}>
              <OrdersPage />
            </RequireRole>
          }
        />
        <Route
          path="/reports"
          element={
            <RequireRole allow={["admin", "manager"]}>
              <ReportsPage />
            </RequireRole>
          }
        />
        <Route
          path="/inventory"
          element={
            <RequireRole allow={["admin", "manager"]}>
              <InventoryPage />
            </RequireRole>
          }
        />
        <Route
          path="/admin"
          element={
            <RequireRole allow={["admin"]}>
              <AdminPage />
            </RequireRole>
          }
        />
        <Route
          path="/customers"
          element={
            <RequireRole allow={["admin", "manager"]}>
              <CustomersPage />
            </RequireRole>
          }
        />
      </Route>

      <Route path="*" element={<Navigate to="/launcher" replace />} />
    </Routes>
  );
}

