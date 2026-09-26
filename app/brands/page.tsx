import Link from "next/link";
import { ArrowRight, Boxes } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { BrandLeaderboard } from "@/components/brands/BrandLeaderboard";
import { getBrandsByScore } from "@/lib/db/queries";

export default async function BrandsPage() {
  const brands = await getBrandsByScore();
  const verifiedLinks = brands.reduce((acc, b) => acc + b.metrics.verifiedCompanyCount, 0);
  const protocolLinks = brands.reduce((acc, b) => acc + b.metrics.recommendedCount + b.metrics.alternativeCount, 0);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />

      <main className="flex-1">
        <section className="bg-fresh relative overflow-hidden border-b border-border">
          <div className="container relative py-12 sm:py-18">
            <Breadcrumbs items={[{ label: "Главная", href: "/" }, { label: "Бренды" }]} />
            <span className="mt-4 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-primary">
              <Boxes className="h-3.5 w-3.5" />
              Индекс доверия профи
            </span>
            <div className="mt-3 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <h1 className="max-w-3xl font-display text-3xl font-bold tracking-[-0.04em] text-foreground sm:text-5xl">
                  Бренды, которыми реально работают профессионалы
                </h1>
                <p className="mt-4 max-w-2xl text-muted-foreground">
                  Не реклама, а данные: сколько верифицированных компаний используют бренд и в скольких протоколах он
                  рекомендован. Индекс нельзя купить — спонсорство помечается отдельно.
                </p>
              </div>
              <dl className="grid shrink-0 grid-cols-3 gap-6 text-sm">
                <Stat value={brands.length} label="брендов в индексе" />
                <Stat value={verifiedLinks} label="подтверждённых связей" />
                <Stat value={protocolLinks} label="упоминаний в протоколах" />
              </dl>
            </div>
          </div>
        </section>

        <section className="container py-10 sm:py-14">
          <BrandLeaderboard brands={brands} />
        </section>

        <section className="container pb-16 sm:pb-24">
          <div className="grid gap-6 rounded-panel bg-contrast p-8 text-contrast-foreground sm:p-12 lg:grid-cols-[1fr_auto] lg:items-end">
            <div className="max-w-2xl">
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-primary">Брендам</span>
              <h2 className="mt-3 font-display text-2xl font-bold tracking-[-0.03em] sm:text-4xl">
                Место в индексе не продаётся. Его зарабатывают компании, которые на вас работают.
              </h2>
              <p className="mt-4 text-sm leading-6 text-contrast-foreground/75">
                Подтвердите связи с компаниями, добавьте продукты в протоколы и поднимайтесь в лидерборде открыто.
              </p>
            </div>
            <Link
              href="/for-brands"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-primary px-6 text-sm font-semibold text-primary-foreground transition-transform hover:-translate-y-0.5"
            >
              Как попасть в индекс
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

function Stat({ value, label }: { value: number; label: string }) {
  return (
    <div>
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="mt-1 font-data text-3xl font-medium text-foreground">{value}</dd>
    </div>
  );
}
