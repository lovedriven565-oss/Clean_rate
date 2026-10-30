"use client";

import { MotionConfig } from "motion/react";
import { InView } from "@/components/ui/in-view";
import { cn } from "@/lib/utils";

/** Плавное появление секции при скролле (InView из реестра). Уважает prefers-reduced-motion через MotionConfig в HomeMotion. */
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
    <InView
      className={cn(className)}
      variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } }}
      transition={{ duration: 0.55, delay, ease: [0.16, 1, 0.3, 1] }}
      viewOptions={{ margin: "-10% 0px" }}
      once
    >
      {children}
    </InView>
  );
}

/** Корневая конфигурация motion для главной: отключает анимации, если пользователь просил меньше движения. */
export function HomeMotion({ children }: { children: React.ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
