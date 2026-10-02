"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Link2, Send, Share2 } from "lucide-react";
import { trackEvent } from "@/lib/analytics";
import { cn } from "@/lib/utils";

interface ShareButtonProps {
  /** Абсолютный или относительный URL страницы */
  url: string;
  title: string;
  /** Текст в мессенджере: заголовок + ссылка */
  text?: string;
  className?: string;
}

const CHANNELS = [
  { id: "telegram", label: "Telegram", icon: Send, build: (url: string, text: string) => `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}` },
  { id: "viber", label: "Viber", icon: Share2, build: (url: string, text: string) => `viber://forward?text=${encodeURIComponent(`${text} ${url}`)}` },
  { id: "whatsapp", label: "WhatsApp", icon: Send, build: (url: string, text: string) => `https://wa.me/?text=${encodeURIComponent(`${text} ${url}`)}` },
];

/**
 * «Поделиться»: на мобильных — нативный Web Share API, на десктопе — меню
 * Telegram / Viber / WhatsApp / копировать ссылку. Каждое действие — событие share.
 */
export function ShareButton({ url, title, text, className }: ShareButtonProps) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [open]);

  const absolute = () => new URL(url, window.location.origin).toString();
  const shareText = text ?? title;

  function track(source: string) {
    trackEvent({ entityType: "page", entityId: url.startsWith("/") ? url : new URL(url).pathname, eventType: "share", metadata: { source } });
  }

  async function share() {
    const absoluteUrl = absolute();
    if (navigator.share) {
      try {
        await navigator.share({ title, text: shareText, url: absoluteUrl });
        track("native");
      } catch {
        // Отмена пользователем — не ошибка
      }
      return;
    }
    setOpen((v) => !v);
  }

  async function copy() {
    try {
      await navigator.clipboard?.writeText(absolute());
      setCopied(true);
      track("copy");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Буфер недоступен
    }
  }

  return (
    <div ref={ref} className={cn("relative inline-flex", className)}>
      <button
        type="button"
        onClick={share}
        aria-label="Поделиться"
        aria-expanded={open}
        className="inline-flex h-10 items-center gap-2 rounded-full border border-border bg-card px-4 text-xs font-semibold text-foreground transition-colors hover:border-primary/40 hover:text-primary"
      >
        <Share2 className="h-4 w-4" />
        Поделиться
      </button>

      {open && (
        <div className="glass absolute right-0 top-[calc(100%+0.5rem)] z-30 w-52 rounded-panel p-1.5 shadow-lg">
          {CHANNELS.map((channel) => (
            <a
              key={channel.id}
              href={channel.build(absolute(), shareText)}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => {
                track(channel.id);
                setOpen(false);
              }}
              className="flex items-center gap-3 rounded-control px-3 py-2.5 text-sm text-foreground transition-colors hover:bg-muted/70"
            >
              <channel.icon className="h-4 w-4 text-muted-foreground" />
              {channel.label}
            </a>
          ))}
          <button
            type="button"
            onClick={copy}
            className="flex w-full items-center gap-3 rounded-control px-3 py-2.5 text-left text-sm text-foreground transition-colors hover:bg-muted/70"
          >
            {copied ? <Check className="h-4 w-4 text-primary" /> : <Link2 className="h-4 w-4 text-muted-foreground" />}
            {copied ? "Скопировано" : "Копировать ссылку"}
          </button>
        </div>
      )}
    </div>
  );
}
