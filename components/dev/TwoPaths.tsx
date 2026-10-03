"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowUpRight, Ban, Hand, Wallet, Wrench } from "lucide-react";
import { pluralize } from "@/lib/format";
import type { Brand, Company, PriceEstimate, Solution } from "@/lib/types";
import { cn } from "@/lib/utils";
import { CompanyRow } from "./CompanyRow";
import { DIAGNOSTIC_RISK_NOTE, buildProCompanies, formatEstimate, pickEstimate } from "./diagnostic-model";
import styles from "./Diagnostic.module.css";
import { EstimateCard } from "./EstimateCard";

const PRODUCT_ROLE_LABELS = { recommended: "Рекомендуем", alternative: "Альтернатива" } as const;

/** Состояние чекбоксов локальное: без localStorage, аналитики и событий. */
function DiyChecklist({ solution }: { solution: Solution }) {
  const [done, setDone] = useState<ReadonlySet<number>>(new Set());
  const steps = [...solution.diySteps].sort((a, b) => a.order - b.order);

  function toggle(order: number) {
    setDone((prev) => {
      const next = new Set(prev);
      if (next.has(order)) next.delete(order);
      else next.add(order);
      return next;
    });
  }

  return (
    <div>
      <p className="text-sm tabular-nums text-[hsl(var(--v-ink2))]" role="status" aria-live="polite" data-checklist-progress>
        Выполнено {done.size} из {steps.length}
      </p>
      <ol className="mt-2 space-y-2">
        {steps.map((step) => {
          const checked = done.has(step.order);
          return (
            <li key={step.order}>
              <label
                className={cn(
                  styles.raised,
                  "flex min-h-11 cursor-pointer items-start gap-3 p-3.5",
                  checked && "bg-[hsl(var(--v-tint))]",
                )}
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => toggle(step.order)}
                  className="mt-0.5 size-5 shrink-0 cursor-pointer accent-[hsl(var(--v-accent))]"
                />
                <span className="min-w-0">
                  <span
                    className={cn(
                      "block text-[15px] leading-relaxed [overflow-wrap:anywhere]",
                      checked && "text-[hsl(var(--v-ink2))] line-through decoration-[hsl(var(--v-ink2)/0.5)]",
                    )}
                  >
                    {step.instruction}
                  </span>
                  {step.tip && (
                    <span className="mt-1.5 block text-[13px] leading-snug text-[hsl(var(--v-ink2))] [overflow-wrap:anywhere]">
                      Подсказка: {step.tip}
                    </span>
                  )}
                </span>
              </label>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

function DiyPanel({ solution, brands }: { solution: Solution; brands: Brand[] }) {
  const products = [...(solution.recommendedProducts ?? [])].sort((a, b) => (a.role === b.role ? 0 : a.role === "recommended" ? -1 : 1));
  const brandOf = (id?: string) => brands.find((b) => b.id === id || b.slug === id);

  return (
    <section id="diy" aria-labelledby="diy-title" className="scroll-mt-24 min-w-0">
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
        <h3 id="diy-title" className="flex items-center gap-2 text-xl font-semibold tracking-tight">
          <Hand className="size-5 text-[hsl(var(--v-accent))]" aria-hidden="true" />
          Сделать самому
        </h3>
        {solution.diyCostNote && (
          <p className="inline-flex items-center gap-1.5 text-sm text-[hsl(var(--v-ink2))]">
            <Wallet className="size-4 shrink-0" aria-hidden="true" />
            {solution.diyCostNote}
          </p>
        )}
      </div>

      <div className={cn(styles.warn, "mt-4 p-4")} role="group" aria-label="Не делайте">
        <p className="flex items-center gap-2 text-sm font-semibold">
          <Ban className="size-4 shrink-0 text-[hsl(var(--v-ad))]" aria-hidden="true" />
          Не делайте
        </p>
        <ul className="mt-2 list-disc space-y-1.5 pl-5 text-[14px] leading-snug [overflow-wrap:anywhere]">
          {solution.warnings.map((warning) => (
            <li key={warning}>{warning}</li>
          ))}
        </ul>
      </div>

      <div className="mt-5">
        <DiyChecklist key={solution.slug} solution={solution} />
      </div>

      {products.length > 0 && (
        <div className="mt-6">
          <h4 className="text-sm font-semibold">Профессиональные средства</h4>
          <ul className="mt-2 grid gap-2 sm:grid-cols-2">
            {products.map((product) => {
              const brand = brandOf(product.brandId);
              const label = product.note ?? product.productName ?? brand?.name ?? "Средство";
              const body = (
                <>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-medium leading-snug [overflow-wrap:anywhere]">{label}</span>
                    <span className="mt-0.5 block text-xs text-[hsl(var(--v-ink2))]">
                      {PRODUCT_ROLE_LABELS[product.role]}
                      {brand ? `, ${brand.name}` : ""}
                    </span>
                  </span>
                  {brand && <ArrowUpRight className="size-4 shrink-0 text-[hsl(var(--v-ink2))]" aria-hidden="true" />}
                </>
              );
              const cls = cn(styles.raised, "flex min-h-11 items-center gap-3 p-3");
              return (
                <li key={product.id ?? label}>
                  {brand ? (
                    <Link href={`/brands/${brand.slug}`} className={cls}>
                      {body}
                    </Link>
                  ) : (
                    <div className={cls}>{body}</div>
                  )}
                </li>
              );
            })}
          </ul>
          <p className="mt-2 text-xs leading-snug text-[hsl(var(--v-ink2))]">
            Наличие и дилеров смотрите на странице бренда. Платформа не продаёт химию и не получает процент с этих ссылок.
          </p>
        </div>
      )}

      <p className="mt-6 text-xs leading-snug text-[hsl(var(--v-ink2))]">{DIAGNOSTIC_RISK_NOTE}</p>
    </section>
  );
}

function ProPanel({ solution, companies, estimates }: { solution: Solution; companies: Company[]; estimates: PriceEstimate[] }) {
  const { sponsor, organic } = buildProCompanies(companies, solution);
  const picked = pickEstimate(estimates, solution);

  return (
    <section
      id="pro"
      aria-labelledby="pro-title"
      className={cn(styles.panel, "scroll-mt-24 min-w-0 p-5 sm:p-6")}
    >
      <h3 id="pro-title" className="flex items-center gap-2 text-xl font-semibold tracking-tight">
        <Wrench className="size-5 text-[hsl(var(--v-accent))]" aria-hidden="true" />
        Вызвать мастера
      </h3>
      <p className="mt-3 text-[15px] leading-relaxed [overflow-wrap:anywhere]">{solution.whenToCallPro}</p>
      {solution.proTimeNote && (
        <p className="mt-2 text-sm text-[hsl(var(--v-ink2))]">Ориентир по времени: {solution.proTimeNote}</p>
      )}

      <div className="mt-4">
        <EstimateCard estimate={picked ? formatEstimate(picked) : null} size="lg" />
      </div>

      <h4 className="mt-6 text-sm font-semibold">Компании в Минске</h4>

      {sponsor && (
        <div className="mt-2" data-sponsor-slot>
          <p className="mb-1.5 text-xs leading-snug text-[hsl(var(--v-ink2))]">
            Спонсор показа. Платное размещение вне органического порядка ниже.
          </p>
          <ul>
            <CompanyRow company={sponsor} sponsor />
          </ul>
        </div>
      )}

      {organic.length > 0 ? (
        <div className="mt-4" data-organic-list>
          <p className="mb-1.5 text-xs leading-snug text-[hsl(var(--v-ink2))]">
            Органический порядок: проверенные профили и подтверждённые оценки Google или Яндекс. Оплата порядок не меняет.
          </p>
          <ol className="space-y-2" aria-label={`Компании, ${pluralize(organic.length, ["вариант", "варианта", "вариантов"])}`}>
            {organic.map((company) => (
              <CompanyRow key={company.id} company={company} />
            ))}
          </ol>
        </div>
      ) : (
        !sponsor && (
          <div className="mt-2 rounded-[var(--v-r-ctl)] border border-dashed border-[hsl(var(--v-line))] p-4 text-sm leading-snug text-[hsl(var(--v-ink2))]" data-pro-empty>
            В Минске пока нет проверенных компаний для этой задачи. Непроверенные профили мы не показываем.{" "}
            <Link href="/for-partners" className="font-semibold text-[hsl(var(--v-accent))] hover:underline">
              Разместить компанию
            </Link>
          </div>
        )
      )}

      <Link
        href="/rating"
        className="mt-3 inline-flex min-h-11 items-center gap-1 text-sm font-semibold whitespace-nowrap text-[hsl(var(--v-accent))] hover:underline"
      >
        Весь рейтинг компаний
        <ArrowUpRight className="size-4" aria-hidden="true" />
      </Link>

      <p className="mt-3 text-xs leading-snug text-[hsl(var(--v-ink2))]">
        Контакт прямой: платформа не берёт комиссию и не передаёт ваши данные. Цена ориентировочная, итог определяет компания.
      </p>
    </section>
  );
}

/**
 * Секция «Два пути» под hero (этап 1.6): полный чеклист и мастера Минска для
 * протокола, выбранного в диагностике. Асимметричный сплит: чеклист шире.
 */
export function TwoPaths({
  solution,
  companies,
  estimates,
  brands,
}: {
  solution: Solution | null;
  companies: Company[];
  estimates: PriceEstimate[];
  brands: Brand[];
}) {
  if (!solution) return null;
  return (
    <section id="two-paths" aria-labelledby="two-paths-title" className="scroll-mt-20 border-t border-[hsl(var(--v-line))] py-12">
      <h2 id="two-paths-title" className="text-balance text-2xl font-bold tracking-tight sm:text-3xl">
        Сделать самому или вызвать мастера
      </h2>
      <p className="mt-2 max-w-2xl text-pretty text-[15px] leading-relaxed text-[hsl(var(--v-ink2))]">
        Протокол из подбора выше: {solution.title}.{" "}
        <a href="#diagnostic" className="font-semibold whitespace-nowrap text-[hsl(var(--v-accent))] hover:underline">
          Другая задача
        </a>
      </p>

      <nav aria-label="Переход к пути" className="mt-4 flex gap-2 lg:hidden">
        <a
          href="#diy"
          className="inline-flex min-h-11 items-center rounded-full border border-[hsl(var(--v-line))] bg-[hsl(var(--v-surface))] px-4 text-sm font-medium whitespace-nowrap"
        >
          К чеклисту
        </a>
        <a
          href="#pro"
          className="inline-flex min-h-11 items-center rounded-full border border-[hsl(var(--v-line))] bg-[hsl(var(--v-surface))] px-4 text-sm font-medium whitespace-nowrap"
        >
          К мастерам
        </a>
      </nav>

      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)] lg:items-start lg:gap-10">
        <DiyPanel solution={solution} brands={brands} />
        <ProPanel solution={solution} companies={companies} estimates={estimates} />
      </div>
    </section>
  );
}
