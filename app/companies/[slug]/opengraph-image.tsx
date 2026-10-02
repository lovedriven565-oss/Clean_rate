import { getCompanyBySlug, getCompanySlugs } from "@/lib/db/queries";
import { OG_CONTENT_TYPE, OG_SIZE, renderOgCard } from "@/lib/og/template";
import { calculateOrganicScore } from "@/lib/rating";

export const alt = "Компания — Клининг Рейтинг";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const dynamicParams = false;

export async function generateStaticParams() {
  const slugs = await getCompanySlugs();
  return slugs.map((slug) => ({ slug }));
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const company = await getCompanyBySlug(slug);
  if (!company) {
    return renderOgCard({ title: "Клининговая компания" });
  }
  const score = calculateOrganicScore(company);
  return renderOgCard({
    eyebrow: `Компания · ${company.city}`,
    title: company.name,
    subtitle: "Прямые контакты и открытый источник оценки",
    metric: score !== null ? { value: String(Math.round(score)), label: "органический балл из 100" } : undefined,
  });
}
