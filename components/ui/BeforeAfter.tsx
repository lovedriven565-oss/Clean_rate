"use client";

import { useEffect, useRef, useState, type KeyboardEvent, type PointerEvent } from "react";
import Image from "next/image";
import { animate, useInView, useReducedMotion, type AnimationPlaybackControls } from "motion/react";
import { MoveHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";

/** Приглашающий микродвиг шторки при первом появлении в кадре: 66% → 56%. */
const INVITE_KEYFRAMES = [66, 56];

interface BeforeAfterProps {
  /** Кадр «до» — оригинал (на нём же видно загрязнение). */
  src: string;
  className?: string;
  sizes?: string;
  priority?: boolean;
  defaultPosition?: number;
}

function clamp(value: number) {
  return Math.min(97, Math.max(3, value));
}

/**
 * Слайдер «до/после» поверх одного кадра: слева оригинал с загрязнением,
 * справа — стилизованный «чистый» вариант того же изображения (светлее, бледнее).
 * Это иллюстрация эффекта, а не фотография результата — помечается визуально чипами.
 * Drag по области + клавиатура (стрелки/Home/End), не мешает вертикальному скроллу.
 */
export function BeforeAfter({ src, className, sizes = "100vw", priority, defaultPosition = 58 }: BeforeAfterProps) {
  const [pos, setPos] = useState(defaultPosition);
  const rootRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);
  const touched = useRef(false);
  const invite = useRef<AnimationPlaybackControls | null>(null);
  const reduce = useReducedMotion();
  const inView = useInView(rootRef, { once: true, amount: 0.6 });

  // «Лазерная шторка» сама показывает, что её можно двигать; любое касание пользователя её останавливает.
  useEffect(() => {
    if (!inView || reduce || touched.current) return;
    const controls = animate(defaultPosition, [defaultPosition, ...INVITE_KEYFRAMES], {
      duration: 1.5,
      delay: 0.35,
      times: [0, 0.45, 1],
      ease: "easeInOut",
      onUpdate: setPos,
    });
    invite.current = controls;
    return () => controls.stop();
  }, [inView, reduce, defaultPosition]);

  function takeOver() {
    touched.current = true;
    invite.current?.stop();
  }

  function updateFromClientX(clientX: number) {
    const rect = rootRef.current?.getBoundingClientRect();
    if (!rect || rect.width === 0) return;
    setPos(clamp(((clientX - rect.left) / rect.width) * 100));
  }

  function onPointerDown(e: PointerEvent<HTMLDivElement>) {
    if (e.button !== 0) return;
    takeOver();
    dragging.current = true;
    e.currentTarget.setPointerCapture(e.pointerId);
    updateFromClientX(e.clientX);
  }
  function onPointerMove(e: PointerEvent<HTMLDivElement>) {
    if (!dragging.current) return;
    updateFromClientX(e.clientX);
  }
  function onPointerUp(e: PointerEvent<HTMLDivElement>) {
    dragging.current = false;
    e.currentTarget.releasePointerCapture(e.pointerId);
  }
  function onKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    takeOver();
    if (e.key === "ArrowLeft" || e.key === "ArrowDown") {
      e.preventDefault();
      setPos((p) => clamp(p - 6));
    } else if (e.key === "ArrowRight" || e.key === "ArrowUp") {
      e.preventDefault();
      setPos((p) => clamp(p + 6));
    } else if (e.key === "Home") {
      e.preventDefault();
      setPos(3);
    } else if (e.key === "End") {
      e.preventDefault();
      setPos(97);
    }
  }

  return (
    <div
      ref={rootRef}
      role="slider"
      tabIndex={0}
      aria-label="Сравнение «до и после»: иллюстрация эффекта чистки, перетащите разделитель"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(pos)}
      aria-orientation="horizontal"
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      onKeyDown={onKeyDown}
      className={cn(
        "absolute inset-0 cursor-ew-resize select-none overflow-hidden outline-none [touch-action:pan-y]",
        "focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand",
        className,
      )}
    >
      {/* «После» — стилизованная чистая версия кадра (светлее и спокойнее) */}
      <Image
        src={src}
        alt=""
        fill
        priority={priority}
        sizes={sizes}
        draggable={false}
        className="object-cover brightness-[1.1] saturate-[0.7]"
      />
      {/* «До» — оригинал, обрезан слева до разделителя */}
      <div aria-hidden className="absolute inset-0" style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }}>
        <Image src={src} alt="" fill priority={priority} sizes={sizes} draggable={false} className="object-cover" />
      </div>

      {/* Лазерный разделитель: мягкое свечение + яркий луч + капсула-ручка */}
      <div aria-hidden className="absolute inset-y-0 z-10 w-0" style={{ left: `${pos}%` }}>
        <span className="absolute inset-y-0 -left-[4px] w-[8px] bg-gradient-to-b from-transparent via-brand/60 to-transparent blur-[3px]" />
        <span className="absolute inset-y-0 -left-px w-[2px] bg-gradient-to-b from-transparent via-brand to-transparent" />
        <span className="absolute left-0 top-1/2 flex h-12 w-7 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-brand/70 bg-black/55 text-white shadow-[0_0_20px_hsl(var(--brand)/0.5)] backdrop-blur-sm">
          <MoveHorizontal className="size-3.5" aria-hidden />
        </span>
      </div>

      {/* Чипы сторон */}
      <span
        aria-hidden
        className={cn(
          "absolute left-3 top-3 z-10 rounded-full bg-black/55 px-2.5 py-1 text-[11px] font-semibold text-white backdrop-blur-sm transition-opacity",
          pos < 18 && "opacity-30",
        )}
      >
        До
      </span>
      <span
        aria-hidden
        className={cn(
          "absolute right-3 top-3 z-10 rounded-full bg-black/55 px-2.5 py-1 text-[11px] font-semibold text-white backdrop-blur-sm transition-opacity",
          pos > 82 && "opacity-30",
        )}
      >
        После
      </span>
    </div>
  );
}
