import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { HomeHero } from "@/components/home/HomeHero";
import { HomeMotion, Reveal } from "@/components/home/Reveal";
import { LiveStats } from "@/components/home/LiveStats";
import { RoomsBento } from "@/components/home/RoomsBento";
import { SolutionShowcase } from "@/components/home/SolutionShowcase";
import { MastersBrandsSection } from "@/components/home/MastersBrandsSection";
import { HomeEditorialAd } from "@/components/ads/HomeEditorialAd";
import { SelectedSolutionProvider } from "@/components/providers/SelectedSolutionProvider";
import { getEligibleAd } from "@/lib/ads/queries";
import { getAllBrands, getAllCompanies, getAllSolutions, getPriceEstimates } from "@/lib/db/queries";
import { ENABLED_MARKETS, openCities } from "@/lib/markets";
import { resolveSelection } from "@/lib/solutions/diagnostic";
import { pluralize } from "@/lib/format";
import { SITE_NAME, SITE_URL, absoluteUrl, pageAlternates } from "@/lib/site";

export const metadata: Metadata = {
  title: `${SITE_NAME} — найдите решение любой задачи чистоты`,
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
  // Протокол дня — тот же, что hero показывает по умолчанию (первый доступный выбор диагностики).
  const featuredSolution = resolveSelection(solutions, {}).solution ?? published[0] ?? null;

  // Живые цифры — только реальные данные, без выдуманных метрик.
  const openCityCount = ENABLED_MARKETS.reduce((sum, market) => sum + openCities(market).length, 0);
  const totalSteps = published.reduce((sum, s) => sum + s.diySteps.length, 0);
  const stats = [
    { value: published.length, label: pluralize(published.length, ["протокол", "протокола", "протоколов"]) },
    { value: openCityCount, label: pluralize(openCityCount, ["открытый город", "открытых города", "открытых городов"]) },
    { value: totalSteps, label: pluralize(totalSteps, ["шаг", "шага", "шагов"]) + " в инструкциях" },
  ];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: SITE_URL,
    potentialAction: {
      "@type": "SearchAction",
      target: { "@type": "EntryPoint", urlTemplate: absoluteUrl("/rating?q={search_term_string}") },
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <HomeMotion>
      <div className="flex min-h-screen flex-col bg-background">
        <Navbar />

        <main className="flex-1">
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
          />

          <HomeHero solutions={solutions} estimates={estimates} />

          <div className="container space-y-20 py-14 sm:space-y-24 sm:py-20">
            <LiveStats stats={stats} />

            {/* По комнатам и поверхностям — bento-полки с обложками */}
            <Reveal>
              <RoomsBento solutions={solutions} />
            </Reveal>

            <SelectedSolutionProvider>
              {/* Витрина решений + подборки (мастер-деталь) */}
              <Reveal>
                <SolutionShowcase solutions={solutions} estimates={estimates} />
              </Reveal>

              {/* Партнёр сезона (реклама): помеченный слот региона, не влияет на органику */}
              <HomeEditorialAd ads={editorialAdByCountry} />

              {/* Мастера выбранной задачи в выбранном городе + витрина брендов */}
              <Reveal>
                <MastersBrandsSection solution={featuredSolution} companies={companies} brands={brands} />
              </Reveal>
            </SelectedSolutionProvider>

            {/* Строка доверия вместо бенто-манифеста */}
            <p className="text-center text-sm text-muted-foreground">
              Реклама отделена. Рейтинг не продаётся.{" "}
              <Link href="/rating/methodology" className="font-semibold text-link hover:underline">
                Как считаем рейтинг
              </Link>
            </p>

            {/* B2B: единый вход для бизнеса */}
            <Reveal>
              <section className="linear-beam relative overflow-hidden rounded-panel bg-cta p-7 text-cta-foreground sm:p-12">
                <div
                  aria-hidden
                  className="pointer-events-none absolute -right-20 -top-24 size-72 rounded-full bg-brand/30 blur-3xl"
                />
                <div className="relative flex flex-wrap items-end justify-between gap-6">
                  <div className="max-w-2xl">
                    <h2 className="text-balance font-display text-3xl font-bold tracking-[-0.03em] sm:text-4xl">
                      Вы бренд химии или клининговая компания? Займите место в протоколах и рейтинге.
                    </h2>
                    <p className="mt-4 max-w-xl text-cta-foreground/75">
                      Предложите составы для проверки: совместимые с поверхностью продукты попадают в пошаговые
                      решения, клининговая компания — в рейтинг с прямым телефоном.
                    </p>
                  </div>
                  <Link
                    href="/for-partners"
                    className="inline-flex min-h-12 items-center gap-2 rounded-full bg-brand px-6 text-sm font-semibold text-brand-foreground transition-transform active:scale-[0.98]"
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
