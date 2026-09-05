import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-semibold transition-[transform,background-color,border-color,color,box-shadow,opacity] duration-200 disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50 active:scale-[0.98]",
  {
    variants: {
      variant: {
        primary: "bg-primary text-primary-foreground shadow-sm shadow-primary/20 hover:-translate-y-0.5 hover:bg-primary/92 hover:shadow-md hover:shadow-primary/20",
        outline: "border border-border bg-card/70 text-foreground hover:border-primary/35 hover:bg-muted/70",
        ghost: "bg-transparent text-foreground hover:bg-muted",
        subtle: "bg-muted text-foreground hover:bg-muted/70",
      },
      size: {
        sm: "h-9 px-4 text-xs",
        md: "h-11 px-6",
        lg: "h-14 px-8 text-base",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => (
    <button ref={ref} className={cn(buttonVariants({ variant, size }), className)} {...props} />
  )
);
Button.displayName = "Button";

export function Badge({ className, children, ...props }: React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border border-border/80 bg-muted/80 px-2.5 py-1 text-xs font-medium text-muted-foreground",
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}

export function Card({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-[var(--radius)] border border-border/80 bg-card text-card-foreground shadow-[0_16px_48px_hsl(var(--foreground)/0.045)]",
        className
      )}
      {...props}
    />
  );
}

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        "flex h-12 w-full rounded-full border border-border bg-card/90 px-5 text-sm text-foreground shadow-sm outline-none placeholder:text-muted-foreground focus:border-primary/45 focus:ring-2 focus:ring-primary/15",
        className
      )}
      {...props}
    />
  )
);
Input.displayName = "Input";

export function Progress({ value, className }: { value: number; className?: string }) {
  return (
    <div className={cn("h-2 w-full overflow-hidden rounded-full bg-muted", className)}>
      <div
        className="h-full rounded-full bg-primary transition-[width] duration-500"
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  );
}
