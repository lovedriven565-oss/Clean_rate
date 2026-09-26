import { AD_MARK_LABEL } from "@/lib/ads/presentation";
import { cn } from "@/lib/utils";

/**
 * Постоянная маркировка рекламы: слово «Реклама» + формат размещения обычным текстом.
 * Читается на смартфоне без hover/title; нейтральный графит — не имитирует органические
 * плашки («Проверено», «Выбор профессионалов») и золотой статус спонсора компании.
 */
export function AdBadge({
  text,
  tone = "light",
  className,
}: {
  text: string;
  tone?: "light" | "dark";
  className?: string;
}) {
  const showFormat = text.trim().toLowerCase() !== AD_MARK_LABEL.toLowerCase();
  return (
    <span
      className={cn(
        "inline-flex h-7 shrink-0 items-center gap-2 rounded-full border px-2.5 text-[11px] font-semibold leading-none",
        tone === "dark"
          ? "border-white/15 bg-white/10 text-white/85"
          : "border-foreground/10 bg-foreground/[0.045] text-foreground/75",
        className
      )}
    >
      <span className="uppercase tracking-[0.14em]">{AD_MARK_LABEL}</span>
      {showFormat && (
        <>
          <span aria-hidden className="h-3 w-px bg-current opacity-30" />
          <span>{text}</span>
        </>
      )}
    </span>
  );
}
