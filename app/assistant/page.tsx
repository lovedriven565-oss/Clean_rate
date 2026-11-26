import type { Metadata } from "next";
import { Suspense } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { AssistantPanel } from "@/components/assistant/AssistantPanel";
import {
  getAllBrands,
  getAllCompanies,
  getAllSolutions,
  getPriceEstimates,
} from "@/lib/db/queries";
import { absoluteUrl, pageAlternates, pageSocialMeta } from "@/lib/site";

const title = "ИИ-технолог и консультант по чистке";
const description =
  "Опишите пятно, поверхность или запах — технолог ChistoLab подберёт проверенный протокол: что сделать в первые минуты, чего делать нельзя, безопасная химия с pH и смета мастеров вашего города.";

export const metadata: Metadata = {
  title,
  description,
  alternates: pageAlternates("/assistant"),
  ...pageSocialMeta("/assistant", title, description),
};

export default async function AssistantPage() {
  const [companies, brands, estimates, solutions] = await Promise.all([
    getAllCompanies(),
    getAllBrands(),
    getPriceEstimates(),
    getAllSolutions(),
  ]);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />
      <main id="content" className="flex-1">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "BreadcrumbList",
              itemListElement: [
                { "@type": "ListItem", position: 1, name: "Главная", item: absoluteUrl("/") },
                { "@type": "ListItem", position: 2, name: "ИИ-консультант", item: absoluteUrl("/assistant") },
              ],
            }).replace(/</g, "\\u003c"),
          }}
        />
        <div className="mx-auto w-full max-w-4xl px-4 py-10 sm:px-6 sm:py-14">
          <Breadcrumbs items={[{ label: "Главная", href: "/" }, { label: "ИИ-консультант" }]} />
          <header className="mt-6 max-w-2xl">
            <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-teal">
              Два пути решения · Проверенные протоколы
            </span>
            <h1 className="mt-2 font-display text-3xl font-bold tracking-[-0.03em] text-foreground sm:text-4xl">
              ИИ-технолог по чистке
            </h1>
            <p className="mt-3 text-sm leading-6 text-muted-foreground sm:text-base">
              Отвечает строго по технологическим картам ChistoLab без бытовых мифов:
              пошаговый план спасения покрытия дома, проверка безопасности pH и честная смета с мастерами вашего города, если нужен экстрактор.
            </p>
          </header>
          <Suspense>
            <AssistantPanel
              companies={companies}
              brands={brands}
              estimates={estimates}
              solutions={solutions}
            />
          </Suspense>
        </div>
      </main>
      <Footer />
    </div>
  );
}
