import { Award, BadgeCheck, Crown, Trophy } from "lucide-react";
import { cn } from "@/lib/utils";

export type StatusBadgeVariant = "sponsor" | "verified" | "prosChoice" | "testWinner";

const variants: Record<
  StatusBadgeVariant,
  { label: string; title: string; icon: typeof Crown; className: string }
> = {
  sponsor: {
    label: "Спонсор",
    title: "Платное размещение. Органический рейтинг не зависит от оплаты.",
    icon: Crown,
    className: "bg-sponsor text-sponsor-foreground",
  },
  verified: {
    label: "Проверено",
    title: "Юрлицо, контакты и источник отзывов проверены редакцией.",
    icon: BadgeCheck,
    className: "bg-primary/10 text-primary",
  },
  prosChoice: {
    label: "Выбор профессионалов",
    title: "Лидер индекса доверия профи в своей категории.",
    icon: Award,
    className: "shimmer-badge text-accent-foreground",
  },
  testWinner: {
    label: "Победитель теста",
    title: "Лучший результат в открытом тесте CLEANHUB.",
    icon: Trophy,
    className: "bg-foreground text-background",
  },
};

/**
 * Единый язык статусов платформы. Платные статусы (sponsor) всегда несут подпись «платное»
 * через title, чтобы маркировка оставалась честной в любом контексте.
 */
export function StatusBadge({
  variant,
  size = "sm",
  label,
  className,
}: {
  variant: StatusBadgeVariant;
  size?: "sm" | "md";
  label?: string;
  className?: string;
}) {
  const v = variants[variant];
  const Icon = v.icon;
  return (
    <span
      title={v.title}
      className={cn(
        "inline-flex shrink-0 items-center gap-1 rounded-full font-semibold uppercase tracking-wide",
        size === "sm" ? "px-2 py-0.5 text-[10px]" : "px-3 py-1 text-xs",
        v.className,
        className
      )}
    >
      <Icon className={size === "sm" ? "h-3 w-3" : "h-3.5 w-3.5"} />
      {label ?? v.label}
    </span>
  );
}
