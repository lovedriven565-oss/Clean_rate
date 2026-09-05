import { Sparkle } from "lucide-react";
import { cn } from "@/lib/utils";

export function SponsoredBadge({
  label = "Реклама",
  className,
  tone = "light",
}: {
  label?: string;
  className?: string;
  tone?: "light" | "dark";
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-medium uppercase tracking-wide backdrop-blur",
        tone === "dark"
          ? "bg-white/10 text-white/60"
          : "bg-foreground/5 text-muted-foreground",
        className
      )}
    >
      <Sparkle className="h-3 w-3" />
      {label}
    </span>
  );
}
