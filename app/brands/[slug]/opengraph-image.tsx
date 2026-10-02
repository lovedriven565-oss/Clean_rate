import { getBrandSlugs, getBrandsByScore } from "@/lib/db/queries";
import { OG_CONTENT_TYPE, OG_SIZE, renderOgCard } from "@/lib/og/template";

export const alt = "Бренд — Клининг Рейтинг";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const dynamicParams = false;

export async function generateStaticParams() {
  const slugs = await getBrandSlugs();
  return slugs.map((slug) => ({ slug }));
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const brand = (await getBrandsByScore()).find((b) => b.slug === slug);
  if (!brand) {
    return renderOgCard({ title: "Бренд для профи" });
  }
  return renderOgCard({
    eyebrow: "Бренд для профи",
    title: brand.name,
    subtitle: brand.tagline,
    metric: { value: String(brand.metrics.score), label: "индекс доверия профи" },
  });
}
