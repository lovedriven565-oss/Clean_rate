import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, BriefcaseBusiness, Check, ExternalLink, MapPin, Navigation, ShieldCheck, Star } from "lucide-react";
import { CompanyAvatar } from "@/components/CompanyAvatar";
import { CompanyContactActions } from "@/components/CompanyContactActions";
import { CompanyEquipmentTags } from "@/components/CompanyEquipmentTags";
import { Footer } from "@/components/Footer";
import { Navbar } from "@/components/Navbar";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { StickyCallBar } from "@/components/StickyCallBar";
import { Badge } from "@/components/ui/primitives";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { getAllBrands, getAllCategories, getCompanyBySlug, getCompanySlugs } from "@/lib/db/queries";
import { calculateOrganicScore, hasPublishedRating, ratingSourceLabel } from "@/lib/rating";
import { formatNumber, formatPriceFrom, formatRating } from "@/lib/format";
import { pageAlternates } from "@/lib/site";

export async function generateStaticParams() {
  const slugs = await getCompanySlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const company = await getCompanyBySlug(slug);
  if (!company) return {};
  return {
    title: `${company.name} — услуги, контакты и рейтинг`,
    description: company.description,
    alternates: pageAlternates(`/companies/${company.slug}`),
  };
}

export default async function CompanyPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const company = await getCompanyBySlug(slug);
  if (!company) notFound();

  const [allBrands, allCategories] = await Promise.all([getAllBrands(), getAllCategories()]);

  const organicScore = calculateOrganicScore(company);
  const publishedRating = hasPublishedRating(company);
  const companyCategories = company.categories
    .map((id) => allCategories.find((category) => category.id === id))
    .filter((category): category is (typeof allCategories)[number] => Boolean(category));
  const companyBrands = (company.equipment ?? [])
    .map((id) => allBrands.find((brand) => brand.id === id))
    .filter((brand): brand is (typeof allBrands)[number] => Boolean(brand));
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: company.name,
    description: company.description,
    address: company.address ? { "@type": "PostalAddress", addressLocality: company.city, streetAddress: company.address } : undefined,
    telephone: company.phone,
    url: company.websiteUrl,
    aggregateRating: publishedRating
      ? { "@type": "AggregateRating", ratingValue: company.baseRating, reviewCount: company.reviewCount, bestRating: 5 }
      : undefined,
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />
      <main className="flex-1">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, "\\u003c") }}
        />
        <section className="bg-fresh relative overflow-hidden border-b border-border">
          <div className="bg-grid-fade absolute inset-0" aria-hidden />
          <div className="container relative py-12 sm:py-18">
            <Breadcrumbs items={[{ label: "Главная", href: "/" }, { label: "Рейтинг компаний", href: "/rating" }, { label: company.name }]} />
            <Link href="/rating" className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-primary">
              <ArrowLeft className="h-4 w-4" />
              Все компании
            </Link>
            <div className="mt-9 grid gap-8 lg:grid-cols-[1fr_300px] lg:items-end">
              <div>
                <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
                  <CompanyAvatar id={company.id} name={company.name} size="xl" className="h-28 w-28 rounded-[1.75rem]" />
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      {company.verified && <StatusBadge variant="verified" size="md" label="Профиль проверен" />}
                      {company.promoted && <StatusBadge variant="sponsor" size="md" />}
                    </div>
                    <h1 className="mt-3 font-display text-4xl font-extrabold tracking-[-0.04em] text-foreground sm:text-6xl">
                      {company.name}
                    </h1>
                    <span className="mt-3 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4 text-primary" />
                      {company.address ? `${company.city}, ${company.address}` : company.city}
                      <a
                        href={`https://yandex.by/maps/?text=${encodeURIComponent(
                          company.address ? `${company.city}, ${company.address}` : company.city
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
                      >
                        <Navigation className="h-3.5 w-3.5" />
                        Маршрут
                      </a>
                    </span>
                  </div>
                </div>
                <p className="mt-7 max-w-3xl text-base leading-7 text-muted-foreground sm:text-lg">{company.description}</p>
                <div className="mt-7">
                  <CompanyContactActions company={company} />
                </div>
              </div>

              <aside className="data-surface rounded-[1.75rem] border border-border p-6">
                <span className="text-xs font-bold uppercase tracking-[0.18em] text-primary">Органический балл</span>
                <div className="mt-3 flex items-end gap-2">
                  <strong className="font-display text-5xl font-extrabold text-foreground">{organicScore ?? "—"}</strong>
                  {organicScore !== null && <span className="pb-1.5 text-sm text-muted-foreground">из 100</span>}
                </div>
                {publishedRating ? (
                  <div className="mt-4 flex items-center gap-2 text-sm">
                    <Star className="h-4 w-4 fill-star text-star" />
                    <strong>{formatRating(company.baseRating)}</strong>
                    <span className="text-muted-foreground">· {formatNumber(company.reviewCount)} отзывов</span>
                  </div>
                ) : (
                  <p className="mt-4 text-sm leading-6 text-muted-foreground">Оценка появится после публикации проверяемого источника отзывов.</p>
                )}
                <div className="mt-5 border-t border-border pt-4 text-xs text-muted-foreground">
                  Источник: <span className="font-semibold text-foreground">{ratingSourceLabel(company.ratingSource)}</span>
                </div>
                <Link href="/rating/methodology" className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-primary">
                  Методология
                  <ExternalLink className="h-3.5 w-3.5" />
                </Link>
              </aside>
            </div>
          </div>
        </section>

        <section className="container grid gap-6 py-14 lg:grid-cols-[1fr_340px] lg:py-20">
          <div className="space-y-6">
            <article className="rounded-[1.75rem] border border-border bg-card p-7 sm:p-9">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary"><BriefcaseBusiness className="h-5 w-5" /></span>
                <h2 className="font-display text-2xl font-bold text-foreground">Услуги и специализация</h2>
              </div>
              <div className="mt-6 flex flex-wrap gap-2">
                {companyCategories.map((category) => (
                  <Link key={category.id} href={`/rating?category=${category.id}`}>
                    <Badge className="px-3 py-1.5 text-xs text-foreground hover:border-primary/30">{category.name}</Badge>
                  </Link>
                ))}
              </div>
              {company.tags.length > 0 && (
                <ul className="mt-7 grid gap-3 sm:grid-cols-2">
                  {company.tags.map((tag) => (
                    <li key={tag} className="flex items-start gap-2 text-sm text-foreground">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                      {tag}
                    </li>
                  ))}
                </ul>
              )}
            </article>

            <article className="rounded-[1.75rem] border border-border bg-card p-7 sm:p-9">
              <h2 className="font-display text-2xl font-bold text-foreground">Техника и профессиональные решения</h2>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">
                Связи публикуются только как данные профиля и требуют подтверждения представителем компании.
              </p>
              <div className="mt-6">
                {companyBrands.length > 0 ? (
                  <CompanyEquipmentTags brands={companyBrands} />
                ) : (
                  <p className="text-sm text-muted-foreground">Используемые бренды пока не указаны.</p>
                )}
              </div>
            </article>

            {company.recentReview && publishedRating && (
              <article className="data-surface rounded-[1.75rem] border border-border p-7 sm:p-9">
                <span className="text-xs font-bold uppercase tracking-[0.18em] text-primary">Отзыв в профиле</span>
                <blockquote className="mt-4 font-display text-xl leading-8 text-foreground">“{company.recentReview.text}”</blockquote>
                <p className="mt-5 text-sm font-semibold text-muted-foreground">{company.recentReview.author}</p>
              </article>
            )}
          </div>

          <aside className="space-y-5">
            <div className="rounded-[1.5rem] border border-border bg-card p-6">
              <h2 className="font-display text-lg font-bold text-foreground">Основные условия</h2>
              <dl className="mt-5 space-y-4 text-sm">
                <div className="flex items-center justify-between gap-4 border-b border-border pb-4">
                  <dt className="text-muted-foreground">Стоимость</dt>
                  <dd className="font-semibold text-foreground">
                    {company.priceFrom !== undefined ? `от ${formatPriceFrom(company.priceFrom, company.priceUnit)}` : "По запросу"}
                  </dd>
                </div>
                <div className="flex items-center justify-between gap-4 border-b border-border pb-4">
                  <dt className="text-muted-foreground">Опыт</dt>
                  <dd className="font-semibold text-foreground">{company.experienceYears ? `${company.experienceYears} лет` : "Не указан"}</dd>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <dt className="text-muted-foreground">Категорий</dt>
                  <dd className="font-semibold text-foreground">{company.categories.length}</dd>
                </div>
              </dl>
            </div>

            <div className="rounded-[1.5rem] bg-contrast p-6 text-contrast-foreground">
              <ShieldCheck className="h-6 w-6 text-primary" />
              <h2 className="mt-5 font-display text-xl font-bold">Вы представитель компании?</h2>
              <p className="mt-3 text-sm leading-6 text-contrast-foreground/70">Подтвердите профиль, исправьте данные и добавьте доказательства компетенций.</p>
              <Link href={`/for-partners?company=${company.slug}`} className="mt-6 inline-flex h-11 items-center justify-center rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground">
                Подтвердить профиль
              </Link>
            </div>
          </aside>
        </section>
      </main>
      <Footer />
      <StickyCallBar
        label={company.name}
        phone={company.phone}
        telegramUrl={company.telegramUrl}
        companyId={company.id}
        categoryId={company.categories[0]}
        showAfter={320}
      />
    </div>
  );
}
