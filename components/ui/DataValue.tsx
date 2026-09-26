import { cn } from "@/lib/utils";

const sizeClass = {
  sm: "text-sm",
  md: "text-xl",
  lg: "text-4xl",
} as const;

/**
 * Показание прибора: моноширинное число с единицей и подписью.
 * Для pH, цен, баллов, сроков — всего, что пользователь сравнивает глазами.
 */
export function DataValue({
  value,
  unit,
  label,
  size = "md",
  className,
}: {
  value: string | number;
  unit?: string;
  label?: string;
  size?: keyof typeof sizeClass;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-1", className)}>
      {label && <span className="text-xs text-muted-foreground">{label}</span>}
      <span className={cn("font-data font-medium leading-none text-foreground", sizeClass[size])}>
        {value}
        {unit && <span className="ml-1 text-[0.6em] font-normal text-muted-foreground">{unit}</span>}
      </span>
    </div>
  );
}
