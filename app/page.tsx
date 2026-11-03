import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { HomeMotion, Reveal } from "@/components/home/Reveal";
import { PlatformHero } from "@/components/home/PlatformHero";
import { StainRescue } from "@/components/home/StainRescue";
import { TaskRibbon } from "@/components/home/TaskRibbon";
import { ProductZoneShelf } from "@/components/home/ProductZoneShelf";
import { SeasonalBrandBanner } from "@/components/home/SeasonalBrandBanner";
import { VideoLabSection } from "@/components/home/VideoLabSection";
import { CleanersByServiceSection } from "@/components/home/CleanersByServiceSection";
import { getEligibleAd } from "@/lib/ads/queries";
import { seedAffiliateProducts, seedProducts, seedSolutionProducts } from "@/db/seed-data";
import { getAllBrands, getAllCompanies, getAllSolutions, getPriceEstimates } from "@/lib/db/queries";
import { ENABLED_MARKETS } from "@/lib/markets";
import { buildShelfProducts } from "@/lib/products/zone-shelf";
import { SITE_NAME, absoluteUrl, pageAlternates } from "@/lib/site";
import type { HeroStatsData } from "@/components/home/HeroStats";
import type { CurrencyCode } from "@/lib/markets";

export const metadata: Metadata = {
  title: `Пятновыводители, протоколы уборки и клинеры | ${SITE_NAME}`,
  description:
    "Пятно на диване, офис после корпоратива или выбор профессиональной химии — одна строка поиска. Пошаговые протоколы ChistoLab, честный рейтинг клининговых компаний и бренды для профи.",
  alternates: pageAlternates("/"),
};

export default async function Home() {
  const [companies, solutions, estimates, brands, ...editorialAds] = await Promise.all([
    getAllCompanies(),
    getAllSolutions(),
    getPriceEstimates(),
    getAllBrands(),
    // Единственный коммерческий блок главной — ниже полезного контента, не в hero.
    // Страна посетителя на SSG неизвестна → одобренная кампания выбирается для каждого
    // открытого рынка, а клиент показывает ту, что таргетирует его регион.
    ...ENABLED_MARKETS.map((market) =>
      getEligibleAd("home.editorial_partner", { countryCode: market.countryCode })
    ),
  ]);
  const editorialAdByCountry = Object.fromEntries(
    ENABLED_MARKETS.map((market, i) => [market.countryCode, editorialAds[i]])
  );

  const published = solutions.filter((s) => s.status === "published");
  const shelf = buildShelfProducts(seedAffiliateProducts, seedProducts, seedSolutionProducts, brands);

  // Урезанные DTO для hero: только числа — вся интерактивность на клиенте.
  const stats: HeroStatsData = {
    protocolCount: published.length,
    productCount: shelf.length,
    companiesByCity: companies.reduce<Record<string, number>>((acc, c) => {
      acc[c.city] = (acc[c.city] ?? 0) + 1;
      return acc;
    }, {}),
    minPriceByCountry: Object.fromEntries(
      ENABLED_MARKETS.map((market) => {
        const prices = estimates
          .filter((e) => !e.solutionId && e.countryCode === market.countryCode)
          .map((e) => e.priceMin);
        const min = prices.length ? Math.min(...prices) : null;
        return [
          market.countryCode,
          min === null ? null : { value: min, currency: market.currency as CurrencyCode },
        ];
      }),
    ),
  };

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: absoluteUrl("/"),
    potentialAction: {
      "@type": "SearchAction",
      target: { "@type": "EntryPoint", urlTemplate: absoluteUrl("/rating?q={search_term_string}") },
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <HomeMotion>
      <div className="flex min-h-screen flex-col bg-background">
        <Navbar promoAds={editorialAdByCountry} />

        <main className="flex-1">
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
          />

          {/* Первый экран: светлый hero + 4 реальные цифры */}
          <PlatformHero stats={stats} />

          {/* Спецпроект сезона: активная кампания региона или редакционный выбор лаборатории */}
          <div className="container">
            <SeasonalBrandBanner ads={editorialAdByCountry} shelfProducts={shelf} />
          </div>

          {/* Спасатель пятен: диагностика проблема → поверхность → протокол */}
          <StainRescue solutions={published} products={shelf} estimates={estimates} />

          {/* Разборы протоколов 9:16 */}
          <VideoLabSection solutions={published} products={shelf} />

          {/* Клинеры города по видам работ: цены, спонсор + органика */}
          <CleanersByServiceSection companies={companies} estimates={estimates} />

          {/* Средства и техника по зонам дома */}
          <ProductZoneShelf products={shelf} estimates={estimates} />

          {/* Лента всех протоколов — каталог и SEO-вес внизу страницы */}
          <TaskRibbon solutions={published} estimates={estimates} />

          <div className="container space-y-16 py-14 sm:space-y-20 sm:py-20">
            {/* Строка доверия */}
            <p className="text-center text-sm text-muted-foreground">
              Реклама отделена. Рейтинг не продаётся.{" "}
              <Link href="/rating/methodology" className="font-semibold text-link hover:underline">
                Как считаем рейтинг
              </Link>
            </p>

            {/* B2B: единый вход для бизнеса */}
            <Reveal>
              <section className="linear-beam relative overflow-hidden rounded-panel border border-teal/25 bg-card p-7 sm:p-12">
                <div
                  aria-hidden
                  className="pointer-events-none absolute -right-20 -top-24 size-72 rounded-full bg-lime/25 blur-3xl"
                />
                <div className="relative flex flex-wrap items-end justify-between gap-6">
                  <div className="max-w-2xl">
                    <h2 className="text-balance font-display text-3xl font-bold tracking-[-0.03em] text-foreground sm:text-4xl">
                      Вы бренд химии или клининговая компания? Займите место в протоколах и рейтинге.
                    </h2>
                    <p className="mt-4 max-w-xl text-muted-foreground">
                      Предложите составы для проверки: совместимые с поверхностью продукты попадают в пошаговые
                      решения, клининговая компания — в рейтинг с прямым телефоном.
                    </p>
                  </div>
                  <Link
                    href="/for-partners"
                    className="inline-flex min-h-12 items-center gap-2 rounded-full bg-ink px-6 text-sm font-semibold text-ink-foreground transition-transform active:scale-[0.98]"
                  >
                    Бизнесу
                    <ArrowRight className="size-4" aria-hidden />
                  </Link>
                </div>
              </section>
            </Reveal>
          </div>
        </main>

        <Footer />
      </div>
    </HomeMotion>
  );
}
