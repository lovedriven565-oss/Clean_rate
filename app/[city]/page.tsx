import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, ChevronDown, ShieldCheck } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { ShareButton } from "@/components/ShareButton";
import { CompanyTable } from "@/components/CompanyTable";
import { SolutionCard } from "@/components/solution/SolutionCard";
import { getAllCompanies, getAllSolutions, getPriceEstimates } from "@/lib/db/queries";
import {
  cityStaticParams,
  getIndexableCities,
  getIndexableLandingCitySlugs,
  pickLandingCompanies,
  resolveCityParams,
} from "@/lib/landing";
import { CATEGORIES, getCategorySlug } from "@/lib/categories";
import { pickCategoryEstimate } from "@/lib/home/cleaning-services";
import { calculateRelevanceScore } from "@/lib/rating";
import { formatMarketCurrency, pluralize } from "@/lib/format";
import { serializeJsonLd } from "@/lib/solutions/structured-data";
import { absoluteUrl, cityAlternates, pageSocialMeta, SITE_NAME } from "@/lib/site";
import type { Company, PriceEstimate } from "@/lib/types";

/**
 * Городской хаб `/{city}` (/minsk, /moscow, /almaty): все услуги города,
 * органический и спонсорский список компаний, сметы и FAQ. Индексируется
 * только при достаточном числе компаний города — иначе noindex, follow.
 */
// dynamicParams не отключаем: кеш-мисс в OpenNext не должен падать с NoFallbackError,
// невалидные города закрывает resolveCityParams → notFound().

export function generateStaticParams() {
  return cityStaticParams();
}

type Params = { city: string };

function cityFaq(cityNameIn: string, companiesCount: number, estimates: PriceEstimate[], market: { countryCode: string }) {
  const minEstimate = estimates.reduce<PriceEstimate | undefined>(
    (acc, e) => (!acc || e.priceMin < acc.priceMin ? e : acc),
    undefined
  );
  const priceNote = minEstimate
    ? `По сметам платформы в ${market.countryCode === "RU" ? "Москве" : market.countryCode === "KZ" ? "Алматы" : "Минске"} ориентир начинается примерно от ${minEstimate.priceMin} ${minEstimate.currency} за ${minEstimate.unit}; итог зависит от объекта.`
    : "Точную смету даст компания после осмотра или уточнения объёма работ.";
  return [
    {
      question: `Сколько клининговых компаний представлено в ${cityNameIn}?`,
      answer: companiesCount > 0
        ? `Сейчас на платформе ${pluralize(companiesCount, ["компания", "компании", "компаний"])} в ${cityNameIn}. Список разделён на органический рейтинг и отдельно помеченные рекламные размещения.`
        : `В ${cityNameIn} компании ещё подключаются к платформе.`,
    },
    {
      question: `Какие услуги клининга есть в ${cityNameIn}?`,
      answer: "Уборка квартир и домов, офисов и ТЦ, химчистка мебели, мытьё окон, клининг после ремонта и генеральная уборка.",
    },
    {
      question: `Сколько стоит клининг в ${cityNameIn}?`,
      answer: priceNote,
    },
    {
      question: "Как не перепутать рейтинг и рекламу?",
      answer: "Органические места считаются по открытым отзывам и не покупаются. Блоки «Рекламное размещение» помечены отдельно и не получают места в рейтинге.",
    },
  ];
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { city } = await params;
  const resolved = resolveCityParams(city);
  if (!resolved) return {};
  const companies = await getAllCompanies();
  const indexableCities = getIndexableCities(companies);
  const indexable = indexableCities.some((c) => c.city === city);
  const title = `Клининговые компании в ${resolved.city.nameIn}: рейтинг, цены и услуги`;
  const description = `Рейтинг клининговых компаний в ${resolved.city.nameIn}: уборка квартир, офисов, химчистка мебели, мытьё окон и клининг после ремонта. Цены, контакты и открытая методология ${SITE_NAME}.`;
  return {
    title,
    description,
    alternates: cityAlternates(city, undefined, {
      includeCitySlugs: new Set(indexableCities.map((c) => c.city)),
    }),
    ...pageSocialMeta(`/${city}`, title, description),
    robots: indexable ? undefined : { index: false, follow: true },
  };
}

