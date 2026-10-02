import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, ChevronDown, ShieldCheck } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { ShareButton } from "@/components/ShareButton";
import { CompanyListItem } from "@/components/CompanyListItem";
import { SolutionCard } from "@/components/solution/SolutionCard";
import { AdCreative } from "@/components/ads/AdCreative";
import { getEligibleAd } from "@/lib/ads/queries";
import { getAllCompanies, getAllSolutions, getPriceEstimates } from "@/lib/db/queries";
import { LANDING_INDEX_MIN_COMPANIES, landingStaticParams, pickLandingCompanies, resolveLandingParams } from "@/lib/landing";
import { formatMarketCurrency, pluralize } from "@/lib/format";
import { absoluteUrl, pageAlternates, SITE_NAME } from "@/lib/site";
import type { PriceEstimate } from "@/lib/types";

/**
 * Посадочная «услуга × город» (/minsk/himchistka-mebeli): органический список компаний,
 * ориентир цены из смет платформы, связанные протоколы. Страница индексируется только
 * при наличии ≥2 компаний — тонкие страницы получают noindex и не попадают в sitemap.
 */
export const dynamicParams = false;

export function generateStaticParams() {
  return landingStaticParams();
}

type Params = { city: string; category: string };

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { city, category } = await params;
  const resolved = resolveLandingParams(city, category);
  if (!resolved) return {};
  const companies = await getAllCompanies();
  const { organic, sponsors } = pickLandingCompanies(companies, resolved.city.name, resolved.category.id);
  const indexable = organic.length + sponsors.length >= LANDING_INDEX_MIN_COMPANIES;
  const title = `${resolved.category.name} в ${resolved.city.nameIn}: цены и компании`;
  return {
    title,
    description: `${resolved.category.name} в ${resolved.city.nameIn}: проверенные компании с прямыми контактами, ориентир цены и открытый источник оценки. ${SITE_NAME}.`,
    alternates: pageAlternates(`/${city}/${category}`),
    robots: indexable ? undefined : { index: false, follow: true },
  };
}

function categoryFaq(cityNameIn: string, categoryName: string, estimate?: PriceEstimate) {
  return [
    {
      question: `Сколько стоит «${categoryName.toLowerCase()}» в ${cityNameIn}?`,
      answer: estimate
        ? `По сметам платформы ориентир — от ${estimate.priceMin} до ${estimate.priceMax} ${estimate.currency} за ${estimate.unit}. Итоговая цена зависит от объёма и состояния объекта, точную смету даст компания после осмотра.`
        : "Точную смету даст компания после уточнения объёма и состояния объекта — оценка при звонке бесплатна.",
    },
    {
      question: "Как связаться с компанией?",
      answer: "Напрямую: телефон и Telegram у каждой компании в карточке. Платформа не берёт комиссию и не передаёт ваши данные посредникам.",
    },
    {
      question: "Откуда берётся оценка компаний?",
      answer: "Органический балл считается по опубликованным отзывам из открытых источников и не зависит от оплаты. Платные размещения помечаются отдельно.",
    },
  ];
}

