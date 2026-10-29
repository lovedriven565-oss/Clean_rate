"use client";

import { motion } from "motion/react";
import { usePrefersReducedMotion } from "@/lib/usePrefersReducedMotion";
import { ArrowDown, MessageCircle, ShieldCheck } from "lucide-react";
import { PhoneButton } from "@/components/PhoneButton";
import { useRegion } from "@/components/providers/RegionProvider";
import { trackClick } from "@/lib/analytics";
import { buildEscalation } from "@/lib/solutions/diagnostic";
import { SURFACE_RISK_LABELS } from "@/lib/solutions/meta";
import type { Company, PriceEstimate, Solution } from "@/lib/types";

/**
 * Мостик в конце DIY-чеклиста: тот, кто испугался испортить материал, получает смету мастера
 * своего города и звонок в один тап. Компания — первая органическая (оплата не влияет).
 */
export function DiyEscalation({
  solution,
  estimates,
  companies,
}: {
  solution: Solution;
  estimates: PriceEstimate[];
  companies: Company[];
}) {
  const reduce = usePrefersReducedMotion();
  const { market, city } = useRegion();
  const offer = buildEscalation(solution, estimates, companies, {
    countryCode: market.countryCode,
    city: city.name,
    cities: market.cities.map((c) => c.name),
  });
  const { company } = offer;
  const price = offer.priceFrom && (
    <>
      {" "}
      <span className="whitespace-nowrap font-data font-semibold text-foreground">от {offer.priceFrom}</span>
      {offer.unit && ` за ${offer.unit}`}
    </>
  );

  return (
    <motion.aside
      aria-labelledby="diy-escalation-title"
      initial={reduce ? false : { opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.4 }}
      transition={{ type: "spring", stiffness: 140, damping: 20 }}
      className="no-print relative isolate mt-8 overflow-hidden rounded-panel border border-brand/35 bg-brand/[0.07] p-5 sm:p-6"
    >
      <div aria-hidden className="pointer-events-none absolute -right-16 -top-20 -z-10 size-56 rounded-full bg-brand/20 blur-3xl" />
      <div className="flex items-start gap-4">
        <span className="hidden size-11 shrink-0 items-center justify-center rounded-control bg-brand text-brand-foreground shadow-[0_10px_24px_-12px_hsl(var(--brand)/0.9)] sm:flex">
          <ShieldCheck className="size-5" aria-hidden />
        </span>
        <div className="min-w-0 flex-1">
          <h3
            id="diy-escalation-title"
            className="text-balance font-display text-lg font-bold leading-snug tracking-[-0.02em] text-foreground sm:text-xl"
          >
            Не поддаётся или боитесь испортить {SURFACE_RISK_LABELS[solution.surface]}?
          </h3>
          <p className="mt-1.5 max-w-[60ch] text-pretty text-sm leading-6 text-muted-foreground">
            {company ? (
              <>Не рискуйте: мастер в {city.nameIn} сделает это профессиональным оборудованием{price}.</>
            ) : (
              <>
                Мастера в {city.nameIn} только подключаются к платформе.
                {price && <> Ориентир цены у профессионалов:{price}.</>}
              </>
            )}
          </p>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            {company?.phone ? (
              <PhoneButton
                phone={company.phone}
                companyId={company.id}
                categoryId={solution.relatedCategory ?? company.categories[0]}
                label="Позвонить мастеру"
              />
            ) : company?.telegramUrl ? (
              <a
                href={company.telegramUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() =>
                  trackClick({ companyId: company.id, categoryId: solution.relatedCategory, clickType: "telegram" })
                }
                className="inline-flex h-11 items-center gap-2 rounded-full bg-brand px-5 text-sm font-semibold text-brand-foreground shadow-sm shadow-brand/30 transition-transform hover:-translate-y-0.5 active:scale-[0.98]"
              >
                <MessageCircle className="size-4" aria-hidden />
                Написать мастеру
              </a>
            ) : null}
            <a
              href="#pro"
              className="inline-flex h-11 items-center gap-1.5 rounded-full border border-border bg-card px-4 text-sm font-semibold text-foreground transition-colors hover:border-primary/35 hover:text-primary active:scale-[0.98]"
            >
              {company ? "Сравнить мастеров" : "Цены и мастера"}
              <ArrowDown className="size-4" aria-hidden />
            </a>
          </div>

          {company && (
            <p className="mt-3 text-xs leading-5 text-muted-foreground">
              {company.name}
              {company.verified ? ", профиль проверен" : ""}. Контакт прямой, без комиссии платформы.
            </p>
          )}
        </div>
      </div>
    </motion.aside>
  );
}
