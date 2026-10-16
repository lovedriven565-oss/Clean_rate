import Link from "next/link";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

/** Единый вид хлебных крошек — используется на /rating, /brands, /companies/[slug], /solutions/[slug] */
export function Breadcrumbs({ items, className }: { items: BreadcrumbItem[]; className?: string }) {
  return (
    <nav aria-label="Хлебные крошки" className={className ?? "text-xs text-muted-foreground"}>
      <ol className="flex flex-wrap items-center gap-2">
        {items.map((item, index) => (
          <li key={`${item.label}-${index}`} className="flex min-w-0 items-center gap-2">
            {index > 0 && <span aria-hidden>/</span>}
            {item.href ? (
              <Link href={item.href} className="hover:text-foreground">
                {item.label}
              </Link>
            ) : (
              <span aria-current="page" className="max-w-[52vw] truncate text-foreground sm:max-w-none">
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
