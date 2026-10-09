import { solutionCover } from "@/lib/solutions/covers";

/** @deprecated Использовать lib/solutions/covers.ts напрямую. Оставлено для прототипа. */
export function coverFor(s: Parameters<typeof solutionCover>[0]): string {
  return solutionCover(s);
}
