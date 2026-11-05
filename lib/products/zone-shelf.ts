import type { SeedProduct, SeedSolutionProduct } from "@/db/seed-data";
import type { CurrencyCode } from "@/lib/markets";
import { phZone } from "@/lib/ph";
import type { AffiliateProduct, Brand } from "@/lib/types";

export type HomeZoneId = "kitchen" | "bathroom" | "furniture" | "renovation" | "equipment";

export interface HomeZone {
  id: HomeZoneId;
  label: string;
  tagline: string;
}

/** Пять зон реального покупательского спроса — порядок определяет порядок табов. */
export const HOME_ZONES: readonly HomeZone[] = [
  { id: "kitchen", label: "Кухня и антижир", tagline: "Нагар, жир, дезинфекция" },
  { id: "bathroom", label: "Ванная и налёт", tagline: "Водный камень, мыльный след, сантехника" },
  { id: "furniture", label: "Мебель и пятна", tagline: "Обивка, ковры, матрасы" },
  { id: "renovation", label: "После ремонта", tagline: "Цемент, затирка, клей, пыль" },
  { id: "equipment", label: "Техника для профи", tagline: "Экстракторы, пылесосы, мопы" },
];

export interface ShelfProduct {
  id: string;
  slug: string;
  brandId: string;
  brandName?: string;
  name: string;
  /** Ориентировочная цена в BYN из аффилиат-витрины (пересчёт — displayPrice) */
  price?: number;
  rating?: number;
  badge?: string;
  pros: string[];
  affiliateUrl?: string;
  /** Дилер и промокод по прямой договорённости (проброшены из AffiliateProduct). */
  dealerName?: string;
  promoCode?: string;
  ph?: number;
  zones: HomeZoneId[];
  /** Человеческие теги безопасности — без сырых цифр pH */
  safetyTags: string[];
  /** Протокол, где средство фигурирует в составе решения */
  solutionSlug?: string;
}

const SURFACE_ZONE: Record<string, HomeZoneId> = {
  kitchen: "kitchen",
  bathroom: "bathroom",
  upholstery: "furniture",
  carpet: "furniture",
  mattress: "furniture",
  leather: "furniture",
  natural_wood: "furniture",
};

const EQUIPMENT_CATEGORIES = new Set(["extractors", "robots", "windows", "inventory"]);

const RENOVATION_RE = /цемент|затирк|высол|строительн|скотч|кле[яй]|маркер|резин|ремонт/i;
const KITCHEN_RE = /жир|нагар|дезинфекц|anti-?fat|кух/i;

/** Зоны, которые нельзя вывести из полей продукта, — редакционные решения витрины. */
const EXTRA_ZONES: Record<string, HomeZoneId[]> = {
  "bosch-gas-18v": ["renovation"], // строительный пылесос
  "karcher-puzzi-10-1": ["furniture"], // моющий экстрактор для обивки и ковров
  "ecolab-oasis-pro": ["kitchen"], // дезинфекция и гипоаллергенный состав
};

/** Родительный падеж для тегов «Не для …». */
const GENITIVE: Record<string, string> = {
  marble: "мрамора",
  limestone: "известняка",
  travertine: "травертина",
  terrazzo: "терраццо",
  enamel: "эмали",
  cement: "цемента",
  wool: "шерсти",
  silk: "шёлка",
  natural_wood: "дерева",
  linoleum: "линолеума",
  aluminum: "алюминия",
  leather: "кожи",
  upholstery: "обивки",
  carpet: "ковров",
  mattress: "матрасов",
  kitchen: "кухни",
  bathroom: "ванной",
  window: "стекла",
  floor: "пола",
};

const PH_TAG: Record<ReturnType<typeof phZone>, string> = {
  acid: "Сильный состав",
  "mild-acid": "Мягкий кислотный",
  neutral: "Нейтральный состав",
  "mild-alkali": "Щелочной состав",
  alkali: "Сильный состав",
};

/** Человеческие теги: вердикт состава + главные запреты производителя, без цифр pH. */
export function safetyTags(product: {
  ph?: number;
  compatibleSurfaces?: string[];
  prohibitedSurfaces?: string[];
}): string[] {
  const tags: string[] = [];
  if (product.ph !== undefined) {
    tags.push(PH_TAG[phZone(product.ph)]);
    const textile = product.compatibleSurfaces?.some((s) => s === "upholstery" || s === "carpet" || s === "mattress");
    if (textile && product.ph >= 4 && product.ph <= 8.5) tags.push("Безопасно для цветной ткани");
  }
  const forbidden = (product.prohibitedSurfaces ?? [])
    .map((s) => GENITIVE[s])
    .filter((s): s is string => Boolean(s))
    .slice(0, 2);
  if (forbidden.length === 1) tags.push(`Не для ${forbidden[0]}`);
  if (forbidden.length === 2) tags.push(`Не для ${forbidden[0]} и ${forbidden[1]}`);
  return tags.slice(0, 3);
}

