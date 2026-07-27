import { cn } from "@/utils/cn";
import type { SelectHTMLAttributes } from "react";

export function Select({ className, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={cn(
        "h-11 w-full rounded-2xl border border-white/10 bg-white/5 px-4 text-sm text-zinc-100",
        "outline-none transition focus:border-indigo-400/40 focus:ring-2 focus:ring-indigo-400/20",
        className
      )}
      {...props}
    />
  );
}

