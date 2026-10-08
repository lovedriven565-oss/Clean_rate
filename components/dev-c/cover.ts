import type { Solution } from "@/lib/types";

/** Обложка решения: сначала по поверхности (точнее), затем по типу проблемы. */
export function coverFor(s: Pick<Solution, "problemType" | "surface">): string {
  if (s.surface === "kitchen") return "/dev/a-tasks/kitchen.jpg";
  if (s.surface === "bathroom") return "/dev/a-tasks/bathroom.jpg";
  switch (s.problemType) {
    case "stain":
      return "/dev/a-tasks/stains.jpg";
    case "odor":
      return "/dev/a-tasks/odors.jpg";
    case "postrenovation":
      return "/dev/a-tasks/renovation.jpg";
    case "scale":
      return "/dev/a-tasks/bathroom.jpg";
    default:
      return "/dev/a-tasks/office.jpg";
  }
}
