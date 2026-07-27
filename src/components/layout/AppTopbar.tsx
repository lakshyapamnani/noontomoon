import { useEffect, useMemo, useState } from "react";
import { useAuthStore } from "@/store/auth.store";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";
import { usePrinterStatusStore } from "@/store/printers.store";
import { Button } from "@/components/ui/Button";
import { Chip } from "@/components/ui/Chip";
import { cn } from "@/utils/cn";
import { format } from "date-fns";

export function AppTopbar({
  onLogo,
  className,
  subtleDivider
}: {
  onLogo?: () => void;
  className?: string;
  subtleDivider?: boolean;
}) {
  const session = useAuthStore((s) => s.session);
  const logout = useAuthStore((s) => s.logout);
  const online = useOnlineStatus();
  const printerState = usePrinterStatusStore((s) => s.status);
  const refresh = usePrinterStatusStore((s) => s.refresh);
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const t = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(t);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const printerChip = useMemo(() => {
    const isOk = printerState.veg.ok && printerState.nonveg.ok && printerState.bill.ok;
    return (
      <Chip tone={isOk ? "good" : "warn"}>
        {isOk ? "Printers OK" : "Printer Issue"}
      </Chip>
    );
  }, [printerState]);

  return (
    <header
      className={cn(
        "backdrop-blur-xl",
        "bg-zinc-950/55",
        subtleDivider ? "border-b border-white/6" : "",
        className
      )}
    >
      <div className="mx-auto flex max-w-[1600px] items-center gap-3 px-4 py-3 md:px-6">
        <button
          type="button"
          onClick={onLogo}
          className="group flex items-center gap-2 rounded-2xl px-2 py-1.5 transition hover:bg-white/6"
        >
          <div className="grid size-9 place-items-center rounded-2xl bg-white/6 ring-1 ring-white/10 shadow-glass">
            <span className="text-sm font-semibold tracking-tight">DX</span>
          </div>
          <div className="leading-tight">
            <div className="text-sm font-semibold tracking-tight">DINEX</div>
            <div className="text-[11px] text-zinc-400">Restaurant OS</div>
          </div>
        </button>

        <div className="ml-auto flex items-center gap-2">
          <div className="hidden items-center gap-2 lg:flex">
            <Chip tone="neutral">{format(now, "EEE, dd MMM")}</Chip>
            <Chip tone="neutral">{format(now, "hh:mm:ss a")}</Chip>
            {printerChip}
            <Chip tone={online ? "good" : "warn"}>{online ? "Online" : "Offline"}</Chip>
          </div>
          <div className="hidden h-9 w-px bg-white/8 lg:block" />
          <div className="hidden text-right lg:block">
            <div className="text-xs font-medium text-zinc-200">
              {session ? session.displayName : "Guest"}
            </div>
            <div className="text-[11px] text-zinc-400">{session ? session.role.toUpperCase() : ""}</div>
          </div>
          {session ? (
            <Button size="sm" variant="ghost" onClick={logout}>
              Log out
            </Button>
          ) : (
            <Button size="sm" variant="glass" onClick={() => (window.location.href = "/login")}>
              Sign in
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}

