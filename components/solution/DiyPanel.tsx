import Link from "next/link";
import { AlertTriangle, ArrowUpRight, FlaskConical, Hand, ShieldCheck, ShoppingCart, Wallet } from "lucide-react";
import { buildHumanSafetyBadge, findSeedProduct } from "@/lib/ph";
import type { Brand, Company, PriceEstimate, Solution } from "@/lib/types";
import { SURFACE_LABELS } from "@/lib/solutions/meta";
import { cn } from "@/lib/utils";
import { DiyChecklist } from "./DiyChecklist";
import { DiyEscalation } from "./DiyEscalation";
import { RescueCalculator } from "./RescueCalculator";
import { SolutionVideo } from "./SolutionVideo";
import { WarningList } from "./WarningList";

export function DiyPanel({
  solution,
  brands,
  estimates,
  companies,
}: {
  solution: Solution;
  brands: Brand[];
  estimates: PriceEstimate[];
  companies: Company[];
}) {
  const products = solution.recommendedProducts ?? [];
  const recommended = products.filter((p) => p.role === "recommended");
  const alternatives = products.filter((p) => p.role === "alternative");
  const brandBySlugOrId = (id?: string) => brands.find((b) => b.id === id || b.slug === id);
  const surfaceTarget = solution.material ?? SURFACE_LABELS[solution.surface].toLowerCase();

  return (
    <section
      id="diy"
      aria-labelledby="diy-title"
      className="data-surface scroll-mt-32 flex h-full min-w-0 flex-col rounded-panel p-6 sm:p-8"
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

      {/* «Не делайте» первым: предупреждения важнее самих шагов протокола */}
      <WarningList warnings={solution.warnings} className="mt-6" />

      {/* Интерактивный калькулятор: Спасти самому или вызвать мастера за 10 секунд */}
      <RescueCalculator solution={solution} estimates={estimates} companies={companies} />

      {/* Видеоразбор или интерактивный Сторис-разбор протокола */}
      <SolutionVideo solution={solution} brands={brands} />

      <div id="diy-steps" className="scroll-mt-32">
        <DiyChecklist slug={solution.slug} steps={solution.diySteps} />
      </div>

      {/* Мостик к мастеру сразу после шагов: момент, когда читатель решает, справится ли сам */}
      <DiyEscalation solution={solution} estimates={estimates} companies={companies} />

      {solution.diyCostNote && (
        <p className="mt-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground sm:hidden">
          <Wallet className="h-3.5 w-3.5" />
          {solution.diyCostNote}
        </p>
      )}

      {products.length > 0 && (
        <div id="diy-products" className="mt-8 scroll-mt-32 border-t border-border/70 pt-6">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h3 className="font-display text-lg font-bold tracking-[-0.02em] text-foreground">
                Средства из инструкции
              </h3>
              <p className="mt-1 text-xs leading-5 text-muted-foreground">
                Перед применением проверьте инструкцию производителя и ограничения для материала.
              </p>
            </div>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-star/30 bg-star/15 px-3 py-1 text-xs font-semibold text-star">
              <ShieldCheck className="h-3.5 w-3.5 shrink-0" />
              Материал: {surfaceTarget}
            </span>
          </div>

          {/* Человеческий светофор безопасности покрытий вместо сухих цифр pH */}
          <div className="mt-3.5 flex flex-wrap gap-2" aria-label="Светофор безопасности для покрытия">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-star/30 bg-star/15 px-3 py-1 text-[11px] font-semibold text-star">
              <ShieldCheck className="h-3.5 w-3.5 shrink-0" aria-hidden />
              Совместимость с материалом нужно уточнить
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-star/30 bg-star/15 px-3 py-1 text-[11px] font-semibold text-star">
              <FlaskConical className="h-3.5 w-3.5 shrink-0" aria-hidden />
              Сначала тест на незаметном шве · Деликатное покрытие
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-danger/25 bg-danger/10 px-3 py-1 text-[11px] font-semibold text-danger">
              <AlertTriangle className="h-3.5 w-3.5 shrink-0" aria-hidden />
              Бытовая щёлочь и хлор: риск смыть краску и оставить ореол
            </span>
          </div>

          <ul className="mt-4 space-y-2.5">
            {[...recommended, ...alternatives].map((product) => {
              const brand = brandBySlugOrId(product.brandId);
              const seedProduct = findSeedProduct(product);
              const safetyBadge = buildHumanSafetyBadge({
                product: seedProduct,
                surface: solution.surface,
                solution,
                note: product.note,
              });
              const label = product.note ?? product.productName ?? seedProduct?.name ?? brand?.name ?? "Средство";
              const buyUrl = brand && brand.affiliateUrl !== "#" ? brand.affiliateUrl : null;
              const isPrimary = product.role === "recommended";
              const roleLabel = isPrimary ? "Основной состав" : "Альтернатива";

              return (
                <li
                  key={product.id ?? label}
                  className="group flex flex-col gap-3 rounded-control border border-border/80 bg-muted/30 p-4 transition-colors hover:border-primary/30 hover:bg-card sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={
                          isPrimary
                            ? "inline-flex items-center rounded-full bg-primary/12 px-2.5 py-0.5 text-[11px] font-semibold text-primary"
                            : "inline-flex items-center rounded-full border border-border bg-card px-2.5 py-0.5 text-[11px] font-medium text-muted-foreground"
                        }
                      >
                        {roleLabel}
                      </span>
                      <span
                        className={cn(
                          "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold",
                          safetyBadge.className,
                        )}
                      >
                        {safetyBadge.light === "red" ? (
                          <AlertTriangle className="h-3 w-3 shrink-0" aria-hidden />
                        ) : safetyBadge.light === "yellow" ? (
                          <FlaskConical className="h-3 w-3 shrink-0" aria-hidden />
                        ) : (
                          <ShieldCheck className="h-3 w-3 shrink-0" aria-hidden />
                        )}
                        {safetyBadge.label}
                      </span>
                    </div>

                    {brand ? (
                      <Link href={`/brands/${brand.slug}`} className="mt-2 block">
                        <span className="block text-sm font-semibold text-foreground transition-colors group-hover:text-primary">
                          {label}
                        </span>
                        <span className="mt-0.5 inline-flex items-center gap-1 text-xs text-muted-foreground group-hover:text-foreground">
                          Профиль бренда {brand.name}
                          <ArrowUpRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                        </span>
                      </Link>
                    ) : (
                      <div className="mt-2">
                        <span className="block text-sm font-semibold text-foreground">{label}</span>
                      </div>
                    )}

                    {safetyBadge.prohibitedLabels.length > 0 && (
                      <p className="mt-1.5 text-[11px] text-muted-foreground">
                        Не применять на: <span className="font-medium text-danger">{safetyBadge.prohibitedLabels.join(", ")}</span>
                      </p>
                    )}
                  </div>

                  <div className="flex shrink-0 items-center gap-2">
                    {brand && (
                      <Link
                        href={`/brands/${brand.slug}`}
                        className="inline-flex h-9 items-center gap-1 rounded-full border border-border bg-card/70 px-3 text-xs font-medium text-muted-foreground transition-colors hover:border-primary/30 hover:text-foreground"
                      >
                        О бренде
                      </Link>
                    )}
                    {buyUrl && safetyBadge.verdict !== "forbidden" && (
                      <a
                        href={buyUrl}
                        target="_blank"
                        rel="sponsored nofollow noopener"
                        className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full border border-primary/25 bg-primary/10 px-3.5 text-xs font-semibold text-primary transition-colors hover:bg-primary hover:text-primary-foreground active:scale-[0.98]"
                      >
                        <ShoppingCart className="h-3.5 w-3.5" />
                        Купить
                      </a>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
          <p className="mt-3 text-xs leading-5 text-muted-foreground">
            Кнопки «Купить» ведут на официальные сайты брендов и маркетплейсы. По ним платформа может получать партнёрское вознаграждение. Дилеров и наличие в вашем городе смотрите на странице бренда.
          </p>
        </div>
      )}
    </section>
  );
}