export default async function CityHubPage({ params }: { params: Promise<Params> }) {
  const { city } = await params;
  const resolved = resolveCityParams(city);
  if (!resolved) notFound();
  const { market, city: cityInfo } = resolved;

  const [companies, solutions, estimates] = await Promise.all([
    getAllCompanies(),
    getAllSolutions(),
    getPriceEstimates({ countryCode: market.countryCode }),
  ]);

  const cityCompanies = companies.filter((c) => c.city === cityInfo.name);
  const sorted = [...cityCompanies].sort((a, b) => calculateRelevanceScore(b) - calculateRelevanceScore(a));
  // Для RU платные размещения без erid не показываются — все идут в органику.
  const { organic, sponsors } =
    market.countryCode === "RU"
      ? { organic: sorted.map((c) => (c.promoted ? { ...c, promoted: false } : c)), sponsors: [] as Company[] }
      : (() => {
          const promoted = sorted.filter((c) => c.promoted).slice(0, 3);
          const overflow = sorted.filter((c) => c.promoted).slice(3).map((c) => ({ ...c, promoted: false }));
          return {
            sponsors: promoted,
            organic: [...sorted.filter((c) => !c.promoted), ...overflow],
          };
        })();

  const indexableByCategory = new Map(
    CATEGORIES.map((c) => [c.id, getIndexableLandingCitySlugs(companies, c.id)])
  );
  const serviceCards = CATEGORIES.map((category) => {
    const categoryCompanies = cityCompanies.filter((c) => c.categories.includes(category.id));
    const estimate = pickCategoryEstimate(estimates, category.id, { countryCode: market.countryCode, city: cityInfo.name });
    return {
      category,
      count: categoryCompanies.length,
      estimate,
      indexable: indexableByCategory.get(category.id)?.has(cityInfo.slug) ?? false,
    };
  });

  const relatedSolutions = solutions.filter((s) => s.status === "published").slice(0, 6);
  const faq = cityFaq(cityInfo.nameIn, cityCompanies.length, estimates, market);
  const url = absoluteUrl(`/${cityInfo.slug}`);

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "ItemList",
        name: `Клининговые компании в ${cityInfo.nameIn}`,
        itemListElement: organic.map((company, i) => ({
          "@type": "ListItem",
          position: i + 1,
          url: absoluteUrl(`/companies/${company.slug}`),
          name: company.name,
        })),
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Главная", item: absoluteUrl("/") },
          { "@type": "ListItem", position: 2, name: "Рейтинг компаний", item: absoluteUrl("/rating") },
          { "@type": "ListItem", position: 3, name: cityInfo.nameIn, item: url },
        ],
      },
      {
        "@type": "FAQPage",
        mainEntity: faq.map((item) => ({
          "@type": "Question",
          name: item.question,
          acceptedAnswer: { "@type": "Answer", text: item.answer },
        })),
      },
    ],
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />
      <main id="content" className="flex-1">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: serializeJsonLd(jsonLd) }}
        />

        <section className="bg-fresh relative overflow-hidden border-b border-border">
          <div className="container relative py-12 sm:py-16">
            <Breadcrumbs
              items={[
                { label: "Главная", href: "/" },
                { label: "Рейтинг компаний", href: "/rating" },
                { label: cityInfo.nameIn },
              ]}
            />
            <h1 className="mt-6 max-w-3xl font-display text-4xl font-bold leading-[1.05] tracking-[-0.04em] text-foreground sm:text-5xl">
              Клининговые компании в {cityInfo.nameIn}
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
              {cityCompanies.length > 0
                ? `${pluralize(cityCompanies.length, ["компания", "компании", "компаний"])} с прямыми контактами: уборка квартир, офисов, химчистка мебели, мытьё окон и клининг после ремонта. Рейтинг считается по открытым отзывам, реклама помечена отдельно.`
                : `В ${cityInfo.nameIn} компании ещё подключаются к платформе. Ниже — услуги и ориентиры цен, которые уже работают в других городах.`}
            </p>
            <div className="mt-4">
              <ShareButton url={`/${cityInfo.slug}`} title={`Клининговые компании в ${cityInfo.nameIn}`} />
            </div>
          </div>
        </section>

        <section className="container py-10 sm:py-14">
          <div className="mb-8">
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-primary">Услуги в городе</span>
            <h2 className="mt-3 font-display text-2xl font-bold tracking-[-0.03em] text-foreground sm:text-3xl">
              Выберите задачу
            </h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {serviceCards.map(({ category, count, estimate, indexable }) => {
              const href = indexable ? `/${cityInfo.slug}/${getCategorySlug(category.id)}` : `/rating?category=${category.id}`;
              return (
                <Link
                  key={category.id}
                  href={href}
                  className="group rounded-panel border border-border bg-card p-5 transition-colors hover:border-primary/40"
                >
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="font-display text-lg font-bold text-foreground group-hover:text-primary">{category.name}</h3>
                    <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {count > 0
                      ? `${pluralize(count, ["компания", "компании", "компаний"])} в городе`
                      : "Компании подключаются"}
                    {estimate ? ` · от ${formatMarketCurrency(estimate.priceMin, market)}` : ""}
                  </p>
                </Link>
              );
            })}
          </div>
        </section>

        <section className="border-t border-border bg-muted/35 py-10 sm:py-14">
          <div className="container">
            {sponsors.length > 0 && (
              <div className="mb-6">
                <span className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                  Рекламное размещение — не участвует в рейтинге
                </span>
                <CompanyTable companies={sponsors} ranked={false} placement="city.hub_sponsors" />
              </div>
            )}
            {organic.length > 0 ? (
              <CompanyTable companies={organic} placement="city.hub_table" />
            ) : (
              <div className="rounded-panel border border-dashed border-border bg-card/60 p-8 text-sm leading-6 text-muted-foreground">
                Пока здесь нет компаний. Если вы оказываете клининговые услуги в {cityInfo.nameIn},{" "}
                <Link href="/for-partners" className="font-semibold text-primary">разместите компанию</Link> — базовый профиль бесплатен.
              </div>
            )}
          </div>
        </section>

        {relatedSolutions.length > 0 && (
          <section className="container py-14 sm:py-18">
            <div className="mb-8 flex items-end justify-between gap-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-[0.2em] text-primary">Протоколы</span>
                <h2 className="mt-3 font-display text-2xl font-bold tracking-[-0.03em] text-foreground sm:text-3xl">
                  Сначала можно попробовать самому
                </h2>
              </div>
              <Link href="/solutions" className="text-sm font-semibold text-primary">Все решения</Link>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {relatedSolutions.map((solution) => (
                <SolutionCard key={solution.id} solution={solution} />
              ))}
            </div>
          </section>
        )}

        <section className="container pb-14 sm:pb-18">
          <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr]">
            <div>
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-primary">Частые вопросы</span>
              <h2 className="mt-3 font-display text-2xl font-bold tracking-[-0.03em] text-foreground sm:text-3xl">
                Клининг в {cityInfo.nameIn}
              </h2>
              <div className="mt-4 flex items-start gap-3 rounded-panel border border-border bg-card p-4 text-sm leading-6 text-muted-foreground">
                <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                <p>Оценка компаний считается по открытым отзывам. Платные размещения помечены отдельно и не влияют на порядок.</p>
              </div>
            </div>
            <div className="divide-y divide-border data-surface rounded-panel">
              {faq.map((item) => (
                <details key={item.question} className="group px-5 sm:px-6">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-4 text-[15px] font-semibold text-foreground [&::-webkit-details-marker]:hidden">
                    {item.question}
                    <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-open:rotate-180" />
                  </summary>
                  <p className="pb-5 text-sm leading-6 text-muted-foreground">{item.answer}</p>
                </details>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
