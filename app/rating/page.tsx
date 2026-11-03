import type { Metadata } from "next";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { RatingContent } from "@/components/RatingContent";
import { getEligibleAdsForCategories } from "@/lib/ads/queries";
import { getAllCategories, getAllCompanies } from "@/lib/db/queries";
import { absoluteUrl, pageAlternates } from "@/lib/site";

export const metadata: Metadata = {
  title: "Рейтинг клининговых компаний: цены, контакты, источник оценки",
  description:
    "Каталог клининговых компаний с открытым источником рейтинга, реальными ценами и прямыми контактами. Уборка квартир, офисов, химчистка мебели, мытьё окон, после ремонта.",
  alternates: pageAlternates("/rating"),
};

export default async function RatingPage() {
  const [companies, categories] = await Promise.all([getAllCompanies(), getAllCategories()]);

  // Категория выбирается на клиенте, поэтому партнёры категорий резолвятся на сервере пакетом:
  // клиент лишь выбирает карточку по активной категории — без fetch и без сдвига вёрстки.
  const categoryAds = await getEligibleAdsForCategories(
    "rating.category_partner",
    categories.map((c) => c.id)
  );

  // ItemList каталога: органический порядок как в рейтинге, без спонсорской полки.
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Рейтинг клининговых компаний",
    itemListElement: companies.slice(0, 50).map((company, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: absoluteUrl(`/companies/${company.slug}`),
      name: company.name,
    })),
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />
      <RatingContent companies={companies} categories={categories} categoryAds={categoryAds} />
      <Footer />
    </div>
  );
}
