"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import { MotionConfig, useReducedMotion } from "motion/react";

/**
 * Глобально отключает transform-анимации motion для пользователей с prefers-reduced-motion
 * и включает плавный инерционный скролл Lenis на десктопе (с автоматическим отключением при reduced motion).
 */
export function MotionProvider({ children }: { children: React.ReactNode }) {
  const reduce = useReducedMotion();

  useEffect(() => {
    if (reduce) return;
    if (typeof window === "undefined") return;

    const lenis = new Lenis({
      duration: 1.05,
      smoothWheel: true,
      syncTouch: false,
      wheelMultiplier: 0.95,
    });

    let rafId = 0;
    function raf(time: number) {
      lenis.raf(time);
      rafId = window.requestAnimationFrame(raf);
    }
    rafId = window.requestAnimationFrame(raf);

    return () => {
      window.cancelAnimationFrame(rafId);
      lenis.destroy();
    };
  }, [reduce]);

  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
