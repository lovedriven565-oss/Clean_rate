import type { Metadata } from "next";
import { pageAlternates } from "@/lib/site";

export const metadata: Metadata = {
  title: "Бренды техники и химии для клининга",
  description:
    "Kärcher, Kiehl, Prochem, Ecolab, Grass и другие бренды профессиональной чистоты: продукты, дилеры и компании, которые ими работают.",
  alternates: pageAlternates("/brands"),
};

export default function BrandsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
