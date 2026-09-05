import Link from "next/link";
import { ArrowUpRight, Network } from "lucide-react";

const columns = [
  {
    title: "Платформа",
    links: [
      { href: "/rating", label: "Рейтинг компаний" },
      { href: "/brands", label: "Бренды и решения" },
      { href: "/#categories", label: "Категории услуг" },
    ],
  },
  {
    title: "Бизнесу",
    links: [
      { href: "/for-partners", label: "Разместить компанию" },
      { href: "/for-partners", label: "Подтвердить профиль" },
      { href: "/suppliers", label: "Каталог поставщиков" },
    ],
  },
  {
    title: "Принципы",
    links: [
      { href: "/rating", label: "Открытый рейтинг" },
      { href: "/privacy", label: "Конфиденциальность" },
      { href: "/for-brands", label: "Брендам и реклама" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="border-t border-border bg-foreground text-background">
      <div className="container grid grid-cols-1 gap-10 py-14 sm:grid-cols-2 lg:grid-cols-[1.4fr_repeat(3,1fr)] lg:py-18">
        <div className="flex flex-col items-start gap-5">
          <Link href="/" className="flex items-center gap-3 font-display font-bold tracking-tight">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <Network className="h-4 w-4" />
            </span>
            Клининг Рейтинг
          </Link>
          <p className="max-w-sm text-sm leading-6 text-background/60">
            Профессиональная платформа индустрии чистоты: компании, бренды, поставщики и знания в единой структуре рынка.
          </p>
          <Link href="/for-partners" className="inline-flex items-center gap-2 text-sm font-semibold text-primary">
            Стать частью платформы
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>

        {columns.map((column) => (
          <div key={column.title} className="flex flex-col gap-4">
            <h3 className="text-xs font-bold uppercase tracking-[0.18em] text-background/45">{column.title}</h3>
            <ul className="flex flex-col gap-3 text-sm text-background/65">
              {column.links.map((link) => (
                <li key={`${link.href}-${link.label}`}>
                  <Link href={link.href} className="transition-colors hover:text-primary">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="border-t border-background/10">
        <div className="container flex flex-col gap-2 py-6 text-xs text-background/45 md:flex-row md:items-center md:justify-between">
          <p>© 2026 Клининг Рейтинг. Платформа находится в стадии формирования.</p>
          <p>Оценка и рекламное размещение разделены</p>
        </div>
      </div>
    </footer>
  );
}
