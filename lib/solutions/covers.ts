import type { Solution } from "@/lib/types";

/**
 * Уникальная обложка на опубликованное решение; новые решения получают фолбэк по поверхности/типу.
 * Фото: Pexels License — kofe-na-tekstile №4097999, krov-na-matrase №9497355,
 * poslestroy-okna-skotch №8811390, zapah-syrosti-posle-potopa №4570108;
 * flomaster-ruchka-na-divane, vosk-zhvachka-na-kovre и nalet-chernaya-santehnika пока берут обложку по поверхности;
 * остальные — из public/shelves (stains 5659651, odors 13450868, renovation 9908376,
 * kitchen 4850197, bathroom 7587870, office 12526862).
 */
const SLUG_COVERS: Record<string, string> = {
  "vino-na-divane": "/covers/vino-na-divane.jpg",
  "kofe-na-tekstile": "/covers/kofe-na-tekstile.jpg",
  "krov-na-matrase": "/covers/krov-na-matrase.jpg",
  "mocha-i-zapah-matras": "/covers/mocha-i-zapah-matras.jpg",
  "poslestroy-zatirka-plitka": "/covers/poslestroy-zatirka-plitka.jpg",
  "poslestroy-okna-skotch": "/covers/poslestroy-okna-skotch.jpg",
  "zhir-vytyazhka-kuhnya": "/covers/zhir-vytyazhka-kuhnya.jpg",
  "vodny-kamen-dushevaya": "/covers/vodny-kamen-dushevaya.jpg",
  "uborka-ofisa-posle-korporativa": "/covers/uborka-ofisa-posle-korporativa.jpg",
  "zapah-syrosti-posle-potopa": "/covers/zapah-syrosti-posle-potopa.jpg",
  "zapah-zhivotnyh-kover": "/shelves/odors.jpg",
  "chernaya-plesen-shvy-vannaya": "/shelves/bathroom.jpg",
  "sledy-reziny-kleya-laminat": "/shelves/renovation.jpg",
};

const SURFACE_COVERS: Partial<Record<Solution["surface"], string>> = {
  kitchen: "/covers/zhir-vytyazhka-kuhnya.jpg",
  bathroom: "/covers/vodny-kamen-dushevaya.jpg",
  upholstery: "/covers/kofe-na-tekstile.jpg",
  mattress: "/covers/mocha-i-zapah-matras.jpg",
  window: "/covers/poslestroy-okna-skotch.jpg",
  carpet: "/shelves/odors.jpg",
  floor: "/covers/poslestroy-zatirka-plitka.jpg",
};

const TYPE_COVERS: Partial<Record<Solution["problemType"], string>> = {
  stain: "/covers/vino-na-divane.jpg",
  odor: "/covers/zapah-syrosti-posle-potopa.jpg",
  postrenovation: "/covers/poslestroy-zatirka-plitka.jpg",
  scale: "/covers/vodny-kamen-dushevaya.jpg",
};

/** Обложка решения: сначала точная по slug, затем по поверхности (точнее), затем по типу проблемы. */
export function solutionCover(s: Pick<Solution, "slug" | "problemType" | "surface">): string {
  return SLUG_COVERS[s.slug] ?? SURFACE_COVERS[s.surface] ?? TYPE_COVERS[s.problemType] ?? "/covers/uborka-ofisa-posle-korporativa.jpg";
}
