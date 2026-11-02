import { FlaskConical } from "lucide-react";
import { SITE_NAME, SITE_TLD } from "@/lib/site";
import { cn } from "@/lib/utils";

/**
 * Единый знак бренда в стиле Lovable: лаймовый квадрат с колбой + название
 * с доменным акцентом .pro. Используется в шапке и футере; растровые версии
 * того же знака рисуют app/icon.tsx и OG-картинки.
 */
export function BrandMark({ className }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={cn(
        "flex h-9 w-9 shrink-0 items-center justify-center rounded-control bg-lime text-ink",
        className
      )}
    >
      <FlaskConical className="h-4.5 w-4.5" strokeWidth={2.2} />
    </span>
  );
}

export function BrandLogo({ className, markClassName, nameClassName }: { className?: string; markClassName?: string; nameClassName?: string }) {
  return (
    <span className={cn("flex min-w-0 items-center gap-2.5", className)}>
      <BrandMark className={markClassName} />
      <span className={cn("flex min-w-0 items-baseline gap-1 truncate font-display text-sm font-bold tracking-[-0.02em] sm:text-base", nameClassName)}>
        <span>{SITE_NAME}</span>
        <span className="rounded-[6px] bg-lime px-1.5 py-0.5 font-data text-[10px] font-bold uppercase leading-none tracking-tight text-ink">
          {SITE_TLD}
        </span>
      </span>
    </span>
  );
}
