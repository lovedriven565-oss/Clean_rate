import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { BrandLogo } from "@/components/BrandLogo";
import { getAllCompanies } from "@/lib/db/queries";
import { getFooterCityLinks, getFooterLandingLinksByCity } from "@/lib/landing";
import { SITE_DOMAIN, SITE_NAME } from "@/lib/site";

const columns = [
  {
    title: "Платформа",
    links: [
      { href: "/solutions", label: "Решения задач" },
      { href: "/rating", label: "Рейтинг компаний" },
      { href: "/assistant", label: "ИИ-консультант" },
      { href: "/brands", label: "Бренды и решения" },
    ],
  },
  {
    title: "Бизнесу",
    links: [
      { href: "/for-partners", label: "Разместить компанию" },
      { href: "/for-partners", label: "Подтвердить профиль" },
      { href: "/for-brands", label: "Брендам" },
    ],
  },
  {
    title: "Принципы",
    links: [
      { href: "/rating", label: "Открытый рейтинг" },
      { href: "/rating/methodology", label: "Методология оценки" },
      { href: "/privacy", label: "Конфиденциальность" },
      { href: "/terms", label: "Соглашение" },
    ],
  },
];

/** Колонка прямых ссылок на индексируемые посадочные «услуга × город» — хаб перелинковки. */
export async function Footer() {
  const companies = await getAllCompanies();
  const cityHubLinks = getFooterCityLinks(companies);
  const cityLandingColumns = getFooterLandingLinksByCity(companies);
  const allColumns = [
    ...columns,
    ...(cityHubLinks.length ? [{ title: "Города", links: cityHubLinks }] : []),
  ];

  return (
    <footer className="border-t border-border bg-cta text-cta-foreground">
      <div className="container grid grid-cols-1 gap-10 py-14 sm:grid-cols-2 lg:grid-cols-[1.4fr_repeat(4,1fr)] lg:py-18">
        <div className="flex flex-col items-start gap-5">
          <Link href="/" className="font-display font-bold tracking-tight text-cta-foreground">
            <BrandLogo />
          </Link>
          <p className="max-w-sm text-sm leading-6 text-cta-foreground/70">
            Профессиональная платформа индустрии чистоты: компании, бренды и знания в единой структуре рынка.
          </p>
          <Link
            href="/for-partners"
            className="inline-flex min-h-11 items-center gap-2 rounded-full bg-brand px-5 text-sm font-semibold text-brand-foreground transition-transform hover:-translate-y-0.5"
          >
            Стать частью платформы
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>

        {allColumns.map((column) => (
          <div key={column.title} className="flex flex-col gap-4">
            <h3 className="text-xs font-bold uppercase tracking-[0.18em] text-cta-foreground/50">{column.title}</h3>
            <ul className="flex flex-col gap-3 text-sm text-cta-foreground/75">
              {column.links.map((link, i) => (
                <li key={`${link.href}-${link.label}-${i}`}>
                  <Link href={link.href} className="transition-colors hover:text-cta-foreground">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {cityLandingColumns.length > 0 && (
        <div className="container border-t border-cta-foreground/10 pb-14">
          <div className="pt-8">
            <h3 className="text-xs font-bold uppercase tracking-[0.18em] text-cta-foreground/50">Услуги по городам</h3>
            <div className="mt-5 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {cityLandingColumns.map((city) => (
                <div key={city.cityName} className="flex flex-col gap-3">
                  <p className="text-sm font-semibold text-cta-foreground">{city.cityName}</p>
                  <ul className="grid grid-cols-1 gap-2 text-sm text-cta-foreground/70 sm:grid-cols-2">
                    {city.links.map((link) => (
                      <li key={link.href}>
                        <Link href={link.href} className="transition-colors hover:text-cta-foreground">
                          {link.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="border-t border-cta-foreground/15">
        <div className="container flex flex-col gap-2 py-6 text-xs text-cta-foreground/50 md:flex-row md:items-center md:justify-between">
          <p>© 2026 {SITE_NAME}. Информация носит справочный характер: услуги оказывают компании, платформа не является стороной договора.</p>
          <p>Оценка и рекламное размещение разделены</p>
        </div>
      </div>

      <div aria-hidden className="pointer-events-none select-none overflow-hidden">
        <p className="container -mb-[0.18em] whitespace-nowrap text-center font-display text-[12.5vw] font-bold uppercase leading-none tracking-[-0.06em] text-transparent [-webkit-text-stroke:1px_hsl(var(--cta-foreground)/0.14)] xl:text-[10rem]">
          {SITE_DOMAIN}
        </p>
      </div>
    </footer>
  );
}
