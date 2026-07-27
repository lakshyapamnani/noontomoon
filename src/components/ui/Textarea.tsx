import { cn } from "@/utils/cn";
import type { TextareaHTMLAttributes } from "react";

export function Textarea({ className, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(
        "min-h-[110px] w-full resize-none rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-zinc-100 placeholder:text-zinc-500",
        "outline-none transition focus:border-indigo-400/40 focus:ring-2 focus:ring-indigo-400/20",
        className
      )}
      {...props}
    />
  );
}

