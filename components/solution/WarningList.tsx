import { TriangleAlert } from "lucide-react";
import { cn } from "@/lib/utils";

export function WarningList({ warnings, className }: { warnings: string[]; className?: string }) {
  if (warnings.length === 0) return null;

  return (
    <div
      role="alert"
      className={cn("rounded-panel border border-danger/25 bg-danger/[0.06] p-5", className)}
    >
      <div className="flex items-center gap-2 text-danger">
        <TriangleAlert className="h-4 w-4" />
        <span className="text-xs font-bold uppercase tracking-[0.16em]">Чего нельзя делать</span>
      </div>
      <ul className="mt-3 space-y-2.5">
        {warnings.map((warning) => (
          <li key={warning} className="flex gap-3 text-sm leading-6 text-foreground/90">
            <span className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-danger" aria-hidden />
            <span>{warning}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
