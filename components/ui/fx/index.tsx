"use client";

import { useId, useRef, useSyncExternalStore, type PointerEvent, type ReactNode } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { motion, useMotionTemplate, useMotionValue, useReducedMotion, useSpring } from "motion/react";
import { BRAND_COLORS } from "@/lib/site";
import { cn, nextRadioIndex } from "@/lib/utils";

/** Карточка с подсветкой фона и границы под курсором (позиция в motion values, без ререндеров). */
export function SpotlightCard({ children, className }: { children: ReactNode; className?: string }) {
  const x = useMotionValue(-999);
  const y = useMotionValue(-999);
  const fill = useMotionTemplate`radial-gradient(380px circle at ${x}px ${y}px, hsl(var(--brand) / 0.13), transparent 70%)`;
  const edge = useMotionTemplate`radial-gradient(220px circle at ${x}px ${y}px, hsl(var(--brand) / 0.95), transparent 70%)`;

  function onMove(e: PointerEvent<HTMLElement>) {
    const r = e.currentTarget.getBoundingClientRect();
    x.set(e.clientX - r.left);
    y.set(e.clientY - r.top);
  }

  return (
    <div onPointerMove={onMove} className={cn("data-surface group/spot relative isolate overflow-hidden rounded-panel", className)}>
      <motion.div
        aria-hidden
        style={{ background: fill }}
        className="pointer-events-none absolute inset-0 -z-10 opacity-0 transition-opacity duration-300 group-hover/spot:opacity-100"
      />
      <motion.div
        aria-hidden
        style={{ background: edge }}
        className="fx-edge pointer-events-none absolute inset-0 z-20 rounded-[inherit] p-px opacity-0 transition-opacity duration-300 group-hover/spot:opacity-100"
      />
      {children}
    </div>
  );
}

/** 3D-наклон за курсором: только мышь, не на тач, выключается при reduced-motion. */
export function Tilt({ children, className, max = 5 }: { children: ReactNode; className?: string; max?: number }) {
  const reduce = useReducedMotion();
  const rx = useSpring(0, { stiffness: 220, damping: 22 });
  const ry = useSpring(0, { stiffness: 220, damping: 22 });

  function onMove(e: PointerEvent<HTMLElement>) {
    if (reduce || e.pointerType !== "mouse") return;
    const r = e.currentTarget.getBoundingClientRect();
    ry.set(((e.clientX - r.left) / r.width - 0.5) * max * 2);
    rx.set(-((e.clientY - r.top) / r.height - 0.5) * max * 2);
  }
  function reset() {
    rx.set(0);
    ry.set(0);
  }

  return (
    <div style={{ perspective: 900 }} className={className}>
      <motion.div
        onPointerMove={onMove}
        onPointerLeave={reset}
        style={{ rotateX: rx, rotateY: ry, transformStyle: "preserve-3d" }}
        className="h-full"
      >
        {children}
      </motion.div>
    </div>
  );
}

/** CTA с бегущей рамкой (Aceternity moving border). */
export function GlowLink({ href, children, className }: { href: string; children: ReactNode; className?: string }) {
  return (
    <Link
      href={href}
      className={cn(
        "relative inline-flex overflow-hidden rounded-full bg-brand/35 p-[1.5px] transition-transform active:scale-[0.98]",
        className,
      )}
    >
      <span
        aria-hidden
        className="fx-spin absolute left-1/2 top-1/2 aspect-square w-[300%]"
        style={{ background: "conic-gradient(from 0deg, transparent 0 62%, hsl(var(--foreground)) 88%, transparent 100%)" }}
      />
      <span className="relative inline-flex min-h-11 items-center gap-2 rounded-full bg-brand px-6 text-sm font-semibold text-brand-foreground">
        {children}
      </span>
    </Link>
  );
}

