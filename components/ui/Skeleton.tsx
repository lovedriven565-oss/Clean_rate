import { cn } from "@/lib/utils";

/** Заготовка формы контента на время загрузки (вместо спиннера). */
export function Skeleton({ className }: { className?: string }) {
  return <span aria-hidden className={cn("block animate-pulse rounded-control bg-muted", className)} />;
}
