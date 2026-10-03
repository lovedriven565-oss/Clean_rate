import type { EstimateView } from "./diagnostic-model";

/** Смета как ориентир, не оферта. Нет данных: честно «цена уточняется у компании». */
export function EstimateCard({ estimate, size = "md" }: { estimate: EstimateView | null; size?: "md" | "lg" }) {
  return (
    <div
      data-estimate
      className="rounded-[var(--v-r-ctl)] border border-[hsl(var(--v-line))] bg-[hsl(var(--v-tint))] px-3.5 py-3"
    >
      <p className="text-xs font-semibold text-[hsl(var(--v-ink2))]">Ориентир цены, не оферта</p>
      {estimate ? (
        <>
          <p
            className={
              size === "lg"
                ? "mt-1 text-2xl font-semibold tabular-nums tracking-tight"
                : "mt-1 text-xl font-semibold tabular-nums tracking-tight"
            }
          >
            {estimate.min}
            <span className="mx-2 text-sm font-normal text-[hsl(var(--v-ink2))]">до</span>
            {estimate.max}
          </p>
          <p className="mt-0.5 text-xs leading-snug text-[hsl(var(--v-ink2))]">
            {estimate.unit ? `за ${estimate.unit}, ` : ""}
            {estimate.city}. Итог определяется после оценки объёма и условий.
          </p>
          {estimate.note && <p className="mt-1 text-xs leading-snug text-[hsl(var(--v-ink2))]">{estimate.note}</p>}
        </>
      ) : (
        <p className="mt-1 text-sm">Ориентир пока не опубликован: цена уточняется у компании.</p>
      )}
    </div>
  );
}
