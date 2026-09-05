"use client";

import Link from "next/link";
import { useRef } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "motion/react";
import { ArrowUpRight, Ticket } from "lucide-react";
import type { Brand } from "@/lib/types";
import { focusLabels } from "@/lib/brand-utils";

export function BrandCard({ brand, size = "sm" }: { brand: Brand; size?: "sm" | "lg" }) {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [8, -8]), { stiffness: 300, damping: 25 });
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-8, 8]), { stiffness: 300, damping: 25 });

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    x.set((e.clientX - rect.left) / rect.width - 0.5);
    y.set((e.clientY - rect.top) / rect.height - 0.5);
  }

  function handleMouseLeave() {
    x.set(0);
    y.set(0);
  }

  return (
    <Link href={`/brands/${brand.slug}`} className={size === "lg" ? "sm:col-span-2 sm:row-span-2" : ""}>
      <motion.div
        ref={ref}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{ rotateX, rotateY, transformPerspective: 800 }}
        whileHover={{ scale: 1.02 }}
        className="group relative flex h-full flex-col justify-between gap-6 overflow-hidden rounded-[var(--radius)] border border-border/60 bg-card/60 p-6 backdrop-blur-sm transition-shadow hover:shadow-2xl"
      >
        <div
          aria-hidden
          className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full opacity-20 blur-3xl transition-opacity duration-500 group-hover:opacity-40"
          style={{ backgroundColor: brand.accent }}
        />

        <div className="relative flex items-start justify-between gap-3">
          <span
            className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-lg font-bold text-white shadow-lg"
            style={{ backgroundColor: brand.accent }}
          >
            {brand.name.charAt(0)}
          </span>
          <span className="rounded-full border border-border bg-background/80 px-2.5 py-1 text-[11px] font-medium text-muted-foreground">
            {focusLabels[brand.focus]}
          </span>
        </div>

        <div className="relative flex flex-col gap-2">
          <h3 className="text-lg font-bold text-foreground">{brand.name}</h3>
          <p className="text-sm text-muted-foreground">{brand.tagline}</p>
          {size === "lg" && (
            <p className="mt-1 line-clamp-2 text-sm text-muted-foreground/80">{brand.description}</p>
          )}
        </div>

        <div className="relative flex items-center justify-between pt-2">
          {brand.discountCode ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-3 py-1 text-xs font-semibold text-foreground">
              <Ticket className="h-3.5 w-3.5" />
              {brand.discountCode}
            </span>
          ) : (
            <span />
          )}
          <span className="flex items-center gap-1 text-sm font-medium text-foreground opacity-0 transition-opacity group-hover:opacity-100">
            Смотреть
            <ArrowUpRight className="h-3.5 w-3.5" />
          </span>
        </div>
      </motion.div>
    </Link>
  );
}
