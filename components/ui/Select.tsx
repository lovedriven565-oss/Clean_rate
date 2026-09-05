"use client";

import { Select as BaseSelect } from "@base-ui/react/select";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export interface SelectOption {
  value: string;
  label: string;
}

export function Select({
  value,
  onChange,
  options,
  icon,
  label,
  className,
}: {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  icon?: React.ReactNode;
  label?: string;
  className?: string;
}) {
  return (
    <BaseSelect.Root
      items={options}
      value={value}
      onValueChange={(nextValue) => {
        if (nextValue !== null) onChange(nextValue);
      }}
    >
      <BaseSelect.Trigger
        aria-label={label ?? "Выбрать значение"}
        className={cn(
          "group flex h-11 w-full items-center gap-2 rounded-full border border-border bg-card/90 px-4 text-sm text-foreground shadow-sm outline-none transition-colors hover:border-primary/35 focus-visible:border-primary/45 focus-visible:ring-2 focus-visible:ring-primary/15",
          className
        )}
      >
        {icon && <span className="shrink-0 text-muted-foreground">{icon}</span>}
        <BaseSelect.Value className="min-w-0 flex-1 truncate text-left" />
        <BaseSelect.Icon className="text-muted-foreground transition-transform group-data-[popup-open]:rotate-180">
          <ChevronDown className="h-4 w-4" />
        </BaseSelect.Icon>
      </BaseSelect.Trigger>
      <BaseSelect.Portal>
        <BaseSelect.Positioner sideOffset={8} alignItemWithTrigger={false} className="z-50 outline-none">
          <BaseSelect.Popup className="min-w-[var(--anchor-width)] origin-[var(--transform-origin)] rounded-2xl border border-border bg-card p-1.5 text-foreground shadow-2xl shadow-foreground/10 outline-none transition-[transform,opacity] data-[ending-style]:scale-95 data-[ending-style]:opacity-0 data-[starting-style]:scale-95 data-[starting-style]:opacity-0">
            <BaseSelect.List className="max-h-72 overflow-y-auto outline-none">
              {options.map((option) => (
                <BaseSelect.Item
                  key={option.value}
                  value={option.value}
                  className="grid cursor-default grid-cols-[1fr_auto] items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm outline-none data-[highlighted]:bg-muted data-[highlighted]:text-foreground"
                >
                  <BaseSelect.ItemText>{option.label}</BaseSelect.ItemText>
                  <BaseSelect.ItemIndicator className="text-primary">
                    <Check className="h-4 w-4" />
                  </BaseSelect.ItemIndicator>
                </BaseSelect.Item>
              ))}
            </BaseSelect.List>
          </BaseSelect.Popup>
        </BaseSelect.Positioner>
      </BaseSelect.Portal>
    </BaseSelect.Root>
  );
}
