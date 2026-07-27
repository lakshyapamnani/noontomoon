import { motion } from "framer-motion";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSettingsStore } from "@/store/settings.store";

export function KioskIdlePage() {
  const navigate = useNavigate();
  const settings = useSettingsStore((s) => s.settings);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") navigate("/launcher");
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [navigate]);

  return (
    <div
      className="dinex-grain min-h-screen bg-zinc-950 text-zinc-50"
      onClick={() => navigate("/kiosk/menu")}
      onTouchStart={() => navigate("/kiosk/menu")}
      role="button"
      tabIndex={0}
    >
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <motion.div
          className="absolute -left-28 -top-24 size-[520px] rounded-full bg-emerald-500/16 blur-3xl"
          animate={{ x: [0, 32, 0], y: [0, 18, 0], opacity: [0.55, 0.72, 0.55] }}
          transition={{ duration: 8.5, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute -right-24 -top-28 size-[620px] rounded-full bg-indigo-500/18 blur-3xl"
          animate={{ x: [0, -36, 0], y: [0, 22, 0], opacity: [0.5, 0.68, 0.5] }}
          transition={{ duration: 10.5, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute -bottom-40 left-1/3 size-[760px] rounded-full bg-rose-500/10 blur-3xl"
          animate={{ y: [0, -24, 0], opacity: [0.4, 0.6, 0.4] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      <div className="flex min-h-screen items-center justify-center px-6">
        <div className="text-center">
          <div className="mx-auto grid size-20 place-items-center rounded-[2.2rem] bg-white/6 ring-1 ring-white/10 shadow-glass">
            <span className="text-xl font-semibold tracking-tight">DX</span>
          </div>
          <div className="mt-5 text-3xl font-semibold tracking-tight">{settings.restaurantName}</div>
          <div className="mt-2 text-sm text-zinc-400">Self Ordering Kiosk</div>
          <motion.div
            className="mt-10 inline-flex items-center justify-center rounded-2xl border border-white/10 bg-white/5 px-7 py-4 text-lg font-semibold tracking-tight"
            animate={{ scale: [1, 1.02, 1], opacity: [0.85, 1, 0.85] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
          >
            Touch to Start
          </motion.div>
          <div className="mt-4 text-[12px] text-zinc-500">Tip: Press Esc to exit kiosk.</div>
        </div>
      </div>
    </div>
  );
}

