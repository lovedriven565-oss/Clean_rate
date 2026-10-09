import type { Company, Solution } from "@/lib/types";
import {
  RISK_NOTE,
  buildAdSampleCard,
  buildCompanyCard,
  buildLongContentSample,
  buildProductSampleCard,
  buildTaskCard,
  pickShowcaseTasks,
} from "./card-models";
import { rankOrganicCompanies } from "./diagnostic-model";
import { CardEmpty, CardError, CardSkeleton, ProtoCard } from "./ProtoCard";

const TASK_LIMIT = 3;
const COMPANY_LIMIT = 3;

function Group({ id, title, note, children }: { id: string; title: string; note: string; children: React.ReactNode }) {
  return (
    <section aria-labelledby={id} className="border-t border-[hsl(var(--v-line))] py-10">
      <div className="mb-5">
        <h3 id={id} className="text-xl font-bold tracking-tight">
          {title}
        </h3>
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
  const tasks = pickShowcaseTasks(solutions, TASK_LIMIT).map(buildTaskCard);
  // Органический порядок по доверию, как в «Вызвать мастера»: promoted на позицию не влияет,
  // спонсор отличается только плашкой (принцип «Оплата не покупает место в рейтинге»).
  const orgCompanies = rankOrganicCompanies(companies).slice(0, COMPANY_LIMIT).map(buildCompanyCard);

  return (
    <>
      <Group
        id="cards-tasks"
        title="Карточки задач"
        note="Из опубликованных протоколов. Подробности открываются кнопкой «Быстрый просмотр», наведением или с клавиатуры."
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
          <h3 id="cards-ad" className="text-xl font-bold tracking-tight">
            Рекламный образец
          </h3>
          <span className="h-px flex-1 bg-[hsl(var(--v-ad))]/50" aria-hidden="true" />
          <span className="text-xs font-semibold uppercase tracking-wider text-[hsl(var(--v-ink2))]">Реклама · отдельно от органики</span>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <ProtoCard card={buildAdSampleCard()} />
        </div>
      </section>

      <section aria-labelledby="cards-states" className="border-t border-[hsl(var(--v-line))] py-10">
        <div className="mb-5">
          <h3 id="cards-states" className="text-xl font-bold tracking-tight">
            Состояния карточек
          </h3>
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
