import { isLightColor } from "@/lib/brand-utils";
import { cn } from "@/lib/utils";

const sizes = {
  sm: "h-8 w-8 rounded-control text-xs",
  md: "h-11 w-11 rounded-control text-base",
  lg: "h-14 w-14 rounded-panel text-xl",
} as const;

/** Буквенная метка бренда в его фирменном цвете — тот же язык, что в BrandHero и каталоге. */
export function BrandMark({
  name,
  accent,
  size = "md",
  className,
}: {
  name: string;
  accent?: string;
  size?: keyof typeof sizes;
  className?: string;
}) {
  const light = isLightColor(accent);
  return (
    <span
      aria-hidden
      className={cn(
        "flex shrink-0 items-center justify-center font-display font-bold shadow-[inset_0_1px_0_hsl(0_0%_100%/0.25),0_8px_20px_-8px_hsl(var(--shadow-tint)/0.35)]",
        light ? "text-slate-900" : "text-white",
        sizes[size],
        className
      )}
      style={{ backgroundColor: accent ?? "hsl(var(--foreground))" }}
    >
      {name.charAt(0)}
    </span>
  );
}