/** Заголовок: слова проявляются каскадом (spring), accent-слова выделяются цветом ссылки. */
export function RevealText({
  parts,
  className,
}: {
  parts: { text: string; accent?: boolean }[];
  className?: string;
}) {
  const reduce = useReducedMotion();
  const label = parts.map((p) => p.text).join(" ");
  let index = 0;
  return (
    <h1 aria-label={label} className={className}>
      {parts.flatMap((part) =>
        part.text.split(" ").map((word) => (
          <motion.span
            key={index}
            aria-hidden
            initial={reduce ? false : { opacity: 0, y: 18, filter: "blur(8px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ type: "spring", stiffness: 130, damping: 20, delay: index++ * 0.05 }}
            className={cn("mr-[0.24em] inline-block", part.accent && "text-link")}
          >
            {word}
          </motion.span>
        )),
      )}
    </h1>
  );
}

const MeshGradient = dynamic(() => import("@paper-design/shaders-react").then((m) => m.MeshGradient), {
  ssr: false,
});

const MESH_COLORS = [BRAND_COLORS.brand, "#00000000", BRAND_COLORS.mint, "#00000000", BRAND_COLORS.primaryBright];
const LIVE_SHADER_QUERY = "(min-width: 1024px) and (prefers-reduced-motion: no-preference)";

function subscribeLiveShader(onChange: () => void) {
  const mql = window.matchMedia(LIVE_SHADER_QUERY);
  mql.addEventListener("change", onChange);
  return () => mql.removeEventListener("change", onChange);
}

function liveShaderAllowed() {
  const saveData = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData;
  return window.matchMedia(LIVE_SHADER_QUERY).matches && !saveData;
}

/**
 * Фон hero: два мягких CSS-пятна (лайм и мята) + зерно — SSR и фолбэк.
 * На lg+ поверх лениво грузится живой MeshGradient; вне экрана и в фоновой вкладке
 * библиотека сама останавливает рендер.
 */
export function Aurora() {
  const live = useSyncExternalStore(subscribeLiveShader, liveShaderAllowed, () => false);
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      <div
        className="fx-drift absolute -left-[8%] -top-[30%] h-[75%] w-[52%] rounded-full blur-3xl"
        style={{ background: "hsl(var(--brand) / var(--aurora))" }}
      />
      <div
        className="fx-drift2 absolute -right-[10%] top-[5%] h-[65%] w-[44%] rounded-full blur-3xl"
        style={{ background: "hsl(var(--mint) / var(--aurora))" }}
      />
      {live && (
        <MeshGradient
          colors={MESH_COLORS}
          distortion={0.7}
          swirl={0.25}
          speed={0.18}
          minPixelRatio={1}
          maxPixelCount={1600 * 900}
          className="fx-fade-in absolute inset-0"
          style={{ opacity: "calc(var(--aurora) * 1.1)" }}
        />
      )}
      <div className="fx-grain absolute inset-0" />
    </div>
  );
}

export interface PillOption {
  id: string;
  label: string;
  meta?: string;
}

/** Radiogroup-табы: выделение переезжает через layoutId, стрелки/Home/End двигают выбор. */
export function PillTabs({
  label,
  options,
  value,
  onChange,
  className,
}: {
  label: string;
  options: PillOption[];
  value: string | null;
  onChange: (id: string) => void;
  className?: string;
}) {
  const uid = useId();
  const reduce = useReducedMotion() ?? false;
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const selectedIndex = options.findIndex((o) => o.id === value);

  function onKeyDown(e: React.KeyboardEvent, index: number) {
    const next = nextRadioIndex(e.key, index, options.length);
    if (next === null) return;
    e.preventDefault();
    refs.current[next]?.focus();
    onChange(options[next].id);
  }

  return (
    <div
      role="radiogroup"
      aria-label={label}
      className={cn(
        "no-scrollbar -mx-1 flex gap-1.5 overflow-x-auto px-1 pb-1 sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0 sm:pb-0",
        className,
      )}
    >
      {options.map((option, index) => {
        const selected = index === selectedIndex;
        return (
          <button
            key={option.id}
            ref={(el) => {
              refs.current[index] = el;
            }}
            type="button"
            role="radio"
            aria-checked={selected}
            tabIndex={selected || (selectedIndex < 0 && index === 0) ? 0 : -1}
            onClick={() => onChange(option.id)}
            onKeyDown={(e) => onKeyDown(e, index)}
            className={cn(
              "relative inline-flex min-h-11 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border px-4 text-sm font-medium transition-colors active:scale-[0.98]",
              selected
                ? "border-transparent text-brand-foreground"
                : "border-border bg-card hover:border-brand/60",
            )}
          >
            {selected && (
              <motion.span
                layoutId={`${uid}-pill`}
                transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 380, damping: 32 }}
                aria-hidden
                className="absolute inset-0 rounded-full bg-brand shadow-[0_8px_22px_-10px_hsl(var(--brand)/0.8)]"
              />
            )}
            <span className="relative">{option.label}</span>
            {option.meta && (
              <span className={cn("relative font-mono text-xs tabular-nums", !selected && "text-muted-foreground")}>{option.meta}</span>
            )}
          </button>
        );
      })}
    </div>
  );
}
