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

/** Слагаемые «Индекса доверия профи» — публичная метрика, по которой строится лидерборд брендов */
export interface BrandScore {
  brandId: string;
  /** Компании со связью company_brands.evidenceStatus = verified */
  verifiedCompanyCount: number;
  /** Протоколы, где бренд в роли recommended */
  recommendedCount: number;
  /** Протоколы, где бренд в роли alternative */
  alternativeCount: number;
  /** Переходы на бренд из analytics_events */
  clickCount: number;
  score: number;
  /** Доля реального использования: верифицированные компании + протоколы */
  adoptionScore?: number;
  /** Интерес пользователей: клики/переходы */
  interestScore?: number;
}

export interface RankedBrand extends Brand {
  metrics: BrandScore;
}

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

export interface BrandLead {
  id: string;
  brandName: string;
  website?: string | null;
  contactName: string;
  contact: string;
  role: "brand" | "dealer" | "service" | "other";
  goal?: string | null;
  status: "new" | "contacted" | "qualified" | "closed";
  consentAcceptedAt?: Date | null;
  consentVersion?: string | null;
  createdAt: Date;
}

export interface PartnerLead {
  id: string;
  companyName: string;
  contactName?: string | null;
  phone: string;
  city?: string | null;
  categoryIds?: string[] | null;
  message?: string | null;
  status: "new" | "contacted" | "closed";
  consentAcceptedAt?: Date | null;
  consentVersion?: string | null;
  createdAt: Date;
}

// --- Рекламный бэкенд и логика допусков (CLEANHUB Ad Engine) ---

export type AdPlacement =
  | "solution.sponsored_product"
  | "rating.category_partner"
  | "home.editorial_partner"
  | "search.sponsored_result"
  | "products.sponsored_slot"
  | "brand.profile_campaign"
  | "dealer.local_partner";

export type AdCtaType = "where_to_buy" | "request_quote" | "training" | "demo" | "website";

export type CampaignStatus = "draft" | "active" | "paused" | "completed";

export interface Campaign {
  id: string;
  brandId: string;
  productId?: string | null;
  name: string;
  placement: AdPlacement;
  status: CampaignStatus;
  startsAt?: Date | null;
  endsAt?: Date | null;
  targetCountries?: string[] | null;
  targetCategories?: string[] | null;
  targetSurfaces?: string[] | null;
  targetSolutions?: string[] | null;
  maxImpressions?: number | null;
  maxClicks?: number | null;
  currentImpressions: number;
  currentClicks: number;
  title?: string | null;
  description?: string | null;
  ctaText?: string | null;
  ctaUrl?: string | null;
  ctaType?: AdCtaType | null;
  badgeText?: string | null;
  priority: number;
  createdAt: Date;
  updatedAt?: Date | null;
}

export interface AdTargetContext {
  countryCode?: string;
  categoryId?: string;
  surface?: string;
  solutionSlug?: string;
  brandSlug?: string;
}

export interface ProductSafetyProfile {
  id: string;
  slug?: string;
  name: string;
  brandId?: string;
  ph?: number;
  compatibleSurfaces?: string[];
  prohibitedSurfaces?: string[];
  hazards?: string[];
}

export interface EligibleAd {
  campaignId: string;
  brandId: string;
  brandName: string;
  brandSlug: string;
  brandLogo?: string;
  productId?: string;
  productName?: string;
  productSlug?: string;
  /** pH состава — показывается в блоке «Почему подходит» как проверяемый факт */
  productPh?: number;
  /** Поверхности, для которых состав допущен производителем */
  productCompatibleSurfaces?: string[];
  /** Цвет бренда для деликатного акцента креатива (не имитирует органические плашки) */
  brandAccent?: string;
  placement: AdPlacement;
  title: string;
  description: string;
  ctaText: string;
  ctaUrl: string;
  ctaType: AdCtaType;
  badgeText: string;
  reasonText?: string;
  /** Страны кампании — клиентский гейт для SSG-страниц, где страна известна только из cookie */
  targetCountries?: string[] | null;
}
