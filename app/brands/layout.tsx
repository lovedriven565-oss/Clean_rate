import type { Metadata } from "next";
import { pageAlternates, pageSocialMeta } from "@/lib/site";

const title = "Бренды техники и химии для клининга";
const description =
  "Kärcher, Kiehl, Prochem, Ecolab, Grass и другие бренды профессиональной чистоты: продукты, дилеры и компании, которые ими работают.";

export const metadata: Metadata = {
  title,
  description,
  alternates: pageAlternates("/brands"),
  ...pageSocialMeta("/brands", title, description),
};

export default function BrandsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
