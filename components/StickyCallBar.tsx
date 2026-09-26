"use client";

import Link from "next/link";
import { useState } from "react";
import { useMotionValueEvent, useScroll } from "motion/react";
import { MessageCircle, Phone } from "lucide-react";
import { trackClick } from "@/lib/analytics";
import { cn } from "@/lib/utils";

interface StickyCallBarProps {
  /** Название компании/контекста для подписи кнопки */
  label: string;
  phone?: string;
  telegramUrl?: string;
  companyId?: string;
  categoryId?: string;
  /** Куда вести, если у компании нет прямого телефона (например, на /rating) */
  fallbackHref?: string;
  fallbackLabel?: string;
  /** Порог скролла в px, после которого панель появляется */
  showAfter?: number;
}

/**
 * Закреплённая внизу панель для мобильных: звонок/telegram всегда доступны в один тап,
 * без необходимости скроллить страницу назад к блоку контактов.
 */
export function StickyCallBar({
  label,
  phone,
  telegramUrl,
  companyId,
  categoryId,
  fallbackHref,
  fallbackLabel = "Смотреть рейтинг",
  showAfter = 420,
}: StickyCallBarProps) {
  const [visible, setVisible] = useState(false);
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, "change", (latest) => {
    const next = latest > showAfter;
    setVisible((prev) => (prev !== next ? next : prev));
  });

  const hasDirectContact = Boolean(phone || telegramUrl);
  if (!hasDirectContact && !fallbackHref) return null;

  return (
    <div
      className={cn(
        "fixed inset-x-0 bottom-0 z-30 border-t border-border bg-card/95 px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 shadow-[0_-12px_32px_hsl(var(--shadow-tint)/0.08)] backdrop-blur-lg transition-transform duration-200 lg:hidden",
        visible ? "translate-y-0" : "translate-y-full pointer-events-none"
      )}
      role="region"
      aria-label="Быстрый контакт"
      aria-hidden={!visible}
    >
      <div className="mx-auto flex max-w-xl items-center gap-2">
        <span className="min-w-0 flex-1 truncate text-xs font-medium text-muted-foreground">{label}</span>
        {hasDirectContact ? (
          <>
            {phone && (
              <a
                href={`tel:${phone.replace(/[^\d+]/g, "")}`}
                onClick={() => companyId && trackClick({ companyId, categoryId, clickType: "phone" })}
                className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-full bg-primary px-4 text-sm font-semibold text-primary-foreground transition-transform hover:-translate-y-0.5"
              >
                <Phone className="h-4 w-4" />
                Позвонить
              </a>
            )}
            {telegramUrl && (
              <a
                href={telegramUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Telegram ${label}`}
                onClick={() => companyId && trackClick({ companyId, categoryId, clickType: "telegram" })}
                className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-border bg-card text-foreground transition-colors hover:border-primary/40 hover:text-primary"
              >
                <MessageCircle className="h-4 w-4" />
              </a>
            )}
          </>
        ) : (
          fallbackHref && (
            <Link
              href={fallbackHref}
              className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-full bg-primary px-4 text-sm font-semibold text-primary-foreground"
            >
              <Phone className="h-4 w-4" />
              {fallbackLabel}
            </Link>
          )
        )}
      </div>
    </div>
  );
}
