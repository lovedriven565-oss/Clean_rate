import { formatNumber } from "@/lib/format";

export function StatCounter({
  value,
  suffix = "",
  decimals = 0,
  label,
}: {
  value: number;
  suffix?: string;
  decimals?: number;
  label: string;
}) {
  return (
    <div className="flex flex-col items-center gap-1 text-center">
      <span className="font-data text-3xl font-medium text-foreground sm:text-4xl">
        {decimals ? value.toFixed(decimals) : formatNumber(value)}
        {suffix}
      </span>
      <span className="text-sm text-muted-foreground">{label}</span>
    </div>
  );
}
