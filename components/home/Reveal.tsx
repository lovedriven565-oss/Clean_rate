"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Плавное появление секции при скролле на нативном IntersectionObserver +
 * CSS-переходе. Не тянет motion/react в критический бандл главной (TBT).
 * prefers-reduced-motion учитывается медиа-запросом в globals.css (.reveal-*).
 */
export function Reveal({
  children,
  className,
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setVisible(true);
            observer.disconnect();
          }
        }
      },
      { rootMargin: "-10% 0px" }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={cn("reveal-base", visible && "reveal-visible", className)}
      style={delay > 0 ? { transitionDelay: `${delay}s` } : undefined}
    >
      {children}
    </div>
  );
}

/** Корневая обёртка главной: сохранена как семантический маркер, motion не тянет. */
export function HomeMotion({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
