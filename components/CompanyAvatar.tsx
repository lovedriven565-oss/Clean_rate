import { Sparkles } from "lucide-react";
import { getGradientForId, getInitials } from "@/lib/avatar-utils";
import { cn } from "@/lib/utils";

interface CompanyAvatarProps {
  id: string;
  name: string;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  showIcon?: boolean;
}

const sizeMap = {
  sm: { wrapper: "h-9 w-9", font: "text-[10px]" },
  md: { wrapper: "h-12 w-12", font: "text-sm" },
  lg: { wrapper: "h-16 w-16", font: "text-lg" },
  xl: { wrapper: "h-24 w-24", font: "text-2xl" },
};

export function CompanyAvatar({ id, name, size = "md", className, showIcon }: CompanyAvatarProps) {
  const { from, to } = getGradientForId(id);
  const initials = getInitials(name);

  return (
    <span
      className={cn(
        "relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-2xl font-display font-bold text-white shadow-sm",
        sizeMap[size].wrapper,
        sizeMap[size].font,
        className
      )}
      style={{ background: `linear-gradient(135deg, ${from}, ${to})` }}
    >
      {showIcon ? <Sparkles className="h-1/2 w-1/2 opacity-80" /> : <span className="drop-shadow-sm">{initials}</span>}
    </span>
  );
}
