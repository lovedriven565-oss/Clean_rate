"use client";

import { Globe, Mail, MessageCircle, Phone } from "lucide-react";
import type { Company } from "@/lib/types";
import { trackClick } from "@/lib/analytics";

export function CompanyContactActions({ company }: { company: Company }) {
  const actionClass =
    "inline-flex h-11 items-center justify-center gap-2 rounded-full border border-border bg-card px-4 text-sm font-semibold text-foreground transition-colors hover:border-primary/35 hover:text-primary";

  return (
    <div className="flex flex-wrap gap-2">
      {company.phone && (
        <a
          href={`tel:${company.phone.replace(/[^\d+]/g, "")}`}
          onClick={() => trackClick({ companyId: company.id, categoryId: company.categories[0], clickType: "phone" })}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground shadow-sm shadow-primary/20"
        >
          <Phone className="h-4 w-4" />
          {company.phone}
        </a>
      )}
      {company.websiteUrl && (
        <a
          href={company.websiteUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => trackClick({ companyId: company.id, categoryId: company.categories[0], clickType: "website" })}
          className={actionClass}
        >
          <Globe className="h-4 w-4" />
          Сайт
        </a>
      )}
      {company.telegramUrl && (
        <a
          href={company.telegramUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => trackClick({ companyId: company.id, categoryId: company.categories[0], clickType: "telegram" })}
          className={actionClass}
        >
          <MessageCircle className="h-4 w-4" />
          Telegram
        </a>
      )}
      {company.email && (
        <a href={`mailto:${company.email}`} className={actionClass}>
          <Mail className="h-4 w-4" />
          Email
        </a>
      )}
    </div>
  );
}
