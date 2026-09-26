"use client";

import { MotionConfig, motion } from "motion/react";
import { cn } from "@/lib/utils";

/** Плавное появление секции при скролле. Уважает prefers-reduced-motion через MotionConfig в HomeMotion. */
export function Reveal({
  children,
  className,
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  return (
    <motion.div
      className={cn(className)}
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-10% 0px" }}
      transition={{ duration: 0.55, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}

/** Корневая конфигурация motion для главной: отключает анимации, если пользователь просил меньше движения. */
export function HomeMotion({ children }: { children: React.ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
