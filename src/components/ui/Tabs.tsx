import { cn } from "@/utils/cn";

export function Tabs<T extends string>({
  value,
  onChange,
  items
}: {
  value: T;
  onChange: (v: T) => void;
  items: Array<{ value: T; label: string; hint?: string }>;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((it) => (
        <button
          key={it.value}
          type="button"
          onClick={() => onChange(it.value)}
          className={cn(
            "rounded-2xl border px-3 py-2 text-left text-sm transition",
            value === it.value ? "border-indigo-400/30 bg-indigo-500/12" : "border-white/8 bg-white/3 hover:bg-white/5"
          )}
        >
          <div className="font-semibold">{it.label}</div>
          {it.hint ? <div className="mt-0.5 text-[11px] text-zinc-400">{it.hint}</div> : null}
        </button>
      ))}
    </div>
  );
}

