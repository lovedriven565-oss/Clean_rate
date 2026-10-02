import { notFound } from "next/navigation";
import type { Metadata } from "next";
import EditorialDemo from "@/components/dev/EditorialDemo";

export const metadata: Metadata = {
  title: "Прототип B — Редакционный навигатор",
  robots: { index: false, follow: false },
};

export default function DesignVariantB() {
  if (process.env.NODE_ENV === "production") notFound();
  return <EditorialDemo />;
}
