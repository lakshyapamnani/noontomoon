import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { AppTopbar } from "@/components/layout/AppTopbar";
import { cn } from "@/utils/cn";

export function AppLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const isLogin = location.pathname === "/login";
  const isKiosk = location.pathname.startsWith("/kiosk");

  if (isLogin || isKiosk) return <Outlet />;

  return (
    <div className="dinex-grain min-h-screen bg-zinc-950">
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_0%,rgba(99,102,241,0.14),transparent_35%),radial-gradient(circle_at_80%_20%,rgba(16,185,129,0.10),transparent_40%),radial-gradient(circle_at_40%_90%,rgba(244,63,94,0.08),transparent_45%)]" />
      </div>
      <AppTopbar
        onLogo={() => navigate("/launcher")}
        subtleDivider
        className={cn("sticky top-0 z-40")}
      />
      <main className="mx-auto max-w-[1600px] px-4 pb-10 pt-5 md:px-6">
        <Outlet />
      </main>
    </div>
  );
}

