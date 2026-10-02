import { getPriceEstimates, getSolutionBySlug, getSolutionSlugs } from "@/lib/db/queries";
import { OG_CONTENT_TYPE, OG_SIZE, renderOgCard } from "@/lib/og/template";
import { SURFACE_LABELS } from "@/lib/solutions/meta";

export const alt = "Протокол решения — Клининг Рейтинг";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const dynamicParams = false;

export async function generateStaticParams() {
  const slugs = await getSolutionSlugs();
  return slugs.map((slug) => ({ slug }));
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const solution = await getSolutionBySlug(slug);
  if (!solution) {
    return renderOgCard({ title: "Решение задачи чистоты" });
  }
  const estimates = await getPriceEstimates({ solutionId: solution.id, countryCode: "BY" });
  const estimate = estimates[0];
  return renderOgCard({
    eyebrow: `Решение · ${SURFACE_LABELS[solution.surface]}`,
    title: solution.title,
    subtitle: "Пошаговый протокол: убрать самому или вызвать мастера",
    metric: estimate
      ? { value: `${estimate.priceMin}–${estimate.priceMax} ${estimate.currency === "BYN" ? "Br" : estimate.currency}`, label: `смета мастера за ${estimate.unit}` }
      : undefined,
  });
}
