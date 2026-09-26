import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, MapPinned, Network, ShieldCheck } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { CompanyListItem } from "@/components/CompanyListItem";
import { MarketBadge } from "@/components/MarketBadge";
import { SmartSearch } from "@/components/SmartSearch";
import { SolutionCard } from "@/components/solution/SolutionCard";
import { BrandsStrip } from "@/components/home/BrandsStrip";
import { CategoryPills } from "@/components/home/CategoryPills";
import { HeroDiagnostic } from "@/components/home/HeroDiagnostic";
import { HowItWorks } from "@/components/home/HowItWorks";
import { HomeMotion, Reveal } from "@/components/home/Reveal";
import { TaskTicker } from "@/components/home/TaskTicker";
import { TwoPathsBento } from "@/components/home/TwoPathsBento";
import { AdCreative } from "@/components/ads/AdCreative";
import { getEligibleAd } from "@/lib/ads/queries";
import { getAllBrands, getAllCategories, getAllCompanies, getAllSolutions, getPriceEstimates } from "@/lib/db/queries";
import { SITE_NAME, SITE_URL, absoluteUrl, pageAlternates } from "@/lib/site";

export const metadata: Metadata = {
  title: "Клининг Рейтинг — найдите решение любой задачи чистоты",
  description:
    "Пятно на диване, офис после корпоратива или выбор химии — одна строка поиска. Пошаговые решения, честный рейтинг клининговых компаний и бренды для профи в Беларуси.",
  alternates: pageAlternates("/"),
};

const manifesto = [
  { icon: ShieldCheck, text: "Оценку нельзя купить: партнёрское размещение маркируется и не меняет балл." },
  { icon: Network, text: "Контакт напрямую: звонок или Telegram идут компании, без лид-форм и комиссии." },
  { icon: MapPinned, text: "Каждый протокол честно говорит, где заканчивается «сам» и начинается «мастер»." },
];