function zonesFor(product: { slug: string; name: string; category: string; description?: string; pros?: string[]; compatibleSurfaces?: string[] }): HomeZoneId[] {
  const zones = new Set<HomeZoneId>();
  if (EQUIPMENT_CATEGORIES.has(product.category)) zones.add("equipment");
  for (const surface of product.compatibleSurfaces ?? []) {
    const zone = SURFACE_ZONE[surface];
    if (zone) zones.add(zone);
  }
  const text = `${product.name} ${product.description ?? ""} ${(product.pros ?? []).join(" ")}`;
  if (RENOVATION_RE.test(text)) zones.add("renovation");
  if (KITCHEN_RE.test(text)) zones.add("kitchen");
  for (const zone of EXTRA_ZONES[product.slug] ?? []) zones.add(zone);
  return [...zones];
}

/** Токен продукта без имени бренда — для сопоставления с заметками в solution_products. */
function productToken(name: string, brandId: string): string {
  const brand = brandId.split("-")[0];
  return name
    .toLowerCase()
    .replace(new RegExp(brand, "i"), "")
    .split(/[\s/]+/)
    .filter((t) => t.length >= 4)[0] ?? "";
}

function findSolutionSlug(product: { name: string; brandId: string; id: string }, links: readonly SeedSolutionProduct[]): string | undefined {
  const name = product.name.toLowerCase();
  const token = productToken(product.name, product.brandId);
  const hit = links.find((link) => {
    if (link.productId && link.productId === product.id) return true;
    if (link.brandId !== product.brandId || !link.note) return false;
    const note = link.note.toLowerCase();
    return note.includes(name) || (token.length >= 4 && note.includes(token));
  });
  return hit?.solutionId;
}

/**
 * Витрина «Лучшие средства по зонам дома»: аффилиат-карточки дополняются паспортами
 * seedProducts по slug. Товары без зоны (не релевантны ни одной зоне дома) на полку не попадают.
 */
export function buildShelfProducts(
  affiliate: readonly AffiliateProduct[],
  seed: readonly SeedProduct[],
  links: readonly SeedSolutionProduct[],
  brands: readonly Pick<Brand, "id" | "name">[] = [],
): ShelfProduct[] {
  const brandName = new Map(brands.map((b) => [b.id, b.name]));
  const bySlug = new Map<string, ShelfProduct>();

  for (const p of seed) {
    if (p.status !== "published") continue;
    const base = {
      id: p.id,
      slug: p.slug,
      brandId: p.brandId,
      brandName: brandName.get(p.brandId),
      name: p.name,
      pros: [],
      affiliateUrl: undefined,
      ph: p.ph,
      zones: zonesFor(p),
      safetyTags: safetyTags(p),
      solutionSlug: findSolutionSlug(p, links),
    };
    bySlug.set(p.slug, base);
  }

  for (const p of affiliate) {
    const existing = bySlug.get(p.slug);
    const merged: ShelfProduct = {
      id: existing?.id ?? p.id,
      slug: p.slug,
      brandId: p.brandId,
      brandName: brandName.get(p.brandId),
      name: p.name,
      price: p.price,
      rating: p.rating,
      badge: p.badge,
      pros: p.pros,
      affiliateUrl: p.affiliateUrl,
      dealerName: p.dealerName,
      promoCode: p.promoCode,
      ph: existing?.ph,
      zones: existing?.zones.length ? existing.zones : zonesFor({ ...p, description: "" }),
      safetyTags: existing ? existing.safetyTags : [],
      solutionSlug: existing?.solutionSlug,
    };
    bySlug.set(p.slug, merged);
  }

  return [...bySlug.values()].filter((p) => p.zones.length > 0);
}

export function productsInZone(products: readonly ShelfProduct[], zone: HomeZoneId): ShelfProduct[] {
  return products.filter((p) => p.zones.includes(zone));
}

/**
 * Ориентировочный пересчёт цены витрины (хранится в BYN) в валюту рынка.
 * Это не курс ЦБ, а редакционный ориентир: точная цена всегда у дилера —
 * поэтому конвертированная сумма показывается с пометкой «≈».
 */
const BYN_TO: Record<CurrencyCode, number> = { BYN: 1, RUB: 27, KZT: 165 };

export function displayPrice(priceByn: number, currency: CurrencyCode): { value: number; approx: boolean } {
  const raw = priceByn * BYN_TO[currency];
  const step = currency === "BYN" ? 1 : currency === "RUB" ? 50 : 500;
  return { value: Math.round(raw / step) * step, approx: currency !== "BYN" };
}