export default async function CategoryCityPage({ params }: { params: Promise<Params> }) {
  const raw = await params;
  const resolved = resolveLandingParams(raw.city, raw.category);
  if (!resolved) notFound();
  const { market, city, category } = resolved;

  const [companies, solutions, estimates, categoryAd] = await Promise.all([
    getAllCompanies(),
    getAllSolutions(),
    getPriceEstimates({ categoryId: category.id, countryCode: market.countryCode }),
    getEligibleAd("rating.category_partner", { categoryId: category.id }),
  ]);

  const { organic, sponsors } = pickLandingCompanies(companies, city.name, category.id);
  const related = solutions.filter((s) => s.relatedCategory === category.id).slice(0, 3);
  const estimate = estimates.find((e) => e.city === city.name) ?? estimates[0];
  const faq = categoryFaq(city.nameIn, category.name, estimate);
  const url = absoluteUrl(`/${city.slug}/${raw.category}`);

  const minPrice = organic
    .map((c) => c.priceFrom)
    .filter((p): p is number => p !== undefined)
    .sort((a, b) => a - b)[0];

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "ItemList",
        name: `${category.name} в ${city.nameIn}`,
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
          { "@type": "ListItem", position: 3, name: `${category.name} в ${city.nameIn}`, item: url },
        ],
      },
    ],
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />
      <main className="flex-1">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
        />

        <section className="bg-fresh relative overflow-hidden border-b border-border">
          <div className="container relative py-12 sm:py-16">
            <Breadcrumbs
              items={[
                { label: "Главная", href: "/" },
                { label: "Рейтинг компаний", href: "/rating" },
                { label: `${category.name} · ${city.name}` },
              ]}
            />
            <h1 className="mt-6 max-w-3xl font-display text-4xl font-bold leading-[1.05] tracking-[-0.04em] text-foreground sm:text-5xl">
              {category.name} в {city.nameIn}
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
              {organic.length + sponsors.length > 0
                ? `${pluralize(organic.length + sponsors.length, ["компания", "компании", "компаний"])} с прямыми контактами — без посредников и комиссии. Порядок списка считается по открытым отзывам, реклама помечена отдельно.`
                : `В ${city.nameIn} компании этой категории ещё подключаются к платформе.`}
            </p>
            {(estimate || minPrice !== undefined) && (
              <div className="mt-6 flex max-w-2xl flex-wrap items-center gap-3 rounded-panel border border-border bg-card/80 p-4 text-sm backdrop-blur">
                <ShieldCheck className="h-5 w-5 shrink-0 text-primary" />
                <span className="text-muted-foreground">
                  {estimate
                    ? `Ориентир по сметам платформы: ${formatMarketCurrency(estimate.priceMin, market)}–${formatMarketCurrency(estimate.priceMax, market)} за ${estimate.unit}.`
                    : `Цены компаний начинаются от ${formatMarketCurrency(minPrice!, market)}.`}{" "}
                  Данные компаний, не прайс платформы.
                </span>
              </div>
            )}
            <div className="mt-4">
              <ShareButton url={`/${city.slug}/${raw.category}`} title={`${category.name} в ${city.nameIn}`} />
            </div>
          </div>
        </section>

        <section className="container py-10 sm:py-14">
          {categoryAd && <AdCreative ad={categoryAd} className="mb-6" />}

          {organic.length > 0 ? (
            <div className="flex flex-col gap-4">
              {organic.map((company, index) => (
                <CompanyListItem key={company.id} company={company} index={index} rank={index + 1} />
              ))}
            </div>
          ) : (
            <div className="rounded-panel border border-dashed border-border bg-card/60 p-8 text-sm leading-6 text-muted-foreground">
              Пока здесь нет компаний. Если вы оказываете «{category.name.toLowerCase()}» в {city.nameIn},{" "}
              <Link href="/for-partners" className="font-semibold text-primary">разместите компанию</Link> — базовый профиль бесплатен.
            </div>
          )}

          {sponsors.length > 0 && (
            <div className="mt-6">
              <span className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                Рекламное размещение — не участвует в рейтинге
              </span>
              <div className="flex flex-col gap-4">
                {sponsors.map((company, index) => (
                  <CompanyListItem key={company.id} company={company} index={index} />
                ))}
              </div>
            </div>
          )}

          <div className="mt-8">
            <Link
              href={`/rating?category=${category.id}`}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-full border border-border bg-card px-5 text-sm font-semibold text-foreground transition-colors hover:border-primary/40"
            >
              Весь рейтинг по категории
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </section>

        {related.length > 0 && (
          <section className="border-t border-border bg-muted/35 py-14 sm:py-18">
            <div className="container">
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
                {related.map((solution) => (
                  <SolutionCard key={solution.id} solution={solution} />
                ))}
              </div>
            </div>
          </section>
        )}

        <section className="container py-14 sm:py-18">
          <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr]">
            <div>
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-primary">Частые вопросы</span>
              <h2 className="mt-3 font-display text-2xl font-bold tracking-[-0.03em] text-foreground sm:text-3xl">
                {category.name} в {city.nameIn}
              </h2>
            </div>
            <div className="divide-y divide-border rounded-panel border border-border bg-card">
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
