import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BadgeCheck, Boxes, MapPin, PackageSearch, Wrench } from "lucide-react";
import { Footer } from "@/components/Footer";
import { Navbar } from "@/components/Navbar";
import { brands } from "@/lib/mock-data";

export const metadata: Metadata = {
  title: "Поставщики оборудования и химии | Клининг Рейтинг",
  description: "Формирующийся каталог производителей, импортёров, дилеров и сервисных центров индустрии чистоты.",
};

const supplierTypes = [
  { icon: Boxes, title: "Оборудование", text: "Поломоечные машины, экстракторы, пылесосы и комплектующие." },
  { icon: PackageSearch, title: "Химия и расходники", text: "Профессиональные составы, системы дозирования, инвентарь и СИЗ." },
  { icon: Wrench, title: "Сервис и обучение", text: "Демонстрации, ремонт, запасные части и обучение персонала." },
];

export default function SuppliersPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />
      <main className="flex-1">
        <section className="bg-fresh relative overflow-hidden border-b border-border">
          <div className="container relative py-16 sm:py-24">
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-primary">Каталог формируется</span>
            <h1 className="mt-4 max-w-4xl font-display text-4xl font-bold tracking-[-0.05em] text-foreground sm:text-6xl">
              Поставщики и сервис индустрии чистоты
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-muted-foreground">
              Здесь появятся подтверждённые импортёры, дилеры и сервисные центры с географией, брендами и прямыми контактами.
              До верификации мы не публикуем статус официального дилера.
            </p>
          </div>
        </section>

        <section className="container py-16 sm:py-24">
          <div className="grid gap-5 lg:grid-cols-3">
            {supplierTypes.map((type) => (
              <article key={type.title} className="data-surface rounded-panel border border-border p-7">
                <span className="flex h-11 w-11 items-center justify-center rounded-control bg-primary/10 text-primary"><type.icon className="h-5 w-5" /></span>
                <h2 className="mt-7 font-display text-xl font-bold text-foreground">{type.title}</h2>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">{type.text}</p>
              </article>
            ))}
          </div>

          <div className="mt-10 grid gap-6 rounded-panel border border-border bg-card p-8 sm:p-12 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <BadgeCheck className="h-7 w-7 text-primary" />
              <h2 className="mt-5 font-display text-3xl font-bold tracking-[-0.04em] text-foreground">Представляете поставщика?</h2>
              <p className="mt-3 max-w-2xl text-muted-foreground">Подайте данные для проверки: регионы работы, представляемые бренды, сервис и контакты.</p>
            </div>
            <Link href="/for-brands" className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-primary px-6 text-sm font-semibold text-primary-foreground">
              Подать профиль
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </section>

        <section className="border-t border-border bg-muted/35 py-16">
          <div className="container">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <span className="text-xs font-bold uppercase tracking-[0.2em] text-primary">Связанный раздел</span>
                <h2 className="mt-3 font-display text-3xl font-bold text-foreground">Бренды в каталоге</h2>
              </div>
              <Link href="/brands" className="inline-flex items-center gap-2 text-sm font-semibold text-primary">Все бренды <ArrowRight className="h-4 w-4" /></Link>
            </div>
            <div className="mt-8 flex flex-wrap gap-3">
              {brands.map((brand) => (
                <Link key={brand.id} href={`/brands/${brand.slug}`} className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm font-semibold text-foreground hover:border-primary/30">
                  <span className="h-2 w-2 rounded-full" style={{ backgroundColor: brand.accent }} />
                  {brand.name}
                </Link>
              ))}
            </div>
            <p className="mt-6 flex items-center gap-2 text-xs text-muted-foreground"><MapPin className="h-3.5 w-3.5" /> География и дилерский статус появятся только после подтверждения.</p>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
