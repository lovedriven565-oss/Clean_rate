import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronDown, Hand, ShieldAlert, Sparkles } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { ShareButton } from "@/components/ShareButton";
import { AdPlacement } from "@/components/ads/AdPlacement";
import { DiyPanel } from "@/components/solution/DiyPanel";
import { ProPanel } from "@/components/solution/ProPanel";
import { SolutionCard } from "@/components/solution/SolutionCard";
import {
  getAllBrands,
  getAllCompanies,
  getAllSolutions,
  getPriceEstimates,
  getSolutionBySlug,
  getSolutionSlugs,
} from "@/lib/db/queries";
import { absoluteUrl, pageAlternates } from "@/lib/site";
import {
  AUDIENCE_LABELS,
  PROBLEM_TYPE_LABELS,
  SEVERITY_LABELS,
  SURFACE_LABELS,
  relatedSolutions,
  solutionSummary,
} from "@/lib/solutions/meta";
import { buildSolutionFaq, buildSolutionJsonLd, serializeJsonLd } from "@/lib/solutions/structured-data";

export async function generateStaticParams() {
  const slugs = await getSolutionSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const solution = await getSolutionBySlug(slug);
  if (!solution) return {};
  const url = absoluteUrl(`/solutions/${solution.slug}`);
  const title = `${solution.title}: убрать самому или вызвать мастера`;
  const description = `${solutionSummary(solution, 120)} Пошаговый протокол, чего нельзя делать, и смета мастера в вашем городе.`;
  return {
    title,
    description,
    alternates: pageAlternates(`/solutions/${solution.slug}`),
    openGraph: { title, description, url, type: "article" },
  };
}

export default async function SolutionPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const solution = await getSolutionBySlug(slug);
  if (!solution) notFound();

  const [allSolutions, companies, brands, estimates] = await Promise.all([
    getAllSolutions(),
    getAllCompanies(),
    getAllBrands(),
    getPriceEstimates({ solutionId: solution.id }),
  ]);

  const related = relatedSolutions(solution, allSolutions);
  const faq = buildSolutionFaq(solution, estimates);
  const url = absoluteUrl(`/solutions/${solution.slug}`);
  const jsonLd = buildSolutionJsonLd(solution, url, faq, [
    { name: "Главная", url: absoluteUrl("/") },
    { name: "Решения", url: absoluteUrl("/solutions") },
    { name: solution.title, url },
  ]);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />

      {/* Десктопная якорная навигация — заметна при скролле длинного решения, дублирует мобильный переключатель */}
      <div className="sticky top-17 z-30 hidden border-b border-border bg-card/90 backdrop-blur lg:block">
        <div className="container flex items-center gap-1 py-2 text-sm">
          <a href="#diy" className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
            <Hand className="h-3.5 w-3.5" />
            Сделать самому
          </a>
          <a href="#pro" className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
            <Sparkles className="h-3.5 w-3.5" />
            Вызвать мастера
          </a>
          <a href="#faq" className="rounded-full px-3 py-1.5 font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
            Вопросы
          </a>
          {related.length > 0 && (
            <a href="#related" className="rounded-full px-3 py-1.5 font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
              Похожие
            </a>
          )}
        </div>
      </div>

      <main className="flex-1">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(jsonLd) }} />

        {/* Hero */}
        <section className="bg-fresh relative overflow-hidden border-b border-border">
          <div className="container relative py-10 sm:py-16">
            <Breadcrumbs
              items={[
                { label: "Главная", href: "/" },
                { label: "Решения", href: "/solutions" },
                { label: PROBLEM_TYPE_LABELS[solution.problemType], href: `/solutions?type=${solution.problemType}` },
                { label: solution.title },
              ]}
            />

            <div className="mt-6 flex flex-wrap items-center gap-1.5 text-[11px] font-semibold">
              <span className="rounded-full bg-primary/10 px-2.5 py-1 text-primary">{SURFACE_LABELS[solution.surface]}</span>
              {solution.material && <span className="rounded-full bg-card/80 px-2.5 py-1 text-muted-foreground">{solution.material}</span>}
              <span className="rounded-full bg-card/80 px-2.5 py-1 text-muted-foreground">{SEVERITY_LABELS[solution.severity]}</span>
              <span className="rounded-full bg-card/80 px-2.5 py-1 text-muted-foreground">{AUDIENCE_LABELS[solution.audience]}</span>
            </div>

            <h1 className="mt-5 max-w-4xl font-display text-3xl font-bold leading-[1.08] tracking-[-0.04em] text-foreground sm:text-5xl">
              {solution.title}
            </h1>

            <div className="mt-4">
              <ShareButton url={url} title={solution.title} text={`${solution.title} — протокол «два пути»`} />
            </div>

            <div className="mt-6 flex max-w-3xl gap-3 rounded-panel border border-border bg-card/80 p-4 text-sm leading-6 text-muted-foreground backdrop-blur">
              <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-star" />
              <p>
                Протокол проверен на типовых материалах, но реакция конкретной обивки или покрытия может отличаться.
                Тестируйте средство на незаметном участке. Действуя по протоколу, вы принимаете риск на себя:
                площадка не отвечает за результат. Если сомневаетесь, начните со второго пути.
              </p>
            </div>

            {/* Mobile path switcher */}
            <div className="mt-6 grid grid-cols-2 gap-2 lg:hidden">
              <a
                href="#diy"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-full border border-border bg-card text-sm font-semibold text-foreground"
              >
                <Hand className="h-4 w-4 text-primary" />
                Сделать самому
              </a>
              <a
                href="#pro"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-primary text-sm font-semibold text-primary-foreground"
              >
                <Sparkles className="h-4 w-4" />
                Вызвать мастера
              </a>
            </div>
          </div>
        </section>

        {/* Two paths */}
        <section className="container py-10 sm:py-14">
          <div className="grid gap-6 lg:grid-cols-2 lg:items-start">
            <DiyPanel solution={solution} brands={brands} />
            <ProPanel solution={solution} companies={companies} estimates={estimates} />
          </div>

          {/* Спонсорский состав — строго после независимого протокола; рендерится на сервере (CLS=0),
              при отсутствии допущенной кампании слот отсутствует в HTML целиком */}
          <AdPlacement
            placement="solution.sponsored_product"
            context={{ solutionSlug: solution.slug, surface: solution.surface, categoryId: solution.relatedCategory }}
            className="mt-6"
          />
        </section>

        {/* FAQ */}
        <section id="faq" className="scroll-mt-32 border-y border-border bg-muted/35 py-14 sm:py-20">
          <div className="container grid gap-8 lg:grid-cols-[0.8fr_1.2fr]">
            <div>
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-primary">Частые вопросы</span>
              <h2 className="mt-3 font-display text-2xl font-bold tracking-[-0.03em] text-foreground sm:text-3xl">
                Коротко о главном
              </h2>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">
                Ответы собраны из протокола выше, без маркетинга и невыполнимых обещаний.
              </p>
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

        {/* Related */}
        {related.length > 0 && (
          <section id="related" className="container scroll-mt-32 py-14 sm:py-20">
            <div className="mb-8 flex items-end justify-between gap-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-[0.2em] text-primary">Похожие задачи</span>
                <h2 className="mt-3 font-display text-2xl font-bold tracking-[-0.03em] text-foreground sm:text-3xl">
                  Ещё решения
                </h2>
              </div>
              <Link href="/solutions" className="text-sm font-semibold text-primary">
                Все решения
              </Link>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((item) => (
                <SolutionCard key={item.id} solution={item} />
              ))}
            </div>
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
}
