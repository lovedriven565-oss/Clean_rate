import Link from "next/link";
import { BadgeCheck, Globe, Phone, Send } from "lucide-react";
import { pluralize } from "@/lib/format";
import type { Company } from "@/lib/types";
import { cn } from "@/lib/utils";
import { companyRatingText } from "./card-models";
import { companyPriceLabel, telHref } from "./diagnostic-model";
import styles from "./Diagnostic.module.css";

function initials(name: string): string {
  const words = name.match(/[\p{L}\d]+/gu) ?? [];
  const [first = "?", second] = words;
  return (second ? first[0] + second[0] : first.slice(0, 2)).toUpperCase();
}

const iconLink =
  "grid size-11 shrink-0 place-items-center rounded-[var(--v-r-ctl)] border border-[hsl(var(--v-line))] bg-[hsl(var(--v-surface))] text-[hsl(var(--v-ink2))] transition-colors hover:border-[hsl(var(--v-accent)/0.4)] hover:text-[hsl(var(--v-ink))]";

/**
 * Строка компании в «Вызвать мастера» (прототип A, этап 1.6). Без аналитики:
 * tel: ведёт на реальный опубликованный номер, внешние ссылки открываются
 * в новой вкладке; у спонсора rel="sponsored". Рейтинг и доверие считает
 * companyRatingText (внешняя оценка только Google/Яндекс, иначе статус или
 * «Рейтинг не публикуется»).
 */
export function CompanyRow({ company, sponsor = false }: { company: Company; sponsor?: boolean }) {
  const rel = sponsor ? "sponsored noopener noreferrer" : "noopener noreferrer";
  const meta = [
    companyPriceLabel(company),
    company.experienceYears ? `Опыт ${pluralize(company.experienceYears, ["год", "года", "лет"])}` : null,
  ].filter(Boolean);

  return (
    <li
      data-company-row
      data-company-kind={sponsor ? "sponsor" : "organic"}
      className={cn(sponsor ? styles.sponsorSlot : styles.raised, "flex min-w-0 flex-col gap-3 p-3.5 sm:p-4")}
    >
      <div className="flex min-w-0 items-start gap-3">
        <span
          aria-hidden="true"
          className="grid size-11 shrink-0 place-items-center rounded-[var(--v-r-ctl)] bg-[hsl(var(--v-tint))] text-sm font-semibold text-[hsl(var(--v-accent))]"
        >
          {initials(company.name)}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <Link
              href={`/companies/${company.slug}`}
              className="min-w-0 text-[15px] font-semibold leading-snug [overflow-wrap:anywhere] hover:underline"
            >
              {company.name}
            </Link>
            {company.verified && (
              <span
                title="Контакты и юрлицо проверены редакцией."
                className="inline-flex items-center gap-1 text-xs font-medium text-[hsl(var(--v-accent))]"
              >
                <BadgeCheck className="size-3.5" aria-hidden="true" />
                Профиль проверен
              </span>
            )}
            {sponsor && (
              <span
                title="Платное размещение. Органический рейтинг не зависит от оплаты."
                className="rounded-full border border-[hsl(var(--v-ad))] bg-[hsl(var(--v-ad)/0.16)] px-2 py-0.5 text-[11px] font-semibold"
              >
                Спонсор
              </span>
            )}
          </div>
          <p className="mt-1 text-[13px] leading-snug text-[hsl(var(--v-ink2))] [overflow-wrap:anywhere]">
            {companyRatingText(company)}
          </p>
          <p className="mt-0.5 text-xs tabular-nums text-[hsl(var(--v-ink2))]">{meta.join(" · ")}</p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {company.phone ? (
          <a
            href={telHref(company.phone)}
            aria-label={`Позвонить в ${company.name}: ${company.phone}`}
            className={cn(
              "inline-flex min-h-11 min-w-0 flex-1 items-center justify-center gap-2 rounded-[var(--v-r-ctl)] bg-[hsl(var(--v-accent))] px-4 text-sm font-semibold whitespace-nowrap text-[hsl(var(--v-accent-ink))] sm:flex-none",
              styles.press,
            )}
          >
            <Phone className="size-4 shrink-0" aria-hidden="true" />
            Позвонить
            <span className="font-medium tabular-nums opacity-90">{company.phone}</span>
          </a>
        ) : (
          <p className="min-h-11 flex-1 content-center text-sm text-[hsl(var(--v-ink2))]">Телефон не опубликован</p>
        )}
        {company.telegramUrl && (
          <a href={company.telegramUrl} target="_blank" rel={rel} aria-label={`Telegram: ${company.name}`} className={iconLink}>
            <Send className="size-4" aria-hidden="true" />
          </a>
        )}
        {company.websiteUrl && (
          <a href={company.websiteUrl} target="_blank" rel={rel} aria-label={`Сайт: ${company.name}`} className={iconLink}>
            <Globe className="size-4" aria-hidden="true" />
          </a>
        )}
      </div>
    </li>
  );
}
