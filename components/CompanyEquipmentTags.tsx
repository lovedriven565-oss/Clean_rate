import Link from "next/link";
import type { Brand } from "@/lib/types";
import { brands } from "@/lib/mock-data";

export function CompanyEquipmentTags({
  brands: passedBrands,
  brandIds,
}: {
  brands?: Brand[];
  brandIds?: string[];
}) {
  const resolved =
    passedBrands ??
    (brandIds ?? [])
      .map((id) => brands.find((b) => b.id === id))
      .filter((b): b is Brand => Boolean(b));

  if (resolved.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-1.5">
      {resolved.map((brand) => (
        <Link
          key={brand.id}
          href={`/brands/${brand.slug}`}
          className="inline-flex items-center gap-1 rounded-full border border-border bg-background px-2 py-0.5 text-[11px] font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: brand.accent }} />
          {brand.name}
        </Link>
      ))}
    </div>
  );
}
