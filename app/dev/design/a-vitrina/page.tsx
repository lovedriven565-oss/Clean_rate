import { notFound } from "next/navigation";
import type { Metadata } from "next";
import VitrinaDemo from "@/components/dev/VitrinaDemo";
import { getFallbackSolutions } from "@/lib/db/fallback";

export const metadata: Metadata = {
  title: "Прототип A — Предметная витрина",
  robots: { index: false, follow: false },
};

export default function DesignVariantA() {
  // Guard до получения данных: в production маршрут отдаёт 404 до любой работы.
  if (process.env.NODE_ENV === "production") notFound();
  // Локальный образец опубликованных решений — без D1/API/аналитики.
  const solutions = getFallbackSolutions();
  return <VitrinaDemo solutions={solutions} />;
}
