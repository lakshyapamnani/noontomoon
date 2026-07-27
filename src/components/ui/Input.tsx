import { cn } from "@/utils/cn";
import type { InputHTMLAttributes } from "react";

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "h-11 w-full rounded-2xl border border-white/10 bg-white/5 px-4 text-sm text-zinc-100 placeholder:text-zinc-500",
        "outline-none transition focus:border-indigo-400/40 focus:ring-2 focus:ring-indigo-400/20",
        className
      )}
      {...props}
    />
  );
}

