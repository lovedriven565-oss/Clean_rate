/** Генерирует детерминированный градиент и инициалы по id/name */

const gradientPairs = [
  { from: "#0d9488", to: "#14b8a6" },   // teal
  { from: "#0ea5e9", to: "#38bdf8" },   // sky
  { from: "#64748b", to: "#94a3b8" },   // slate
  { from: "#059669", to: "#34d399" },   // emerald
  { from: "#475569", to: "#64748b" },   // dark slate
  { from: "#0891b2", to: "#22d3ee" },   // cyan
  { from: "#7c3aed", to: "#a78bfa" },   // violet
  { from: "#0369a1", to: "#0ea5e9" },   // blue
];

export function hashCode(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return Math.abs(hash);
}

export function getGradientForId(id: string) {
  const index = hashCode(id) % gradientPairs.length;
  return gradientPairs[index];
}

export function getInitials(name: string): string {
  const cleaned = name.trim();
  if (!cleaned) return "?";
  const parts = cleaned.split(/\s+/).filter(Boolean);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}
