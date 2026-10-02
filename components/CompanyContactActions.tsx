"use client";

import { Globe, Mail, MessageCircle } from "lucide-react";
import type { Company } from "@/lib/types";
import { trackClick } from "@/lib/analytics";
import { PhoneButton } from "@/components/PhoneButton";
import { cn } from "@/lib/utils";

/**
 * Контакты компании. Один главный CTA (телефон, иначе Telegram) — заполненная кнопка,
 * остальные каналы вторичны. `compact` — для карточек: короче кнопка, вторичные каналы только иконками.
 */
export function CompanyContactActions({ company, compact = false, className }: { company: Company; compact?: boolean; className?: string }) {
  const categoryId = company.categories[0];
  const track = (clickType: "phone" | "website" | "telegram") => () => trackClick({ companyId: company.id, categoryId, clickType });

  const primaryClass = cn(
    "inline-flex items-center justify-center gap-2 rounded-full bg-primary font-semibold text-primary-foreground shadow-sm shadow-primary/20 transition-transform hover:-translate-y-0.5",
    compact ? "h-10 flex-1 px-4 text-xs sm:flex-none" : "h-11 px-5 text-sm"
  );
  const secondaryClass = cn(
    "inline-flex items-center justify-center gap-2 rounded-full border border-border bg-card font-semibold text-foreground transition-colors hover:border-primary/35 hover:text-primary",
    compact ? "h-10 w-10" : "h-11 px-4 text-sm"
  );
  const iconClass = compact ? "h-3.5 w-3.5" : "h-4 w-4";
  const phoneIsPrimary = Boolean(company.phone);

  return (
    <div className={cn("flex flex-wrap items-center gap-2", className)}>
      {company.phone && (
        <PhoneButton phone={company.phone} companyId={company.id} categoryId={categoryId} compact={compact} />
      )}
      {company.telegramUrl && (
        <a
          href={company.telegramUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Telegram ${company.name}`}
          onClick={track("telegram")}
          className={phoneIsPrimary ? secondaryClass : primaryClass}
        >
          <MessageCircle className={iconClass} />
          {(!compact || !phoneIsPrimary) && "Telegram"}
        </a>
      )}
      {company.websiteUrl && (
        <a
          href={company.websiteUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Сайт ${company.name}`}
          onClick={track("website")}
          className={secondaryClass}
        >
          <Globe className={iconClass} />
          {!compact && "Сайт"}
        </a>
      )}
      {company.email && !compact && (
        <a href={`mailto:${company.email}`} className={secondaryClass}>
          <Mail className={iconClass} />
          Email
        </a>
      )}
    </div>
  );
}
