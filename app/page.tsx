import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Ban, PhoneCall, ShieldCheck, type LucideIcon } from "lucide-react";
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
  title: `${SITE_NAME} — найдите решение любой задачи чистоты`,
  description:
    "Пятно на диване, офис после корпоратива или выбор профессиональной химии — одна строка поиска. Пошаговые протоколы ChistoLab, честный рейтинг клининговых компаний и бренды для профи.",
  alternates: pageAlternates("/"),
};

const PRINCIPLES: { icon: LucideIcon; title: string; text: string }[] = [
  { icon: ShieldCheck, title: "Реклама отделена", text: "Спонсоры стоят отдельной помеченной полкой, место #1 всегда органическое." },
  { icon: PhoneCall, title: "Прямой контакт", text: "Телефон и Telegram компании без посредников и комиссии платформы." },
  { icon: Ban, title: "Сначала безопасность", text: "В каждом протоколе блок «Не делайте» с рисками для поверхности." },
];

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

            {/* Принципы — bento-манифест */}
            <Reveal>
              <section aria-labelledby="principles-title" className="relative isolate">
                <div
                  aria-hidden
                  className="pointer-events-none absolute -inset-x-4 -inset-y-8 -z-10 bg-[linear-gradient(to_right,hsl(var(--border)/0.7)_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--border)/0.7)_1px,transparent_1px)] bg-size-[40px_40px] mask-[radial-gradient(ellipse_at_center,black_30%,transparent_75%)]"
                />
                <div className="grid gap-4 lg:grid-cols-3 lg:grid-rows-3">
                  <div className="data-surface linear-beam flex flex-col justify-between gap-8 rounded-panel p-6 sm:p-8 lg:col-span-2 lg:row-span-3">
                    <div>
                      <p className="font-data text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                        Манифест {SITE_NAME}
                      </p>
                      <h2
                        id="principles-title"
                        className="mt-4 max-w-2xl text-balance font-display text-3xl font-bold leading-[1.08] tracking-[-0.035em] text-foreground sm:text-5xl"
                      >
                        Платный охват возможен. <span className="text-link">Покупка оценки — нет.</span>
                      </h2>
                      <p className="mt-5 max-w-xl text-[15px] leading-relaxed text-muted-foreground">
                        Размещение маркируется «Реклама» и не меняет порядок рейтинга. Контакт с компанией прямой, без
                        лид-форм и комиссии платформы.
                      </p>
                    </div>
                    <Link
                      href="/rating/methodology"
                      className="inline-flex min-h-11 items-center gap-1 self-start text-sm font-semibold text-link"
                    >
                      Как считаем рейтинг
                      <ArrowRight className="size-4" aria-hidden />
                    </Link>
                  </div>
                  {PRINCIPLES.map(({ icon: Icon, title, text }) => (
                    <div key={title} className="data-surface flex items-start gap-4 rounded-panel p-5">
                      <span className="flex size-10 shrink-0 items-center justify-center rounded-control bg-primary/10 text-link ring-1 ring-inset ring-primary/15">
                        <Icon className="size-5" aria-hidden />
                      </span>
                      <div className="min-w-0">
                        <h3 className="font-display text-base font-bold tracking-tight text-foreground">{title}</h3>
                        <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{text}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </Reveal>

            {/* B2B */}
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
