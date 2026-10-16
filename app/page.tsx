import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ShieldCheck } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { HomeHero } from "@/components/home/HomeHero";
import { HomeMotion, Reveal } from "@/components/home/Reveal";
import { SolutionShelves } from "@/components/home/SolutionShelves";
import { PriceTable } from "@/components/home/PriceTable";
import { TaskTicker } from "@/components/home/TaskTicker";
import { TwoPathsSection } from "@/components/home/TwoPathsSection";
import { AdCreative } from "@/components/ads/AdCreative";
import { getEligibleAd } from "@/lib/ads/queries";
import { getAllCompanies, getAllSolutions, getPriceEstimates } from "@/lib/db/queries";
import { resolveSelection } from "@/lib/solutions/diagnostic";
import { SITE_NAME, SITE_URL, absoluteUrl, pageAlternates } from "@/lib/site";

export const metadata: Metadata = {
  title: "Клининг Рейтинг — найдите решение любой задачи чистоты",
  description:
    "Пятно на диване, офис после корпоратива или выбор химии — одна строка поиска. Пошаговые решения, честный рейтинг клининговых компаний и бренды для профи в Беларуси.",
  alternates: pageAlternates("/"),
};

export default async function Home() {
  const [companies, solutions, estimates, editorialAd] = await Promise.all([
    getAllCompanies(),
    getAllSolutions(),
    getPriceEstimates(),
    // Единственный коммерческий блок главной — ниже полезного контента, не в hero.
    // null → секция не рендерится вовсе (ни отступа, ни пустой рамки).
    getEligibleAd("home.editorial_partner", {}),
  ]);

  const published = solutions.filter((s) => s.status === "published");
  // Протокол дня — тот же, что hero показывает по умолчанию (первый доступный выбор диагностики).
  const featuredSolution = resolveSelection(solutions, {}).solution ?? published[0] ?? null;

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

          {/* Живая лента задач — единственный marquee на странице */}
          <TaskTicker solutions={published} estimates={estimates} />

          <div className="container space-y-20 py-14 sm:space-y-24 sm:py-20">
            <Reveal>
              <SolutionShelves solutions={solutions} estimates={estimates} />
            </Reveal>

            <Reveal>
              <PriceTable solutions={solutions} estimates={estimates} />
            </Reveal>

            <Reveal>
              <TwoPathsSection solution={featuredSolution} companies={companies} />
            </Reveal>

            {/* Партнёр сезона (реклама): помеченный слот, не влияет на органику */}
            {editorialAd && (
              <Reveal>
                <AdCreative ad={editorialAd} />
              </Reveal>
            )}

            {/* Принципы — компактная полоса */}
            <Reveal>
              <section
                aria-label="Принципы"
                className="data-surface flex flex-wrap items-center gap-x-8 gap-y-3 rounded-panel p-5 sm:p-6"
              >
                <ShieldCheck className="size-6 shrink-0 text-link" aria-hidden />
                <p className="min-w-0 flex-1 basis-72 text-[15px] leading-relaxed text-foreground">
                  Платный охват возможен, покупка оценки нет: размещение маркируется «Реклама» и не меняет порядок
                  рейтинга. Контакт с компанией прямой, без лид-форм и комиссии платформы.
                </p>
                <Link
                  href="/rating"
                  className="inline-flex min-h-11 items-center gap-1 text-sm font-semibold text-link"
                >
                  Как считаем рейтинг
                  <ArrowRight className="size-4" aria-hidden />
                </Link>
              </section>
            </Reveal>

            {/* B2B */}
            <Reveal>
              <section className="relative overflow-hidden rounded-panel bg-cta p-7 text-cta-foreground sm:p-12">
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
                      Разместите безопасные составы прямо в пошаговых решениях по поверхностям или подтвердите профиль
                      клининговой компании с прямым телефоном.
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-3">
                    <Link
                      href="/for-brands"
                      className="inline-flex min-h-12 items-center gap-2 rounded-full bg-brand px-6 text-sm font-semibold text-brand-foreground transition-transform active:scale-[0.98]"
                    >
                      Интеграция для брендов
                      <ArrowRight className="size-4" aria-hidden />
                    </Link>
                    <Link
                      href="/for-partners"
                      className="inline-flex min-h-12 items-center gap-2 rounded-full border border-cta-foreground/25 bg-cta-foreground/10 px-6 text-sm font-semibold text-cta-foreground transition-colors hover:bg-cta-foreground/15 active:scale-[0.98]"
                    >
                      Тарифы для клининга
                    </Link>
                  </div>
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
