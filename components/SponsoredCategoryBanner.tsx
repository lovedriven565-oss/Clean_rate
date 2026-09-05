import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { Brand } from "@/lib/types";
import { SponsoredBadge } from "@/components/ui/SponsoredBadge";

export function SponsoredCategoryBanner({ brand }: { brand: Brand }) {
  return (
    <Link
      href={`/brands/${brand.slug}`}
      className="group flex items-center justify-between gap-2 rounded-xl border border-border/60 bg-gradient-to-r from-muted/60 to-transparent px-3 py-2 transition-colors hover:border-primary/40 hover:bg-muted"
    >
      <span className="flex min-w-0 items-center gap-2">
        <span
          className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white"
          style={{ backgroundColor: brand.accent }}
        >
          {brand.name.charAt(0)}
        </span>
        <span className="truncate text-xs text-muted-foreground">
          При поддержке{" "}
          <span className="font-semibold" style={{ color: brand.accent }}>
            {brand.name}
          </span>
        </span>
      </span>
      <span className="flex shrink-0 items-center gap-1">
        <SponsoredBadge />
        <ArrowUpRight className="h-3 w-3 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
      </span>
    </Link>
  );
}
