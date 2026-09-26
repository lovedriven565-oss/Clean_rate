import Link from "next/link";
import { ArrowRight, Boxes, Briefcase, Hand, ShieldCheck, Sparkles } from "lucide-react";
import { CompanyAvatar } from "@/components/CompanyAvatar";
import type { Company, Solution } from "@/lib/types";

/**
 * Bento-сетка «Два пути»: большой светлый блок с реальным протоколом, тёмный блок с компаниями,
 * два компактных входа для бизнеса и профи. Разная тональность вместо одинаковых карточек.
 */
export function TwoPathsBento({ featured, companies }: { featured: Solution | undefined; companies: Company[] }) {
  const avatars = companies.slice(0, 4);

  return (
    <div className="grid gap-4 lg:grid-cols-12">
      {/* Путь 1: сделать самому */}
      <Link
        href={featured ? `/solutions/${featured.slug}` : "/solutions"}
        className="group relative flex flex-col overflow-hidden rounded-[2rem] border border-border bg-card p-7 transition-colors hover:border-primary/30 sm:p-9 lg:col-span-7"
      >
        <span className="inline-flex items-center gap-2 text-xs font-semibold text-primary">
          <Hand className="h-4 w-4" />
          Сделать самому
        </span>
        <h3 className="mt-4 max-w-md font-display text-2xl font-bold tracking-[-0.03em] text-foreground sm:text-3xl">
          {featured ? featured.title : "Пошаговые протоколы для дома"}
        </h3>

        {featured && (
          <ol className="mt-8 grid gap-5 sm:grid-cols-3">
            {featured.diySteps.slice(0, 3).map((step) => (
              <li key={step.order}>
                <span className="font-display text-5xl font-extrabold leading-none tracking-[-0.05em] text-muted">
                  0{step.order}
                </span>
                <p className="mt-3 line-clamp-3 text-sm leading-6 text-muted-foreground">{step.instruction}</p>
              </li>
            ))}
          </ol>
        )}

        <span className="mt-auto inline-flex items-center gap-2 pt-8 text-sm font-semibold text-foreground">
          Открыть протокол
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </span>
      </Link>

      {/* Путь 2: вызвать мастера */}
      <Link
        href="/rating"
        className="group relative flex flex-col overflow-hidden rounded-[2rem] bg-contrast p-7 text-contrast-foreground sm:p-9 lg:col-span-5"
      >
        <span className="inline-flex items-center gap-2 text-xs font-semibold text-primary">
          <Sparkles className="h-4 w-4" />
          Вызвать мастера
        </span>
        <h3 className="mt-4 font-display text-2xl font-bold tracking-[-0.03em] sm:text-3xl">
          Компании вашего города с открытым источником оценки
        </h3>
        <p className="mt-3 text-sm leading-6 text-contrast-foreground/75">
          Телефон и Telegram напрямую: платформа не берёт комиссию и не продаёт места в рейтинге.
        </p>

        <div className="mt-8 flex items-center gap-3">
          <div className="flex -space-x-3">
            {avatars.map((company) => (
              <CompanyAvatar
                key={company.id}
                id={company.id}
                name={company.name}
                size="md"
                className="rounded-full ring-2 ring-contrast"
              />
            ))}
          </div>
          <span className="inline-flex items-center gap-1.5 text-xs text-contrast-foreground/80">
            <ShieldCheck className="h-3.5 w-3.5 text-primary" />
            {companies.length} компаний в каталоге
          </span>
        </div>

        <span className="mt-auto inline-flex items-center gap-2 pt-8 text-sm font-semibold">
          Открыть рейтинг
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </span>
      </Link>

      {/* Для бизнеса */}
      <Link
        href="/rating?intent=b2b&category=offices"
        className="group flex items-start gap-4 rounded-[1.5rem] bg-muted/60 p-6 transition-colors hover:bg-muted lg:col-span-6"
      >
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-card text-primary">
          <Briefcase className="h-5 w-5" />
        </span>
        <span className="min-w-0">
          <span className="block font-display text-lg font-bold text-foreground">Офис, ТЦ, производство</span>
          <span className="mt-1 block text-sm leading-6 text-muted-foreground">
            Подрядчики для регулярного и срочного клининга, безнал и договор.
          </span>
        </span>
        <ArrowRight className="ml-auto mt-1 h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-primary" />
      </Link>

      {/* Для профи */}
      <Link
        href="/brands"
        className="group flex items-start gap-4 rounded-[1.5rem] bg-muted/60 p-6 transition-colors hover:bg-muted lg:col-span-6"
      >
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-card text-primary">
          <Boxes className="h-5 w-5" />
        </span>
        <span className="min-w-0">
          <span className="block font-display text-lg font-bold text-foreground">Химия и техника для профи</span>
          <span className="mt-1 block text-sm leading-6 text-muted-foreground">
            Бренды с подтверждёнными сценариями применения: от Kärcher до Kiehl.
          </span>
        </span>
        <ArrowRight className="ml-auto mt-1 h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-primary" />
      </Link>
    </div>
  );
}
