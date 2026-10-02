"use client";

import { useState } from "react";
import { Check, Phone } from "lucide-react";
import { trackClick } from "@/lib/analytics";
import { cn } from "@/lib/utils";

interface PhoneButtonProps {
  phone: string;
  companyId?: string;
  categoryId?: string;
  /** compact — для карточек: меньше высота, короткая подпись */
  compact?: boolean;
  className?: string;
}

function telHref(phone: string) {
  return `tel:${phone.replace(/[^\d+]/g, "")}`;
}

/**
 * Телефон компании. На мобильных — звонок через tel:.
 * На десктопе tel: не работает, поэтому кнопка показывает сам номер,
 * а клик копирует его в буфер — клик учитывается как событие phone.
 */
export function PhoneButton({ phone, companyId, categoryId, compact = false, className }: PhoneButtonProps) {
  const [copied, setCopied] = useState(false);

  const track = () => companyId && trackClick({ companyId, categoryId, clickType: "phone" });

  async function copy() {
    track();
    try {
      await navigator.clipboard?.writeText(phone);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Буфер недоступен — номер всё равно читается с кнопки
    }
  }

  const primaryClass = cn(
    "inline-flex items-center justify-center gap-2 rounded-full bg-primary font-semibold text-primary-foreground transition-transform hover:-translate-y-0.5",
    compact ? "h-10 flex-1 px-4 text-xs sm:flex-none" : "h-11 px-5 text-sm",
    className
  );
  const iconClass = compact ? "h-3.5 w-3.5" : "h-4 w-4";

  return (
    <>
      <a href={telHref(phone)} onClick={track} className={cn(primaryClass, "md:hidden")}>
        <Phone className={iconClass} />
        {compact ? "Позвонить" : phone}
      </a>
      <button
        type="button"
        onClick={copy}
        title="Нажмите, чтобы скопировать номер"
        className={cn(primaryClass, "hidden md:inline-flex")}
      >
        {copied ? <Check className={iconClass} /> : <Phone className={iconClass} />}
        {copied ? "Скопировано" : phone}
      </button>
    </>
  );
}
