import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { BrandLogo } from "@/components/BrandLogo";
import { SITE_NAME } from "@/lib/site";

const columns = [
  {
    title: "Платформа",
    links: [
      { href: "/solutions", label: "Решения задач" },
      { href: "/rating", label: "Рейтинг компаний" },
      { href: "/assistant", label: "AI-консультант" },
      { href: "/brands", label: "Бренды и решения" },
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
      { href: "/rating/methodology", label: "Методология оценки" },
      { href: "/privacy", label: "Конфиденциальность" },
      { href: "/for-brands", label: "Брендам и реклама" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="border-t border-border bg-contrast text-contrast-foreground">
      <div className="container grid grid-cols-1 gap-10 py-14 sm:grid-cols-2 lg:grid-cols-[1.4fr_repeat(3,1fr)] lg:py-18">
        <div className="flex flex-col items-start gap-5">
          <Link href="/" className="font-display font-bold tracking-tight text-contrast-foreground">
            <BrandLogo />
          </Link>
          <p className="max-w-sm text-sm leading-6 text-contrast-foreground/70">
            Профессиональная платформа индустрии чистоты: компании, бренды, поставщики и знания в единой структуре рынка.
          </p>
          <Link href="/for-partners" className="inline-flex items-center gap-2 text-sm font-semibold text-primary">
            Стать частью платформы
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>

        {columns.map((column) => (
          <div key={column.title} className="flex flex-col gap-4">
            <h3 className="text-xs font-bold uppercase tracking-[0.18em] text-contrast-foreground/50">{column.title}</h3>
            <ul className="flex flex-col gap-3 text-sm text-contrast-foreground/75">
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

      <div className="border-t border-contrast-foreground/15">
        <div className="container flex flex-col gap-2 py-6 text-xs text-contrast-foreground/50 md:flex-row md:items-center md:justify-between">
          <p>© 2026 {SITE_NAME}. Информация носит справочный характер: услуги оказывают компании, платформа не является стороной договора.</p>
          <p>Оценка и рекламное размещение разделены</p>
        </div>
      </div>
    </footer>
  );
}
