import { notFound } from "next/navigation";
import type { Metadata } from "next";
import ShowcaseDemo from "@/components/dev-c/ShowcaseDemo";
import {
  getFallbackBrands,
  getFallbackCompanies,
  getFallbackPriceEstimates,
  getFallbackSolutions,
} from "@/lib/db/fallback";

export const metadata: Metadata = {
  title: "Прототип C — Витрина",
  robots: { index: false, follow: false },
};

export default function DesignVariantC() {
  if (process.env.NODE_ENV === "production") notFound();
  return (
    <ShowcaseDemo
      solutions={getFallbackSolutions()}
      companies={getFallbackCompanies()}
      estimates={getFallbackPriceEstimates({ countryCode: "BY" })}
      brands={getFallbackBrands()}
    />
  );
}
