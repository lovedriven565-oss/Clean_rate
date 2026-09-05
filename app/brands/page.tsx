"use client";

import { useMemo, useState } from "react";
import { Boxes } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { BrandCard } from "@/components/brands/BrandCard";
import { cn } from "@/lib/utils";
import { brands } from "@/lib/mock-data";
import { focusLabels } from "@/lib/brand-utils";
import type { BrandFocus } from "@/lib/types";

const filters: Array<{ key: BrandFocus | "all"; label: string }> = [
  { key: "all", label: "Все бренды" },
  { key: "technika", label: focusLabels.technika },
  { key: "himiya", label: focusLabels.himiya },
  { key: "inventory", label: focusLabels.inventory },
];

export default function BrandsPage() {
  const [active, setActive] = useState<BrandFocus | "all">("all");

  const filtered = useMemo(
    () => (active === "all" ? brands : brands.filter((b) => b.focus === active)),
    [active]
  );

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />

      <main className="flex-1">
        <section className="bg-fresh relative overflow-hidden border-b border-border">
          <div
            aria-hidden
            className="pointer-events-none absolute -left-24 -top-24 h-96 w-96 rounded-full bg-primary/15 blur-3xl"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -right-24 top-10 h-96 w-96 rounded-full bg-accent/15 blur-3xl"
          />
          <div aria-hidden className="bubble left-[12%] top-16 h-12 w-12" />
          <div aria-hidden className="bubble right-[15%] bottom-12 h-9 w-9 [animation-delay:2.5s]" />

          <div className="container relative flex flex-col items-center gap-4 py-16 text-center sm:py-24">
            <span className="glass inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-medium text-muted-foreground">
              <Boxes className="h-4 w-4 text-primary" />
              Техника, химия и инвентарь для клининга
            </span>
            <h1 className="max-w-2xl font-display text-3xl font-extrabold tracking-tight text-foreground sm:text-5xl">
              Бренды, которым доверяют{" "}
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                профессионалы
              </span>
            </h1>
            <p className="max-w-xl text-muted-foreground">
              Оборудование и химия, которыми реально пользуются лучшие клининговые компании из рейтинга.
              Промокоды и ссылки на официальных дилеров в Беларуси.
            </p>
          </div>
        </section>

        <section className="border-b border-border bg-card/60">
          <div className="container flex flex-wrap items-center justify-center gap-2 py-5">
            {filters.map((f) => (
              <button
                key={f.key}
                onClick={() => setActive(f.key)}
                className={cn(
                  "rounded-full border px-4 py-1.5 text-sm font-medium transition-colors",
                  active === f.key
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-card text-muted-foreground hover:text-foreground"
                )}
              >
                {f.label}
              </button>
            ))}
          </div>
        </section>

        <section className="container py-16">
          <div className="grid grid-cols-1 gap-5 sm:auto-rows-[1fr] sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((brand, i) => (
              <BrandCard key={brand.id} brand={brand} size={i === 0 ? "lg" : "sm"} />
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
