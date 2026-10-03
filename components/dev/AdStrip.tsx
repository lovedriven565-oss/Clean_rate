import { Megaphone } from "lucide-react";

/**
 * Горизонтальный образец платного формата (этап 1.6). Чистая вёрстка:
 * без AdImpression/AdCta, событий, счётчиков и внешних ссылок. Стоит отдельной
 * полосой вне органических блоков, пометка «Реклама» постоянна.
 */
export function AdStrip() {
  return (
    <aside
      aria-labelledby="ad-strip-title"
      data-ad-strip
      className="my-10 grid grid-cols-1 items-center gap-x-6 gap-y-3 rounded-[var(--v-r-card)] border border-dashed border-[hsl(var(--v-ad))] bg-[hsl(var(--v-ad)/0.06)] p-5 sm:grid-cols-[auto_minmax(0,1fr)_auto] sm:p-6"
    >
      <p className="inline-flex w-fit items-center gap-1.5 rounded-full border border-[hsl(var(--v-ad))] px-3 py-1 text-xs font-semibold">
        <Megaphone className="size-3.5" aria-hidden="true" />
        Реклама
      </p>
      <div className="min-w-0">
        <h2 id="ad-strip-title" className="text-balance text-lg font-semibold leading-snug tracking-tight">
          Так выглядит платное размещение
        </h2>
        <p className="mt-1 max-w-2xl text-pretty text-sm leading-relaxed text-[hsl(var(--v-ink2))]">
          Отдельная полоса с постоянной пометкой, вне органической выдачи. Оплата не влияет на рейтинг, порядок решений
          и допуск средств.
        </p>
      </div>
      <p className="text-xs text-[hsl(var(--v-ink2))]">Образец: ссылка не подключена</p>
    </aside>
  );
}
