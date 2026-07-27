import { cn } from "@/utils/cn";
import type { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary" | "ghost" | "glass" | "danger";
type Size = "sm" | "md" | "lg" | "xl";

const base =
  "inline-flex items-center justify-center gap-2 select-none whitespace-nowrap rounded-2xl font-medium tracking-[-0.01em] transition active:translate-y-[1px] disabled:opacity-50 disabled:pointer-events-none focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400/40";

const variants: Record<Variant, string> = {
  primary:
    "bg-indigo-500/90 hover:bg-indigo-500 text-white shadow-soft-lg shadow-indigo-500/10 ring-1 ring-white/10",
  secondary:
    "bg-white/6 hover:bg-white/9 text-zinc-50 ring-1 ring-white/10",
  ghost: "bg-transparent hover:bg-white/6 text-zinc-50",
  glass:
    "bg-white/7 hover:bg-white/10 text-zinc-50 ring-1 ring-white/12 shadow-glass backdrop-blur-xl",
  danger:
    "bg-rose-500/85 hover:bg-rose-500 text-white ring-1 ring-white/10 shadow-soft-lg shadow-rose-500/10"
};

const sizes: Record<Size, string> = {
  sm: "h-9 px-3 text-sm",
  md: "h-10 px-4 text-sm",
  lg: "h-11 px-5 text-sm",
  xl: "h-12 px-6 text-base"
};

export function Button({
  className,
  variant = "secondary",
  size = "md",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; size?: Size }) {
  return <button className={cn(base, variants[variant], sizes[size], className)} {...props} />;
}

