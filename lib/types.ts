export type CategoryId =
  | "apartments"
  | "offices"
  | "upholstery"
  | "windows"
  | "post-renovation"
  | "deep-cleaning";

export interface Category {
  id: CategoryId;
  name: string;
  icon: string;
  brandId?: string;
}

export type BrandFocus = "technika" | "himiya" | "inventory" | "service";

export interface Brand {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  logo?: string;
  accent: string;
  focus: BrandFocus;
  description: string;
  affiliateUrl: string;
  discountCode?: string;
  isSponsor?: boolean;
}

/** @deprecated use Brand */
export type Sponsor = Brand;

export interface RecentReview {
  author: string;
  text: string;
  rating: number;
}

/** Откуда взяты рейтинг/отзывы компании — для честного отображения источника данных */
export type RatingSource = "google" | "yandex" | "unverified" | "new";

export interface Company {
  id: string;
  slug: string;
  name: string;
  categories: CategoryId[];
  city: string;
  /** Адрес — только если он реально опубликован компанией */
  address?: string;
  verified: boolean;
  /** Честное платное размещение — открыто помечается бейджем "Партнёр платформы" */
  promoted: boolean;
  brandId?: string;
  /** brandId[] — техника и химия, которой пользуется компания (только подтверждённые данные) */
  equipment?: string[];
  baseRating: number;
  reviewCount: number;
  /** Источник рейтинга. "new"/"unverified" — платформа не публикует рейтинг, пока нет проверенных данных */
  ratingSource?: RatingSource;
  /** Цена может быть не опубликована — тогда показываем "Цена по запросу" вместо выдуманного числа */
  priceFrom?: number;
  /** Единица измерения цены, если это не цена "за услугу целиком" (например "м²", "окно", "шт") */
  priceUnit?: string;
  coverImage: string;
  description: string;
  tags: string[];
  recentReview?: RecentReview;
  websiteUrl?: string;
  phone?: string;
  telegramUrl?: string;
  email?: string;
  experienceYears?: number;
  /** Реально выполнимые гарантии компании — только подтверждённые владельцем/сайтом компании */
  guarantees?: string[];
}

export type ProductCategory = "extractors" | "chemistry" | "robots" | "windows" | "inventory";

export interface AffiliateProduct {
  id: string;
  slug: string;
  brandId: string;
  name: string;
  image: string;
  category: ProductCategory;
  price?: number;
  rating: number;
  badge?: "Выбор профи" | "Новинка" | "Хит продаж";
  pros: string[];
  affiliateUrl: string;
}

/** @deprecated reserved for future marketplace expansion, not used in core CLEANHUB */
export interface SponsoredSlot {
  categoryId: CategoryId;
  brandId: string;
  price: number;
  periodLabel: string;
  impressions: number;
  clicks: number;
}

/** @deprecated reserved for future marketplace expansion, not used in core CLEANHUB */
export interface BrandBattle {
  id: string;
  brandAId: string;
  brandBId: string;
  theme: string;
  votesA: number;
  votesB: number;
  endsAt: number;
}

// --- Продуктовый граф решений «Два пути» (CLEANHUB) ---

export type SolutionProblemType = "stain" | "odor" | "scale" | "postrenovation" | "general";

export type SolutionSurface =
  | "upholstery"
  | "mattress"
  | "carpet"
  | "floor"
  | "window"
  | "facade"
  | "kitchen"
  | "bathroom"
  | "other";

export type SolutionSeverity = "fresh" | "set" | "extreme";

export type SolutionAudience = "b2c" | "b2b" | "both";

export interface DiyStep {
  order: number;
  instruction: string;
  tip?: string;
}

export interface SolutionProduct {
  id?: string;
  solutionId: string;
  brandId?: string;
  productId?: string;
  brandName?: string;
  productName?: string;
  role: "recommended" | "alternative";
  note?: string;
}

export interface Solution {
  id: string;
  slug: string;
  title: string;
  problemType: SolutionProblemType;
  surface: SolutionSurface;
  material?: string;
  severity: SolutionSeverity;
  audience: SolutionAudience;
  diySteps: DiyStep[];
  warnings: string[];
  whenToCallPro: string;
  diyCostNote?: string;
  proTimeNote?: string;
  searchKeywords: string[];
  relatedCategory?: CategoryId;
  status: "draft" | "published" | "archived";
  recommendedProducts?: SolutionProduct[];
}

export type SearchIntent = "b2c" | "b2b" | "pro";

export type IntentTargetKind = "solution" | "category" | "brand";

export interface IntentKeyword {
  id?: string;
  keyword: string;
  intent: SearchIntent;
  weight: number;
  targetKind: IntentTargetKind;
  targetSlug: string;
}

export interface PriceEstimate {
  id: string;
  solutionId?: string;
  categoryId?: CategoryId;
  countryCode: string;
  city?: string;
  currency: string;
  priceMin: number;
  priceMax: number;
  unit?: string;
  note?: string;
}
