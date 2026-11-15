import { getAllCompanies } from "@/lib/db/queries";
import { cityStaticParams, getIndexableCities, resolveCityParams } from "@/lib/landing";
import { OG_CONTENT_TYPE, OG_SIZE, renderOgCard } from "@/lib/og/template";
import { pluralize } from "@/lib/format";
import { SITE_NAME } from "@/lib/site";

export const alt = `Клининговые компании по городу — ${SITE_NAME}`;
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const dynamicParams = true;

export function generateStaticParams() {
  return cityStaticParams();
}

export default async function Image({ params }: { params: Promise<{ city: string }> }) {
  const { city } = await params;
  const resolved = resolveCityParams(city);
  if (!resolved) {
    return renderOgCard({ title: "Клининговые компании" });
  }
  const companies = await getAllCompanies();
  const count = companies.filter((c) => c.city === resolved.city.name).length;
  return renderOgCard({
    eyebrow: `${resolved.city.nameIn} · рейтинг и цены`,
    title: `Клининговые компании в ${resolved.city.nameIn}`,
    subtitle: "Уборка квартир, офисов, химчистка мебели — прямые контакты без комиссии",
    metric:
      count > 0 && getIndexableCities(companies).some((c) => c.city === resolved.city.slug)
        ? { value: String(count), label: pluralize(count, ["компания", "компании", "компаний"]).split(" ")[1] }
        : undefined,
  });
}
