import Image from "next/image";
import { ExternalLink } from "lucide-react";
import type { AffiliateProduct } from "@/lib/types";

export function ProductCard({ product }: { product: AffiliateProduct; index?: number }) {
  return (
    <a
      href={product.affiliateUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex flex-col overflow-hidden rounded-[var(--radius)] border border-border bg-card transition-[transform,border-color,box-shadow] duration-200 hover:-translate-y-1 hover:border-primary/25 hover:shadow-xl"
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-muted">
        <Image
          src={product.image}
          alt={product.name}
          fill
          sizes="(max-width: 768px) 100vw, 25vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <span className="absolute right-3 top-3 rounded-full border border-border/70 bg-card/90 px-2.5 py-1 text-[10px] font-semibold text-muted-foreground backdrop-blur">
          Внешний ресурс
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-3 p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-foreground">{product.name}</h3>
          <ExternalLink className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
        </div>
        <ul className="flex flex-col gap-1 text-xs text-muted-foreground">
          {product.pros.slice(0, 3).map((pro) => (
            <li key={pro} className="flex items-center gap-1.5">
              <span className="h-1 w-1 shrink-0 rounded-full bg-primary" />
              {pro}
            </li>
          ))}
        </ul>
        <p className="mt-auto pt-2 text-[11px] leading-5 text-muted-foreground">
          Характеристики, наличие и стоимость проверяйте на сайте продавца.
        </p>
      </div>
    </a>
  );
}
