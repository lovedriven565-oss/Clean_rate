import { getAllCompanies } from "@/lib/db/queries";
import { landingStaticParams, pickLandingCompanies, resolveLandingParams } from "@/lib/landing";
import { OG_CONTENT_TYPE, OG_SIZE, renderOgCard } from "@/lib/og/template";
import { pluralize } from "@/lib/format";

export const alt = "Услуга по городу — Клининг Рейтинг";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const dynamicParams = false;

export function generateStaticParams() {
  return landingStaticParams();
}

export default async function Image({ params }: { params: Promise<{ city: string; category: string }> }) {
  const { city, category } = await params;
  const resolved = resolveLandingParams(city, category);
  if (!resolved) {
    return renderOgCard({ title: "Клининговые услуги" });
  }
  const companies = await getAllCompanies();
  const { organic, sponsors } = pickLandingCompanies(companies, resolved.city.name, resolved.category.id);
  const count = organic.length + sponsors.length;
  return renderOgCard({
    eyebrow: `${resolved.city.name} · прямые контакты`,
    title: `${resolved.category.name} в ${resolved.city.nameIn}`,
    subtitle: "Компании без посредников и комиссии",
    metric: count > 0 ? { value: String(count), label: pluralize(count, ["компания", "компании", "компаний"]).split(" ")[1] } : undefined,
  });
}
