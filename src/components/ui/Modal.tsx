import { cn } from "@/utils/cn";
import { AnimatePresence, motion } from "framer-motion";

export function Modal({
  open,
  onClose,
  title,
  children,
  maxWidth = "max-w-xl"
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  maxWidth?: string;
}) {
  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-[80] grid place-items-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <button
            type="button"
            className="absolute inset-0 bg-black/60"
            onClick={onClose}
            aria-label="Close modal"
          />
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.98 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            className={cn(
              "relative w-full overflow-hidden rounded-2.5xl border border-white/10 bg-zinc-950/85 shadow-soft-lg shadow-black/40 backdrop-blur-xl",
              maxWidth
            )}
          >
            <div className="flex items-center justify-between border-b border-white/8 bg-white/3 px-5 py-4">
              <div className="text-sm font-semibold text-zinc-100">{title}</div>
              <button
                type="button"
                onClick={onClose}
                className="grid size-9 place-items-center rounded-2xl bg-white/6 ring-1 ring-white/10 transition hover:bg-white/8"
              >
                ✕
              </button>
            </div>
            <div className="px-5 py-5">{children}</div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

