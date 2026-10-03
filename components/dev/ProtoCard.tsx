"use client";

import { useId, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, useMotionTemplate, useMotionValue } from "motion/react";
import { ArrowUpRight, Building2, ClipboardList, Eye, FlaskConical, ImageOff, Megaphone, TriangleAlert, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { RISK_NOTE, type CardBadgeTone, type CardKind, type CardModel } from "./card-models";
import diagnostic from "./Diagnostic.module.css";
import styles from "./ProtoCard.module.css";

const KIND_ICONS: Record<CardKind, typeof ClipboardList> = {
  task: ClipboardList,
  product: FlaskConical,
  company: Building2,
  ad: Megaphone,
};

const BADGE_TONES: Record<CardBadgeTone, string> = {
  info: "border-transparent bg-[hsl(var(--v-tint))] text-[hsl(var(--v-ink))]",
  demo: "border-dashed border-[hsl(var(--v-ink2))] bg-transparent text-[hsl(var(--v-ink))]",
  sponsor: "border-[hsl(var(--v-ad))] bg-[hsl(var(--v-ad)/0.16)] text-[hsl(var(--v-ink))]",
  ad: "border-[hsl(var(--v-ad))] bg-transparent text-[hsl(var(--v-ink))]",
};

function CardMedia({ card }: { card: CardModel }) {
  const [failed, setFailed] = useState(false);
  const Icon = KIND_ICONS[card.kind];
  const box = "relative aspect-[16/9] w-full overflow-hidden rounded-[var(--v-r-ctl)] bg-[hsl(var(--v-tint))]";

  if (!card.img) {
    return (
      <div className={cn(box, "grid place-items-center")} aria-hidden="true">
        <Icon className="size-8 text-[hsl(var(--v-ink2))]" />
      </div>
    );
  }
  if (failed) {
    return (
      <div className={cn(box, "grid place-items-center")} data-media-state="unavailable">
        <p className="flex items-center gap-2 px-3 text-center text-xs font-medium text-[hsl(var(--v-ink2))]">
          <ImageOff className="size-4 shrink-0" aria-hidden="true" />
          Изображение недоступно
        </p>
      </div>
    );
  }
  return (
    <div className={box}>
      <Image
        src={card.img.src}
        alt={card.img.alt}
        fill
        sizes="(min-width: 1024px) 360px, 92vw"
        className="object-cover"
        onError={() => setFailed(true)}
      />
    </div>
  );
}

/**
 * Карточка прототипа A (этап 1.5). Единая оболочка для task/product/company/ad.
 * Быстрый просмотр — оверлей внутри тела карточки (без сдвига раскладки):
 * открывается наведением мыши, фокусом клавиатуры и явной кнопкой (touch);
 * Escape закрывает, не уводя фокус. Безопасность всегда видна на лицевой стороне.
 */
export function ProtoCard({ card }: { card: CardModel }) {
  const panelId = useId();
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [pinned, setPinned] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  // Позиция курсора живёт в motion values: без ререндеров React на каждое движение мыши.
  const mx = useMotionValue(-300);
  const my = useMotionValue(-300);
  const spotBorder = useMotionTemplate`radial-gradient(180px circle at ${mx}px ${my}px, hsl(var(--v-accent) / 0.7), transparent 70%)`;
  const spotGlow = useMotionTemplate`radial-gradient(240px circle at ${mx}px ${my}px, hsl(var(--v-accent) / 0.08), transparent 70%)`;

  const open = pinned || (!dismissed && (hovered || focused));
  const isAd = card.kind === "ad";
  const caution = card.quick.cautions[0];

  const onPointerMove = (e: React.PointerEvent<HTMLElement>) => {
    if (e.pointerType === "touch") return;
    const rect = e.currentTarget.getBoundingClientRect();
    mx.set(e.clientX - rect.left);
    my.set(e.clientY - rect.top);
  };

  const onPointerEnter = (e: React.PointerEvent) => {
    if (e.pointerType !== "touch") setHovered(true);
  };
  const onPointerLeave = (e: React.PointerEvent) => {
    if (e.pointerType === "touch") return;
    setHovered(false);
    if (!focused) setDismissed(false);
  };
  const onBlur = (e: React.FocusEvent<HTMLElement>) => {
    if (e.currentTarget.contains(e.relatedTarget)) return;
    setFocused(false);
    setDismissed(false);
  };
  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key !== "Escape" || !open) return;
    setPinned(false);
    setDismissed(true);
    e.stopPropagation();
  };
  const toggle = () => {
    if (pinned) {
      setPinned(false);
      setDismissed(true);
    } else {
      setPinned(true);
      setDismissed(false);
    }
  };

  return (
    <article
      aria-label={`${card.kindLabel}: ${card.title}`}
      data-card-kind={card.kind}
      data-open={open}
      onPointerEnter={onPointerEnter}
      onPointerMove={onPointerMove}
      onPointerLeave={onPointerLeave}
      onFocus={() => setFocused(true)}
      onBlur={onBlur}
      onKeyDown={onKeyDown}
      className={cn(
        styles.card,
        "flex min-w-0 flex-col overflow-hidden border bg-[hsl(var(--v-surface))]",
        isAd ? "border-dashed border-[hsl(var(--v-ad))]" : "border-[hsl(var(--v-line))]",
      )}
    >

      {isAd && (
        <p className="flex items-center gap-2 border-b border-dashed border-[hsl(var(--v-ad))] px-4 py-2 text-[11px] font-semibold uppercase tracking-wider text-[hsl(var(--v-ink))]">
          Реклама
          <span className="font-medium normal-case tracking-normal text-[hsl(var(--v-ink2))]">
            платное размещение, вне органической выдачи
          </span>
        </p>
      )}

      <div className="relative flex min-h-[19rem] flex-1 flex-col gap-3 p-4">
        <CardMedia card={card} />

        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-xs font-medium text-[hsl(var(--v-ink2))]">{card.kindLabel}</span>
          {card.badges.map((b) => (
            <span
              key={b.label}
              title={b.title}
              className={cn("rounded-full border px-2 py-0.5 text-[11px] font-semibold", BADGE_TONES[b.tone])}
            >
              {b.label}
            </span>
          ))}
        </div>

        <h3
          className="line-clamp-2 text-balance text-base font-semibold leading-snug tracking-tight [overflow-wrap:anywhere]"
          title={card.title}
        >
          {card.title}
        </h3>
        <p className="line-clamp-3 text-pretty text-sm leading-relaxed text-[hsl(var(--v-ink2))] [overflow-wrap:anywhere]">
          {card.summary}
        </p>

        <dl className="grid grid-cols-[5.5rem_minmax(0,1fr)] gap-x-3 gap-y-1.5 text-[13px] leading-snug">
          {card.facts.slice(0, 4).map((f) => (
            <div key={f.label} className="contents">
              <dt className="text-[hsl(var(--v-ink2))]">{f.label}</dt>
              <dd className="line-clamp-2 font-medium tabular-nums text-[hsl(var(--v-ink))] [overflow-wrap:anywhere]" title={f.value}>
                {f.value}
              </dd>
            </div>
          ))}
        </dl>

        {caution && (
          <p className="mt-auto flex items-start gap-1.5 text-xs leading-snug text-[hsl(var(--v-ink))]">
            <TriangleAlert className="mt-px size-3.5 shrink-0 text-[hsl(var(--v-ad))]" aria-hidden="true" />
            <span className="line-clamp-2 [overflow-wrap:anywhere]">{caution}</span>
          </p>
        )}

        {open && (
          <div
            id={panelId}
            role="group"
            aria-label={`Быстрый просмотр: ${card.title}`}
            data-quickview
            className={cn(styles.quickview, "absolute inset-0 z-10 flex flex-col bg-[hsl(var(--v-surface))] text-sm")}
          >
            <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto p-4" tabIndex={0} aria-label="Содержимое быстрого просмотра">
            <p className="text-xs font-semibold text-[hsl(var(--v-ink2))]">Быстрый просмотр</p>
            {card.quick.cautions.length > 0 && (
              <div>
                <p className="flex items-center gap-1.5 text-xs font-semibold">
                  <TriangleAlert className="size-3.5 text-[hsl(var(--v-ad))]" aria-hidden="true" />
                  Ограничения и осторожность
                </p>
                <ul className="mt-1.5 list-disc space-y-1 pl-5 text-[13px] leading-snug [overflow-wrap:anywhere]">
                  {card.quick.cautions.map((c, i) => (
                    <li key={i}>{c}</li>
                  ))}
                </ul>
              </div>
            )}
            {card.quick.points.length > 0 && (
              <ul className="list-disc space-y-1 pl-5 text-[13px] leading-snug text-[hsl(var(--v-ink2))] [overflow-wrap:anywhere]">
                {card.quick.points.map((p, i) => (
                  <li key={i}>{p}</li>
                ))}
              </ul>
            )}
            <p className="text-xs text-[hsl(var(--v-ink2))] [overflow-wrap:anywhere]">{card.quick.source}</p>
            </div>
            <p className="shrink-0 border-t border-[hsl(var(--v-line))] px-4 py-2 text-[11px] leading-snug text-[hsl(var(--v-ink2))]">{RISK_NOTE}</p>
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 border-t border-[hsl(var(--v-line))] px-4 py-2.5">
        {card.href ? (
          <Link
            href={card.href}
            className="inline-flex min-h-11 items-center gap-1 text-sm font-semibold whitespace-nowrap text-[hsl(var(--v-accent))] hover:underline"
          >
            {card.hrefLabel}
            <ArrowUpRight className="size-4" aria-hidden="true" />
          </Link>
        ) : (
          <span className="text-xs text-[hsl(var(--v-ink2))]">{card.hrefLabel}</span>
        )}
        <button
          type="button"
          aria-expanded={open}
          aria-controls={open ? panelId : undefined}
          onClick={toggle}
          className={cn(
            diagnostic.press,
            "inline-flex min-h-11 shrink-0 items-center gap-1.5 rounded-[var(--v-r-ctl)] border border-[hsl(var(--v-line))] bg-[hsl(var(--v-surface))] px-3 text-xs font-semibold whitespace-nowrap text-[hsl(var(--v-ink))] transition-colors hover:border-[hsl(var(--v-accent))]/50 hover:bg-[hsl(var(--v-tint))]",
          )}
        >
          {pinned ? <X className="size-4" aria-hidden="true" /> : <Eye className="size-4" aria-hidden="true" />}
          {pinned ? "Закрыть просмотр" : "Быстрый просмотр"}
        </button>
      </div>
      <motion.span aria-hidden="true" data-hot={hovered} className={styles.spotGlow} style={{ background: spotGlow }} />
      <motion.span aria-hidden="true" data-hot={hovered} className={styles.spotBorder} style={{ background: spotBorder }} />
    </article>
  );
}

export function CardSkeleton() {
  return (
    <div
      role="status"
      aria-busy="true"
      aria-label="Загрузка карточки"
      className="flex min-h-[19rem] min-w-0 flex-col gap-3 rounded-[var(--v-r-card)] border border-[hsl(var(--v-line))] bg-[hsl(var(--v-surface))] p-4"
    >
      <div className="aspect-[16/9] w-full animate-pulse rounded-[var(--v-r-ctl)] bg-[hsl(var(--v-tint))] motion-reduce:animate-none" />
      <div className="h-3 w-1/4 animate-pulse rounded bg-[hsl(var(--v-tint))] motion-reduce:animate-none" />
      <div className="h-4 w-4/5 animate-pulse rounded bg-[hsl(var(--v-tint))] motion-reduce:animate-none" />
      <div className="h-3 w-full animate-pulse rounded bg-[hsl(var(--v-tint))] motion-reduce:animate-none" />
      <div className="h-3 w-2/3 animate-pulse rounded bg-[hsl(var(--v-tint))] motion-reduce:animate-none" />
      <span className="sr-only">Загрузка…</span>
    </div>
  );
}

export function CardEmpty({ title, text, href, hrefLabel }: { title: string; text: string; href?: string; hrefLabel?: string }) {
  return (
    <div className="grid min-h-[19rem] min-w-0 place-items-center rounded-[var(--v-r-card)] border border-dashed border-[hsl(var(--v-line))] bg-[hsl(var(--v-surface))] p-6 text-center">
      <div>
        <p className="text-[15px] font-semibold">{title}</p>
        <p className="mt-1 text-sm text-[hsl(var(--v-ink2))]">{text}</p>
        {href && (
          <Link href={href} className="mt-3 inline-flex min-h-11 items-center text-sm font-semibold text-[hsl(var(--v-accent))] hover:underline">
            {hrefLabel ?? "Перейти"}
          </Link>
        )}
      </div>
    </div>
  );
}

export function CardError({ title, text, onRetry }: { title: string; text: string; onRetry?: () => void }) {
  return (
    <div
      role="alert"
      className="grid min-h-[19rem] min-w-0 place-items-center rounded-[var(--v-r-card)] border border-[hsl(var(--v-ad))] bg-[hsl(var(--v-surface))] p-6 text-center"
    >
      <div>
        <TriangleAlert className="mx-auto size-6 text-[hsl(var(--v-ad))]" aria-hidden="true" />
        <p className="mt-2 text-[15px] font-semibold">{title}</p>
        <p className="mt-1 text-sm text-[hsl(var(--v-ink2))]">{text}</p>
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="mt-3 inline-flex min-h-11 items-center rounded-[var(--v-r-ctl)] border border-[hsl(var(--v-line))] px-4 text-sm font-semibold"
          >
            Повторить
          </button>
        )}
      </div>
    </div>
  );
}
