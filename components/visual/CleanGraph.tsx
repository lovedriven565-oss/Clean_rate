import { ArrowUpRight, Boxes, Building2, Network, Users } from "lucide-react";
import { brands, companies } from "@/lib/mock-data";

const nodes = [
  { label: "Компании", value: companies.length, icon: Building2, position: "left-4 top-5 sm:left-8 sm:top-8" },
  { label: "Бренды", value: brands.length, icon: Boxes, position: "right-4 top-14 sm:right-8 sm:top-16" },
  { label: "Поставщики", value: "B2B", icon: Network, position: "bottom-8 left-8 sm:bottom-10 sm:left-16" },
  { label: "Заказчики", value: "B2C", icon: Users, position: "bottom-4 right-4 sm:bottom-8 sm:right-12" },
];

export function CleanGraph() {
  return (
    <div className="data-surface relative min-h-[360px] rounded-[2rem] border border-border/80 p-5 sm:min-h-[430px] sm:p-8">
      <div className="bg-grid-fade absolute inset-0" aria-hidden />
      <svg viewBox="0 0 520 420" className="absolute inset-0 h-full w-full" aria-hidden>
        <defs>
          <linearGradient id="clean-line" x1="0" x2="1">
            <stop offset="0" stopColor="hsl(var(--primary))" stopOpacity="0.12" />
            <stop offset="0.5" stopColor="hsl(var(--accent))" stopOpacity="0.58" />
            <stop offset="1" stopColor="hsl(var(--primary))" stopOpacity="0.12" />
          </linearGradient>
        </defs>
        <path d="M112 98 C210 90 220 188 342 126" fill="none" stroke="url(#clean-line)" strokeWidth="1.5" />
        <path d="M108 104 C138 214 224 254 158 324" fill="none" stroke="url(#clean-line)" strokeWidth="1.5" />
        <path d="M356 128 C392 212 326 262 396 330" fill="none" stroke="url(#clean-line)" strokeWidth="1.5" />
        <path d="M164 326 C238 274 316 356 396 332" fill="none" stroke="url(#clean-line)" strokeWidth="1.5" />
        <path d="M110 100 C250 190 258 260 396 330" fill="none" stroke="hsl(var(--primary))" strokeOpacity="0.12" strokeDasharray="5 8" />
      </svg>

      <div className="absolute left-1/2 top-1/2 flex h-28 w-28 -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center rounded-full border border-primary/25 bg-card/90 text-center shadow-[0_0_70px_hsl(var(--surface-glow)/0.2)] backdrop-blur">
        <span className="clean-node mb-2 flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground">
          <Network className="h-4 w-4" />
        </span>
        <strong className="font-display text-sm text-foreground">Clean Graph</strong>
        <span className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">market data</span>
      </div>

      {nodes.map((node) => (
        <div key={node.label} className={`absolute ${node.position} w-34 rounded-2xl border border-border/80 bg-card/86 p-3 shadow-lg shadow-foreground/5 backdrop-blur-sm sm:w-40 sm:p-4`}>
          <div className="flex items-center justify-between gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <node.icon className="h-4 w-4" />
            </span>
            <ArrowUpRight className="h-3.5 w-3.5 text-muted-foreground" />
          </div>
          <div className="mt-3 font-display text-xl font-bold text-foreground">{node.value}</div>
          <div className="text-xs text-muted-foreground">{node.label}</div>
        </div>
      ))}
    </div>
  );
}
