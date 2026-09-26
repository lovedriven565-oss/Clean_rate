import Link from "next/link";
import { MapPinned, Search } from "lucide-react";
import { Button } from "@/components/ui/primitives";

interface RatingEmptyStateProps {
  onReset: () => void;
  /** Компаний в выбранном регионе вообще нет (не связано с фильтрами) */
  noCompaniesInRegion?: boolean;
  regionName?: string;
}

export function RatingEmptyState({ onReset, noCompaniesInRegion, regionName }: RatingEmptyStateProps) {
  if (noCompaniesInRegion) {
    return (
      <div className="flex flex-col items-center gap-4 py-20 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-control bg-muted">
          <MapPinned className="h-7 w-7 text-muted-foreground" />
        </div>
        <div>
          <h3 className="font-display text-lg font-semibold text-foreground">
            В регионе {regionName ?? "этом"} компании пока не подключены
          </h3>
          <p className="max-w-sm text-sm text-muted-foreground">
            Платформа расширяется по городам. Смените регион в шапке сайта или предложите компанию для размещения.
          </p>
        </div>
        <Link
          href="/for-partners"
          className="inline-flex h-11 items-center justify-center gap-2 rounded-full border border-border bg-card/70 px-6 text-sm font-semibold text-foreground transition-colors hover:border-primary/35 hover:bg-muted/70"
        >
          Разместить компанию
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-4 py-20 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-control bg-muted">
        <Search className="h-7 w-7 text-muted-foreground" />
      </div>
      <div>
        <h3 className="font-display text-lg font-semibold text-foreground">Ничего не найдено</h3>
        <p className="max-w-sm text-sm text-muted-foreground">
          Попробуйте изменить фильтры, категорию или город. Или сбросьте фильтры и посмотрите весь каталог.
        </p>
      </div>
      <Button variant="outline" onClick={onReset}>
        Сбросить фильтры
      </Button>
    </div>
  );
}
