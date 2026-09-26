import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/primitives";
import { DataValue } from "@/components/ui/DataValue";
import { Panel } from "@/components/ui/Panel";
import { PhScale } from "@/components/ui/PhScale";
import { Skeleton } from "@/components/ui/Skeleton";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { SurfaceMatrix } from "@/components/ui/SurfaceMatrix";
import { seedProducts } from "@/db/seed-data";

export const metadata: Metadata = { title: "Дизайн-система", robots: { index: false, follow: false } };

const MATRIX_SURFACES = ["upholstery", "carpet", "floor", "marble", "wool", "kitchen"];

/** Витрина компонентов «Clinical Future» для проверки в обеих темах. Только в dev. */
export default function DesignSystemPage() {
  if (process.env.NODE_ENV === "production") notFound();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container space-y-12 py-12">
        <h1 className="font-display text-4xl font-bold tracking-tight text-foreground">Clinical Future</h1>

        <section className="grid gap-4 md:grid-cols-3">
          <Panel className="p-6">
            <DataValue label="Карточка" value="12" unit="протоколов" />
          </Panel>
          <Panel variant="instrument" className="p-6">
            <DataValue label="Прибор" value="87.4" unit="/100" size="lg" />
          </Panel>
          <Panel variant="glass" className="p-6">
            <DataValue label="Стекло (ИИ)" value="35" unit="BYN/м²" />
          </Panel>
        </section>

        <section className="grid gap-6 lg:grid-cols-2">
          {seedProducts
            .filter((p) => p.ph !== undefined)
            .map((product) => (
              <Panel key={product.id} variant="instrument" className="space-y-5 p-6">
                <PhScale ph={product.ph!} caption={product.name} surface={product.prohibitedSurfaces?.includes("marble") ? "marble" : undefined} />
                <SurfaceMatrix product={product} surfaces={MATRIX_SURFACES} />
              </Panel>
            ))}
        </section>

        <section className="flex flex-wrap items-center gap-3">
          <Button>Спросить</Button>
          <Button variant="outline">Найти</Button>
          <Button variant="ghost">Отмена</Button>
          <StatusBadge variant="verified" />
          <StatusBadge variant="sponsor" />
          <StatusBadge variant="prosChoice" />
          <StatusBadge variant="testWinner" />
        </section>

        <Panel className="space-y-3 p-6">
          <Skeleton className="h-5 w-2/3" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
        </Panel>
      </main>
    </div>
  );
}
