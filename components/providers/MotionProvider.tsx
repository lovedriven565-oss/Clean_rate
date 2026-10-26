"use client";

import { MotionConfig } from "motion/react";

/**
 * Глобально отключает transform-анимации motion для пользователей с prefers-reduced-motion,
 * сохраняя мгновенный нативный скролл браузера без перехвата колеса мыши.
 */
export function MotionProvider({ children }: { children: React.ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
