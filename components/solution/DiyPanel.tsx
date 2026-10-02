import Link from "next/link";
import { ArrowUpRight, Hand, Wallet } from "lucide-react";
import type { Brand, Solution } from "@/lib/types";
import { DiyChecklist } from "./DiyChecklist";
import { WarningList } from "./WarningList";

export function DiyPanel({ solution, brands }: { solution: Solution; brands: Brand[] }) {
  const products = solution.recommendedProducts ?? [];
  const recommended = products.filter((p) => p.role === "recommended");
  const alternatives = products.filter((p) => p.role === "alternative");
  const brandBySlugOrId = (id?: string) => brands.find((b) => b.id === id || b.slug === id);

  return (
    <section
      id="diy"
      aria-labelledby="diy-title"
      className="scroll-mt-32 flex h-full min-w-0 flex-col rounded-panel border border-border bg-card p-6 sm:p-8"
    >
      <header className="flex items-start justify-between gap-4">
        <div>
          <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-primary">
            <Hand className="h-3.5 w-3.5" />
            Путь 1
          </span>
          <h2 id="diy-title" className="mt-2 font-display text-2xl font-bold tracking-[-0.03em] text-foreground sm:text-3xl">
            Сделать самому
          </h2>
        </div>
        {solution.diyCostNote && (
          <span className="hidden shrink-0 items-center gap-1.5 rounded-full border border-border bg-muted/60 px-3 py-1.5 text-xs font-medium text-muted-foreground sm:inline-flex">
            <Wallet className="h-3.5 w-3.5" />
            {solution.diyCostNote}
          </span>
        )}
      </header>

      <DiyChecklist slug={solution.slug} steps={solution.diySteps} />

      {solution.diyCostNote && (
        <p className="mt-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground sm:hidden">
          <Wallet className="h-3.5 w-3.5" />
          {solution.diyCostNote}
        </p>
      )}

      <WarningList warnings={solution.warnings} className="mt-8" />

      {products.length > 0 && (
        <div className="mt-8 border-t border-border/70 pt-6">
          <span className="text-xs font-bold uppercase tracking-[0.16em] text-muted-foreground">Профессиональные средства</span>
          <ul className="mt-3 space-y-2">
            {[...recommended, ...alternatives].map((product) => {
              const brand = brandBySlugOrId(product.brandId);
              const label = product.note ?? product.productName ?? brand?.name ?? "Средство";
              const inner = (
                <>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium text-foreground">{label}</span>
                    <span className="block text-xs text-muted-foreground">
                      {product.role === "recommended" ? "Рекомендуем" : "Альтернатива"}
                      {brand ? ` · ${brand.name}` : ""}
                    </span>
                  </span>
                  {brand && <ArrowUpRight className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-primary" />}
                </>
              );
              const className =
                "group flex items-center gap-3 rounded-control border border-border/80 bg-muted/30 px-4 py-3 transition-colors hover:border-primary/30 hover:bg-card";
              return (
                <li key={product.id ?? label}>
                  {brand ? (
                    <Link href={`/brands/${brand.slug}`} className={className}>
                      {inner}
                    </Link>
                  ) : (
                    <div className={className}>{inner}</div>
                  )}
                </li>
              );
            })}
          </ul>
          <p className="mt-3 text-xs leading-5 text-muted-foreground">
            Дилеров и наличие в вашем городе смотрите на странице бренда. Платформа не продаёт химию и не получает процент с этих ссылок.
          </p>
        </div>
      )}
    </section>
  );
}
