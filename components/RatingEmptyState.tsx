import { Search } from "lucide-react";
import { Button } from "@/components/ui/primitives";

interface RatingEmptyStateProps {
  onReset: () => void;
}

export function RatingEmptyState({ onReset }: RatingEmptyStateProps) {
  return (
    <div className="flex flex-col items-center gap-4 py-20 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
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
