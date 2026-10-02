import type { Company, Solution } from "@/lib/types";
import {
  RISK_NOTE,
  buildAdSampleCard,
  buildCompanyCard,
  buildLongContentSample,
  buildProductSampleCard,
  buildTaskCard,
} from "./card-models";
import { CardEmpty, CardError, CardSkeleton, ProtoCard } from "./ProtoCard";

const TASK_LIMIT = 3;
const COMPANY_LIMIT = 3;

function Group({ id, title, note, children }: { id: string; title: string; note: string; children: React.ReactNode }) {
  return (
    <section aria-labelledby={id} className="border-t border-[hsl(var(--v-line))] py-10">
      <div className="mb-5">
        <h2 id={id} className="text-2xl font-bold tracking-tight">
          {title}
        </h2>
        <p className="mt-1 text-sm text-[hsl(var(--v-ink2))]">{note}</p>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">{children}</div>
    </section>
  );
}

/**
 * Карточки и быстрый просмотр (этап 1.5). Задачи и компании — реальные данные
 * прототипа (published-решения, seed-компании); средство и реклама — явные образцы.
 */
export function CardsShowcase({ solutions, companies }: { solutions: Solution[]; companies: Company[] }) {
  const tasks = solutions.filter((s) => s.status === "published").slice(0, TASK_LIMIT).map(buildTaskCard);
  // Спонсоры и проверенные компании идут первыми в подборке, чтобы новый партнёр получал охват
  const sortedCompanies = [...companies].sort((a, b) => {
    if (a.promoted !== b.promoted) return a.promoted ? -1 : 1;
    if (a.verified !== b.verified) return a.verified ? -1 : 1;
    return (b.baseRating ?? 0) - (a.baseRating ?? 0);
  });
  const orgCompanies = sortedCompanies.slice(0, COMPANY_LIMIT).map(buildCompanyCard);

  return (
    <>
      <Group
        id="cards-tasks"
        title="Карточки задач"
        note="Из опубликованных протоколов. Подробности — по кнопке «Быстрый просмотр», при наведении или с клавиатуры."
      >
        {tasks.length > 0 ? (
          tasks.map((c) => <ProtoCard key={c.id} card={c} />)
        ) : (
          <CardEmpty title="Протоколов пока нет" text="Опубликованные решения появятся здесь." href="/solutions" hrefLabel="Все решения" />
        )}
      </Group>

      <Group
        id="cards-products"
        title="Средства под задачу"
        note="Демо-образец структуры: реального продуктового контракта пока нет, поэтому цена, наличие и совместимость не указаны."
      >
        <ProtoCard card={buildProductSampleCard()} />
      </Group>

      <Group
        id="cards-companies"
        title="Компании"
        note="Рейтинг показан только при подтверждённом внешнем источнике; иначе — «Рейтинг не публикуется». Цена без публикации — «по запросу»."
      >
        {orgCompanies.length > 0 ? (
          orgCompanies.map((c) => <ProtoCard key={c.id} card={c} />)
        ) : (
          <CardEmpty title="Компаний в городе пока нет" text="Мы не показываем непроверенные профили." href="/rating" hrefLabel="Рейтинг компаний" />
        )}
      </Group>

      <section aria-labelledby="cards-ad" className="border-t border-[hsl(var(--v-line))] py-10">
        <div className="mb-5 flex items-center gap-3">
          <h2 id="cards-ad" className="text-2xl font-bold tracking-tight">
            Рекламный образец
          </h2>
          <span className="h-px flex-1 bg-[hsl(var(--v-ad))]/50" aria-hidden="true" />
          <span className="text-xs font-semibold uppercase tracking-wider text-[hsl(var(--v-ink2))]">Реклама · отдельно от органики</span>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <ProtoCard card={buildAdSampleCard()} />
        </div>
      </section>

      <section aria-labelledby="cards-states" className="border-t border-[hsl(var(--v-line))] py-10">
        <div className="mb-5">
          <h2 id="cards-states" className="text-2xl font-bold tracking-tight">
            Состояния карточек
          </h2>
          <p className="mt-1 text-sm text-[hsl(var(--v-ink2))]">Макеты состояний — не данные и не сетевые запросы.</p>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3" data-states>
          <CardSkeleton />
          <CardEmpty title="Ничего не нашлось" text="Попробуйте описать задачу иначе или откройте весь каталог." href="/solutions" hrefLabel="Все решения" />
          <CardError title="Не удалось загрузить" text="Данные временно недоступны. Попробуйте обновить страницу позже." />
          <ProtoCard card={buildLongContentSample()} />
        </div>
        <p className="mt-6 max-w-3xl text-xs leading-snug text-[hsl(var(--v-ink2))]">{RISK_NOTE}</p>
      </section>
    </>
  );
}
