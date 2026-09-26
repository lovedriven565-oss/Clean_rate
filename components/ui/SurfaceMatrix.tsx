import { AlertTriangle, Check, X } from "lucide-react";
import { surfaceLabel, surfaceVerdict, type SurfaceVerdict } from "@/lib/ph";
import type { ProductSafetyProfile } from "@/lib/types";
import { cn } from "@/lib/utils";

const verdictMeta: Record<SurfaceVerdict, { label: string; icon: typeof Check; className: string }> = {
  ok: { label: "Можно", icon: Check, className: "text-success" },
  caution: { label: "Осторожно", icon: AlertTriangle, className: "text-star" },
  forbidden: { label: "Нельзя", icon: X, className: "text-danger" },
};

/**
 * Совместимость средства с поверхностями: можно / осторожно / нельзя.
 * Вердикт считает тот же фильтр безопасности, что допускает рекламу.
 */
export function SurfaceMatrix({
  product,
  surfaces,
  className,
}: {
  product: ProductSafetyProfile;
  surfaces: string[];
  className?: string;
}) {
  return (
    <ul className={cn("grid gap-px overflow-hidden rounded-control border border-border bg-border sm:grid-cols-2", className)}>
      {surfaces.map((surface) => {
        const { verdict, reason } = surfaceVerdict(product, surface);
        const meta = verdictMeta[verdict];
        const Icon = meta.icon;
        return (
          <li key={surface} title={reason} className="flex items-center justify-between gap-3 bg-card px-3.5 py-2.5 text-sm">
            <span className="text-foreground">{surfaceLabel(surface)}</span>
            <span className={cn("inline-flex items-center gap-1.5 text-xs font-medium", meta.className)}>
              <Icon className="h-3.5 w-3.5" />
              {meta.label}
            </span>
          </li>
        );
      })}
    </ul>
  );
}