export default async function Home() {
  const [companies, brands, categories, solutions, estimates, editorialAd] = await Promise.all([
    getAllCompanies(),
    getAllBrands(),
    getAllCategories(),
    getAllSolutions(),
    getPriceEstimates(),
    // Единственный коммерческий блок главной — ниже полезного контента, не в hero.
    // null → секция не рендерится вовсе (ни отступа, ни пустой рамки).
    getEligibleAd("home.editorial_partner", {}),
  ]);

  // Партнёры платформы (открытое платное размещение) показываются первыми, порядок остальных —
  // как в каталоге. Это не рейтинг по качеству — честный рейтинг по отзывам появится, когда
  // у компаний будут проверенные отзывы.
  const homeCompanies = [...companies].sort((a, b) => Number(b.promoted) - Number(a.promoted));
  const featuredSolution = solutions[0];
  const moreSolutions = solutions.slice(1, 4);

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

          {/* Hero */}
          <section className="relative overflow-hidden">
            <svg
              aria-hidden
              viewBox="0 0 800 600"
              className="pointer-events-none absolute -right-32 -top-40 h-[42rem] w-[42rem] opacity-[0.09] lg:-right-16"
            >
              <defs>
                <linearGradient id="hero-pour" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0" stopColor="hsl(var(--primary))" />
                  <stop offset="1" stopColor="hsl(var(--accent))" />
                </linearGradient>
              </defs>
              <path
                d="M420 20c120-30 260 40 320 160s20 250-90 320-260 60-360-20S110 250 180 150 300 50 420 20z"
                fill="url(#hero-pour)"
              />
            </svg>

            <div className="container relative grid items-start gap-12 py-14 sm:py-20 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16 lg:py-24">
              <div className="flex flex-col items-start">
                <MarketBadge />
                <h1 className="mt-7 max-w-2xl font-display text-[2.6rem] font-extrabold leading-[1.02] tracking-[-0.045em] text-foreground sm:text-6xl lg:text-[4.4rem]">
                  Пятно, запах, налёт?
                  <span className="mt-2 block text-muted-foreground">Покажем, как убрать или кого позвать.</span>
                </h1>
                <p className="mt-6 max-w-xl text-base leading-7 text-muted-foreground sm:text-lg">
                  Опишите задачу своими словами: получите пошаговый протокол, честную границу «звать мастера» и
                  проверенные компании города без посредников.
                </p>
                <div className="mt-8 w-full">
                  <SmartSearch />
                </div>
              </div>

              <div className="lg:pt-2">
                <HeroDiagnostic solutions={solutions} estimates={estimates} />
              </div>
            </div>
          </section>

          {/* Живая лента задач */}
          <TaskTicker solutions={solutions} estimates={estimates} />

          {/* Два пути */}
          <section className="container py-16 sm:py-24">
            <Reveal>
              <div className="mb-10 max-w-2xl">
                <span className="text-xs font-bold uppercase tracking-[0.2em] text-primary">Два пути</span>
                <h2 className="mt-3 font-display text-3xl font-bold tracking-[-0.035em] text-foreground sm:text-5xl">
                  Сначала понять задачу, затем решить её
                </h2>
              </div>
            </Reveal>
            <Reveal delay={0.08}>
              <TwoPathsBento featured={featuredSolution} companies={homeCompanies} />
            </Reveal>
          </section>

          {/* Как это работает */}
          <section className="border-y border-border bg-muted/35 py-16 sm:py-24">
            <div className="container">
              <Reveal>
                <div className="mb-12 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <h2 className="font-display text-3xl font-bold tracking-[-0.035em] text-foreground sm:text-4xl">
                      Три шага от вопроса до чистоты
                    </h2>
                  </div>
                  <Link href="/solutions" className="inline-flex shrink-0 items-center gap-2 text-sm font-semibold text-primary">
                    Все протоколы
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </Reveal>
              <Reveal delay={0.08}>
                <HowItWorks />
              </Reveal>
            </div>
          </section>

          {/* Ещё решения + категории */}
          <section className="container py-16 sm:py-24">
            <Reveal>
              <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <h2 className="font-display text-3xl font-bold tracking-[-0.035em] text-foreground sm:text-4xl">
                    Протоколы, которые открывают чаще всего
                  </h2>
                </div>
                <Link href="/solutions" className="inline-flex shrink-0 items-center gap-2 text-sm font-semibold text-primary">
                  Все решения
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </Reveal>
            <Reveal delay={0.08}>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {moreSolutions.map((solution) => (
                  <SolutionCard key={solution.id} solution={solution} />
                ))}
              </div>
            </Reveal>

            <Reveal delay={0.12} className="mt-14">
              <div className="mb-4 flex items-baseline justify-between gap-4">
                <h3 className="font-display text-lg font-bold text-foreground">Или сразу по услуге</h3>
                <Link href="/rating" className="text-sm font-semibold text-primary">
                  Все компании
                </Link>
              </div>
              <CategoryPills categories={categories} companies={companies} />
            </Reveal>
          </section>

          {/* Компании */}
          <section className="border-y border-border bg-card py-16 sm:py-24">
            <div className="container">
              <Reveal>
                <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-[0.2em] text-primary">Рейтинг</span>
                    <h2 className="mt-3 font-display text-3xl font-bold tracking-[-0.035em] text-foreground sm:text-4xl">
                      Компании с открытым источником оценки
                    </h2>
                    <p className="mt-3 max-w-2xl text-muted-foreground">
                      Мы показываем, откуда взят рейтинг. Партнёрское размещение отмечено и не влияет на органический балл.
                    </p>
                  </div>
                  <Link href="/rating" className="inline-flex shrink-0 items-center gap-2 text-sm font-semibold text-primary">
                    Открыть весь рейтинг
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </Reveal>
              <Reveal delay={0.08}>
                <div className="flex flex-col gap-4">
                  {homeCompanies.slice(0, 3).map((company, index) => (
                    <CompanyListItem key={company.id} company={company} index={index} rank={index + 1} />
                  ))}
                </div>
              </Reveal>
            </div>
          </section>

          {/* Бренды профи */}
          <section className="py-14 sm:py-20">
            <Reveal>
              <div className="container mb-6 text-center">
                <h3 className="font-display text-xl font-bold tracking-tight text-foreground sm:text-2xl">
                  Химия и техника, которыми работают профессионалы
                </h3>
              </div>
              <BrandsStrip brands={brands} />
            </Reveal>
          </section>

          {/* Партнёр сезона (реклама) */}
          {editorialAd && (
            <section className="container pb-16 sm:pb-24">
              <Reveal>
                <AdCreative ad={editorialAd} />
              </Reveal>
            </section>
          )}

          {/* Манифест */}
          <section className="container pb-16 sm:pb-24">
            <Reveal>
              <div className="grid gap-10 rounded-[2rem] border border-border bg-card p-8 sm:p-12 lg:grid-cols-[0.8fr_1.2fr] lg:p-16">
                <div>
                  <span className="text-xs font-bold uppercase tracking-[0.2em] text-primary">Принципы</span>
                  <h2 className="mt-3 font-display text-3xl font-bold tracking-[-0.035em] text-foreground sm:text-4xl">
                    Платный охват возможен. Покупка оценки — нет.
                  </h2>
                </div>
                <ul className="grid gap-6">
                  {manifesto.map((item) => (
                    <li key={item.text} className="flex gap-4 border-t border-border pt-6 first:border-t-0 first:pt-0">
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                        <item.icon className="h-5 w-5" />
                      </span>
                      <p className="font-display text-lg font-semibold leading-7 tracking-[-0.01em] text-foreground sm:text-xl">
                        {item.text}
                      </p>
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          </section>

          {/* B2B */}
          <section className="container pb-16 sm:pb-24">
            <Reveal>
              <div className="relative overflow-hidden rounded-[2rem] bg-contrast p-8 text-contrast-foreground sm:p-12 lg:p-16">
                <div className="relative grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
                  <div className="max-w-3xl">
                    <h2 className="font-display text-3xl font-bold tracking-[-0.04em] sm:text-5xl">
                      Вы клининговая компания или бренд? Займите место на карте рынка.
                    </h2>
                    <p className="mt-5 max-w-2xl text-contrast-foreground/75">
                      Подтвердите данные компании или обсудите пилотное размещение бренда с прозрачной аналитикой.
                    </p>
                  </div>
                  <Link
                    href="/for-partners"
                    className="inline-flex h-13 items-center justify-center gap-2 rounded-full bg-primary px-6 text-sm font-semibold text-primary-foreground transition-transform hover:-translate-y-0.5"
                  >
                    Разместить бизнес
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            </Reveal>
          </section>
        </main>

        <Footer />
      </div>
    </HomeMotion>
  );
}
