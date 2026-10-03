import Link from "next/link";
import { ArrowUpRight, BookOpenCheck, Megaphone, PhoneCall, ShieldCheck, type LucideIcon } from "lucide-react";

const FACTS: { icon: LucideIcon; title: string; text: string }[] = [
  {
    icon: ShieldCheck,
    title: "Балл не продаётся",
    text: "Органический порядок строится по проверке профиля и подтверждённым оценкам. Оплата в расчёт не входит.",
  },
  {
    icon: Megaphone,
    title: "Платное помечено",
    text: "Спонсор и реклама подписаны и стоят отдельно от органической выдачи.",
  },
  {
    icon: PhoneCall,
    title: "Контакты прямые",
    text: "Телефон и мессенджеры ведут в компанию. Платформа не берёт комиссию и не передаёт ваши данные.",
  },
  {
    icon: BookOpenCheck,
    title: "Методика открыта",
    text: "Как считается рейтинг, описано на отдельной странице, с условиями и ограничениями.",
  },
];

/** Один блок о независимости платформы (этап 1.6): тезис слева, четыре факта справа без карточек. */
export function IndependenceBlock() {
  return (
    <section
      aria-labelledby="independence-title"
      className="grid grid-cols-1 gap-8 border-t border-[hsl(var(--v-line))] py-12 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-14"
    >
      <div className="min-w-0">
        <h2 id="independence-title" className="text-balance text-2xl font-bold leading-tight tracking-tight sm:text-3xl">
          Оплата не покупает место в рейтинге
        </h2>
        <p className="mt-3 max-w-md text-pretty text-[15px] leading-relaxed text-[hsl(var(--v-ink2))]">
          Платные форматы существуют, но порядок компаний и протоколов от них не зависит.
        </p>
        <Link
          href="/rating/methodology"
          className="mt-4 inline-flex min-h-11 items-center gap-1 text-sm font-semibold whitespace-nowrap text-[hsl(var(--v-accent))] hover:underline"
        >
          Читать методику
          <ArrowUpRight className="size-4" aria-hidden="true" />
        </Link>
      </div>

      <dl className="grid min-w-0 grid-cols-1 gap-x-8 gap-y-6 sm:grid-cols-2">
        {FACTS.map(({ icon: Icon, title, text }) => (
          <div key={title} className="min-w-0 border-t border-[hsl(var(--v-line))] pt-4">
            <dt className="flex items-center gap-2 text-[15px] font-semibold">
              <Icon className="size-5 shrink-0 text-[hsl(var(--v-accent))]" aria-hidden="true" />
              {title}
            </dt>
            <dd className="mt-1.5 text-sm leading-relaxed text-[hsl(var(--v-ink2))]">{text}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
