import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AlertTriangle, ArrowRight, Ban, FlaskConical, ShieldCheck } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { BrandHero } from "@/components/brands/BrandHero";
import { AdPlacement } from "@/components/ads/AdPlacement";
import { ProductCard } from "@/components/gear/ProductCard";
import { CompanyTable } from "@/components/CompanyTable";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { getAllCompanies, getAllSolutions, getBrandSlugs, getBrandsByScore } from "@/lib/db/queries";
import { prosChoiceIds } from "@/lib/brand-score";
import { seedAffiliateProducts, seedProducts } from "@/db/seed-data";
import { buildHumanSafetyBadge } from "@/lib/ph";
import { pageAlternates } from "@/lib/site";
import { cn } from "@/lib/utils";

export async function generateStaticParams() {
  const slugs = await getBrandSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const brand = (await getBrandsByScore()).find((b) => b.slug === slug);
  if (!brand) return {};
  return {
    title: `${brand.name} — техника и химия для клининга`,
    description: brand.description,
    alternates: pageAlternates(`/brands/${brand.slug}`),
  };
}

export default async function BrandPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const ranked = await getBrandsByScore();
  const position = ranked.findIndex((b) => b.slug === slug);
  const brand = ranked[position];
  if (!brand) notFound();

  const [companies, solutions] = await Promise.all([getAllCompanies(), getAllSolutions()]);
  const products = seedAffiliateProducts.filter((p) => p.brandId === brand.id);
  const proProducts = seedProducts.filter((p) => p.brandId === brand.id && p.status === "published");
  const partnerCompanies = companies.filter((c) => c.equipment?.includes(brand.id));
  const brandSolutions = solutions.filter((s) => s.recommendedProducts?.some((p) => p.brandId === brand.id));
  const prosChoice = prosChoiceIds(ranked).has(brand.id);
  const { verifiedCompanyCount, recommendedCount, alternativeCount, score } = brand.metrics;

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />

      <main className="flex-1">
        <BrandHero brand={brand} />

        {/* Индекс доверия профи */}
        <section className="container -mt-8 relative z-10">
          <div className="data-surface grid gap-6 rounded-panel border border-border p-6 sm:grid-cols-[auto_1fr] sm:items-center sm:p-8">
            <div>
              <span className="text-xs font-bold uppercase tracking-[0.18em] text-primary">Индекс доверия профи</span>
              <div className="mt-2 flex items-end gap-3">
                <strong className="font-data text-5xl font-medium text-foreground">{score}</strong>
                <span className="pb-2 text-sm text-muted-foreground">#{position + 1} из {ranked.length}</span>
              </div>
              {prosChoice && <StatusBadge variant="prosChoice" size="md" className="mt-3" />}
            </div>
            <dl className="grid grid-cols-3 gap-4 text-sm sm:border-l sm:border-border sm:pl-8">
              <Metric value={verifiedCompanyCount} label="верифицированных компаний" />
              <Metric value={recommendedCount} label="протоколов «рекомендуем»" />
              <Metric value={alternativeCount} label="протоколов «альтернатива»" />
            </dl>
          </div>
        </section>

        <AdPlacement
          placement="brand.profile_campaign"
          context={{}}
          className="container pt-8"
        />

        {proProducts.length > 0 && (
          <section className="container pt-16">
            <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-[0.2em] text-primary">
                  Средства и материалы
                </span>
                <h2 className="mt-3 font-display text-2xl font-bold tracking-[-0.03em] text-foreground sm:text-3xl">
                  Профессиональные средства {brand.name}: материалы и ограничения
                </h2>
                <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
                  Уточняйте применимость и ограничения для конкретного материала в инструкции производителя.
                </p>
              </div>
            </div>

            <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {proProducts.map((item) => {
                const safety = buildHumanSafetyBadge({ product: item });
                return (
                  <li
                    key={item.id}
                    className="data-surface flex h-full flex-col justify-between gap-4 rounded-panel border border-border p-5"
                  >
                    <div>
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span
                          className={cn(
                            "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold",
                            safety.className,
                          )}
                        >
                          {safety.light === "red" ? (
                            <AlertTriangle className="h-3.5 w-3.5 shrink-0" aria-hidden />
                          ) : safety.light === "yellow" ? (
                            <FlaskConical className="h-3.5 w-3.5 shrink-0" aria-hidden />
                          ) : (
                            <ShieldCheck className="h-3.5 w-3.5 shrink-0" aria-hidden />
                          )}
                          {safety.label}
                        </span>
                      </div>

                      <h3 className="mt-3 font-display text-lg font-bold text-foreground">{item.name}</h3>
                      <p className="mt-1.5 text-sm leading-6 text-muted-foreground">{item.description}</p>
                    </div>

                    <div className="space-y-2.5 border-t border-border/70 pt-3.5 text-xs">
                      {safety.compatibleLabels.length > 0 && (
                        <div>
                          <span className="font-semibold text-foreground">Поверхности в данных каталога:</span>
                          <div className="mt-1.5 flex flex-wrap gap-1.5">
                            {safety.compatibleLabels.map((surfaceName) => (
                              <span
                                key={surfaceName}
                                className="inline-flex items-center gap-1 rounded-full border border-success/25 bg-success/10 px-2.5 py-0.5 text-[11px] font-semibold text-success"
                              >
                                <ShieldCheck className="h-3 w-3 shrink-0" aria-hidden />
                                {surfaceName}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {safety.prohibitedLabels.length > 0 && (
                        <div>
                          <span className="font-semibold text-foreground">Где применять нельзя:</span>
                          <div className="mt-1.5 flex flex-wrap gap-1.5">
                            {safety.prohibitedLabels.map((surfaceName) => (
                              <span
                                key={surfaceName}
                                className="inline-flex items-center gap-1 rounded-full border border-danger/25 bg-danger/10 px-2.5 py-0.5 text-[11px] font-semibold text-danger"
                              >
                                <Ban className="h-3 w-3 shrink-0" aria-hidden />
                                {surfaceName}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          </section>
        )}

        {brandSolutions.length > 0 && (
          <section className="container py-16">
            <div className="mb-8 flex items-end justify-between gap-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-[0.2em] text-primary">В протоколах</span>
                <h2 className="mt-3 font-display text-2xl font-bold tracking-[-0.03em] text-foreground sm:text-3xl">
                  Где {brand.name} рекомендуют
                </h2>
              </div>
              <Link href="/solutions" className="text-sm font-semibold text-primary">
                Все решения
              </Link>
            </div>
            <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {brandSolutions.map((solution) => {
                const link = solution.recommendedProducts?.find((p) => p.brandId === brand.id);
                return (
                  <li key={solution.id}>
                    <Link
                      href={`/solutions/${solution.slug}`}
                      className="group flex h-full flex-col gap-2 rounded-control border border-border bg-card p-5 transition-colors hover:border-primary/30"
                    >
                      <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                        {link?.role === "recommended" ? "Рекомендуем" : "Альтернатива"}
                      </span>
                      <span className="font-display text-base font-bold text-foreground group-hover:text-primary">{solution.title}</span>
                      {link?.note && <span className="text-sm text-muted-foreground">{link.note}</span>}
                      <span className="mt-auto inline-flex items-center gap-1 pt-2 text-xs font-semibold text-primary">
                        Открыть протокол
                        <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </section>
        )}

        {products.length > 0 && (
          <section className="container py-16">
            <div className="mb-8 flex flex-col items-center gap-2 text-center">
              <h2 className="font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                Товары {brand.name}
              </h2>
              <p className="max-w-lg text-muted-foreground">
                Внешние ссылки на страницы продуктов; наличие и статус продавца уточняйте перед покупкой
              </p>
            </div>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {products.map((product, i) => (
                <ProductCard key={product.id} product={product} index={i} />
              ))}
            </div>
            <AdPlacement
              placement="dealer.local_partner"
              context={{}}
              className="mt-8"
            />
          </section>
        )}

        <section className="border-t border-border bg-muted/30 py-16">
          <div className="container">
            <div className="mb-8 flex flex-col items-center gap-2 text-center">
              <h2 className="font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                Компании рейтинга на {brand.name}
              </h2>
              <p className="max-w-lg text-muted-foreground">
                Компании, в профиле которых указан этот бренд; в индекс входят только подтверждённые связи
              </p>
            </div>

            {partnerCompanies.length > 0 ? (
              <CompanyTable companies={partnerCompanies} ranked={false} />
            ) : (
              <p className="text-center text-sm text-muted-foreground">
                Пока ни одна компания в рейтинге не отметила этот бренд.
              </p>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

function Metric({ value, label }: { value: number; label: string }) {
  return (
    <div>
      <dd className="font-data text-2xl font-medium text-foreground">{value}</dd>
      <dt className="mt-1 text-xs leading-4 text-muted-foreground">{label}</dt>
    </div>
  );
}
