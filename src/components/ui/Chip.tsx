import { cn } from "@/utils/cn";
import type { HTMLAttributes } from "react";

type Tone = "neutral" | "good" | "warn";

const tones: Record<Tone, string> = {
  neutral: "bg-white/6 text-zinc-200 ring-1 ring-white/10",
  good: "bg-emerald-500/12 text-emerald-200 ring-1 ring-emerald-500/25",
  warn: "bg-amber-500/12 text-amber-200 ring-1 ring-amber-500/25"
};

export function Chip({
  className,
  tone = "neutral",
  ...props
}: HTMLAttributes<HTMLDivElement> & { tone?: Tone }) {
  return (
    <div
      className={cn(
        "inline-flex h-8 items-center rounded-2xl px-3 text-[12px] font-medium tracking-[-0.01em]",
        tones[tone],
        className
      )}
      {...props}
    />
  );
}

