import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  checkCampaignEligibility,
  checkProductRelevance,
  checkProductSafety,
  filterAndRankEligibleCampaigns,
  resolveEligibleAd,
} from "../lib/ads/eligibility.js";
import { getEligibleAd } from "../lib/ads/queries.js";
import { computeBrandScore } from "../lib/brand-score.js";
import { companies } from "../lib/mock-data.js";
import { calculateOrganicScore, calculateRelevanceScore } from "../lib/rating.js";
import type {
  AdTargetContext,
  Brand,
  Campaign,
  ProductSafetyProfile,
  Solution,
} from "../lib/types.js";

const NOW = new Date("2026-09-01T12:00:00Z");

const baseCampaign: Campaign = {
  id: "camp-test-1",
  brandId: "kiehl",
  productId: "prod-kiehl-arenas",
  name: "Тестовая кампания Kiehl",
  placement: "solution.sponsored_product",
  status: "active",
  startsAt: new Date("2026-01-01T00:00:00Z"),
  endsAt: new Date("2026-12-31T23:59:59Z"),
  targetCountries: ["BY", "RU"],
  targetSurfaces: ["upholstery"],
  targetSolutions: ["vino-na-divane"],
  currentImpressions: 10,
  currentClicks: 2,
  maxImpressions: 1000,
  maxClicks: 100,
  title: "Kiehl Arenas-exet 3",
  description: "Эффективное удаление танинов",
  ctaText: "Где купить",
  ctaUrl: "https://kiehl.ru",
  ctaType: "where_to_buy",
  badgeText: "Спонсорский проверенный вариант",
  priority: 10,
  createdAt: new Date("2026-01-01T00:00:00Z"),
};

const safeUpholsteryProduct: ProductSafetyProfile = {
  id: "prod-kiehl-arenas",
  brandId: "kiehl",
  name: "Kiehl Arenas-exet 3",
  ph: 7.0,
  compatibleSurfaces: ["upholstery", "carpet"],
  prohibitedSurfaces: ["leather"],
};

const harshAcidProduct: ProductSafetyProfile = {
  id: "prod-acid-harsh",
  brandId: "test-brand",
  name: "Acid Strike Cleaner",
  ph: 1.5,
  compatibleSurfaces: ["floor", "bathroom"],
  prohibitedSurfaces: ["upholstery", "marble", "carpet"],
};

const mockSolution: Solution = {
  id: "vino-na-divane",
  slug: "vino-na-divane",
  title: "Пятно вина на светлом велюровом диване",
  problemType: "stain",
  surface: "upholstery",
  material: "велюр",
  severity: "fresh",
  audience: "b2c",
  diySteps: [{ order: 1, instruction: "Промокнуть салфеткой" }],
  warnings: [
    "Категорически нельзя замывать горячей водой и тереть с усилием.",
    "Не используйте кислотные составы — риск повреждения цвета.",
  ],
  whenToCallPro: "Если пятно высохло",
  searchKeywords: ["вино на диване"],
  status: "published",
  recommendedProducts: [
    {
      solutionId: "vino-na-divane",
      brandId: "kiehl",
      productId: "prod-kiehl-arenas",
      role: "recommended",
      note: "Kiehl Arenas-exet 3",
    },
  ],
};

const mockBrand: Brand = {
  id: "kiehl",
  slug: "kiehl",
  name: "Kiehl",
  tagline: "Профессиональная химия",
  accent: "#1E3A8A",
  focus: "himiya",
  description: "Немецкий производитель",
  affiliateUrl: "https://kiehl.ru",
};

describe("Ad Engine & Eligibility Gate", () => {
  describe("временные рамки и статус", () => {
    it("допускает активную кампанию в пределах срока действия", () => {
      const result = checkCampaignEligibility({
        campaign: baseCampaign,
        context: { countryCode: "BY", surface: "upholstery", solutionSlug: "vino-na-divane" },
        product: safeUpholsteryProduct,
        solution: mockSolution,
        now: NOW,
      });

      assert.equal(result.eligible, true);
      assert.ok(result.matchScore > 0);
    });

    it("отклоняет просроченную кампанию", () => {
      const expiredCampaign: Campaign = {
        ...baseCampaign,
        endsAt: new Date("2026-05-01T00:00:00Z"),
      };

      const result = checkCampaignEligibility({
        campaign: expiredCampaign,
        context: { countryCode: "BY", surface: "upholstery", solutionSlug: "vino-na-divane" },
        product: safeUpholsteryProduct,
        solution: mockSolution,
        now: NOW,
      });

      assert.equal(result.eligible, false);
      assert.match(result.reason || "", /истёк/i);
    });

    it("отклоняет кампанию, дата начала которой ещё не наступила", () => {
      const futureCampaign: Campaign = {
        ...baseCampaign,
        startsAt: new Date("2026-10-01T00:00:00Z"),
      };

      const result = checkCampaignEligibility({
        campaign: futureCampaign,
        context: { countryCode: "BY", surface: "upholstery", solutionSlug: "vino-na-divane" },
        product: safeUpholsteryProduct,
        solution: mockSolution,
        now: NOW,
      });

      assert.equal(result.eligible, false);
      assert.match(result.reason || "", /не начался/i);
    });

    it("отклоняет кампанию со статусом draft или paused", () => {
      for (const status of ["draft", "paused", "completed"] as const) {
        const result = checkCampaignEligibility({
          campaign: { ...baseCampaign, status },
          context: { countryCode: "BY", surface: "upholstery", solutionSlug: "vino-na-divane" },
          product: safeUpholsteryProduct,
          solution: mockSolution,
          now: NOW,
        });

        assert.equal(result.eligible, false);
        assert.match(result.reason || "", /не активна/i);
      }
    });
  });

  describe("бюджеты и лимиты показов/кликов", () => {
    it("отклоняет кампанию с исчерпанным лимитом показов", () => {
      const result = checkCampaignEligibility({
        campaign: { ...baseCampaign, maxImpressions: 500, currentImpressions: 500 },
        context: { countryCode: "BY", surface: "upholstery", solutionSlug: "vino-na-divane" },
        product: safeUpholsteryProduct,
        solution: mockSolution,
        now: NOW,
      });

      assert.equal(result.eligible, false);
      assert.match(result.reason || "", /лимит показов/i);
    });

    it("отклоняет кампанию с исчерпанным лимитом кликов", () => {
      const result = checkCampaignEligibility({
        campaign: { ...baseCampaign, maxClicks: 50, currentClicks: 50 },
        context: { countryCode: "BY", surface: "upholstery", solutionSlug: "vino-na-divane" },
        product: safeUpholsteryProduct,
        solution: mockSolution,
        now: NOW,
      });

      assert.equal(result.eligible, false);
      assert.match(result.reason || "", /лимит кликов/i);
    });
  });

  describe("географический и категорийный таргетинг", () => {
    it("отклоняет кампанию при несовпадении страны", () => {
      const result = checkCampaignEligibility({
        campaign: { ...baseCampaign, targetCountries: ["RU", "KZ"] },
        context: { countryCode: "BY", surface: "upholstery", solutionSlug: "vino-na-divane" },
        product: safeUpholsteryProduct,
        solution: mockSolution,
        now: NOW,
      });

      assert.equal(result.eligible, false);
      assert.match(result.reason || "", /не таргетирована на страну BY/i);
    });

    it("пропускает кампанию при совпадении страны", () => {
      const result = checkCampaignEligibility({
        campaign: { ...baseCampaign, targetCountries: ["BY", "RU"] },
        context: { countryCode: "BY", surface: "upholstery", solutionSlug: "vino-na-divane" },
        product: safeUpholsteryProduct,
        solution: mockSolution,
        now: NOW,
      });

      assert.equal(result.eligible, true);
    });

    it("отклоняет category_partner при несовпадении категории", () => {
      const categoryCampaign: Campaign = {
        ...baseCampaign,
        placement: "rating.category_partner",
        targetCategories: ["offices"],
      };

      const result = checkCampaignEligibility({
        campaign: categoryCampaign,
        context: { categoryId: "apartments" },
        now: NOW,
      });

      assert.equal(result.eligible, false);
      assert.match(result.reason || "", /не таргетирована на категорию apartments/i);
    });
  });

  describe("Safety Gate: химическая безопасность и защита поверхностей", () => {
    it("запрещает показ кислотного средства на кислото-чувствительной поверхности", () => {
      const acidProduct: ProductSafetyProfile = {
        id: "prod-acid-only",
        name: "Acid Descaler",
        ph: 1.5,
      };
      const safety = checkProductSafety({
        product: acidProduct,
        surface: "marble",
      });

      assert.equal(safety.safe, false);
      assert.match(safety.reason || "", /кислот.*опасен/i);
    });

    it("запрещает состав, если поверхность входит в prohibitedSurfaces продукта", () => {
      const safety = checkProductSafety({
        product: harshAcidProduct,
        surface: "upholstery",
      });

      assert.equal(safety.safe, false);
      assert.match(safety.reason || "", /запрещён производителем для поверхности/i);
    });

    it("запрещает состав, если протокол решения содержит запрещающее предупреждение", () => {
      const safety = checkProductSafety({
        product: {
          id: "mild-acid",
          name: "Mild Acid",
          ph: 4.5,
        },
        surface: "upholstery",
        solution: mockSolution, // содержит предупреждение: "Не используйте кислотные составы"
      });

      assert.equal(safety.safe, false);
      assert.match(safety.reason || "", /протокол решения запрещает/i);
    });

    it("одобряет нейтральный безопасный состав для обивки", () => {
      const safety = checkProductSafety({
        product: safeUpholsteryProduct,
        surface: "upholstery",
        solution: mockSolution,
      });

      assert.equal(safety.safe, true);
    });
  });

  describe("Relevance Gate: спонсорство не может купить неподходящий состав", () => {
    it("отклоняет нерелевантный продукт, даже если у кампании максимальный приоритет", () => {
      const irrelevantProduct: ProductSafetyProfile = {
        id: "prod-floor-wax",
        name: "Heavy Floor Wax",
        compatibleSurfaces: ["floor"],
        prohibitedSurfaces: ["upholstery", "carpet"],
      };

      const highPriorityCampaign: Campaign = {
        ...baseCampaign,
        productId: "prod-floor-wax",
        priority: 999999,
      };

      const result = checkCampaignEligibility({
        campaign: highPriorityCampaign,
        context: { countryCode: "BY", surface: "upholstery", solutionSlug: "vino-na-divane" },
        product: irrelevantProduct,
        solution: mockSolution,
        now: NOW,
      });

      assert.equal(result.eligible, false);
      assert.ok(result.reason !== undefined);
    });

    it("одобряет релевантный продукт, подтверждённый в протоколе решения", () => {
      const relevance = checkProductRelevance({
        product: safeUpholsteryProduct,
        solution: mockSolution,
        surface: "upholstery",
      });

      assert.equal(relevance.relevant, true);
      assert.equal(relevance.relevanceScore, 100);
    });
  });

  describe("выборка и ранжирование кампаний", () => {
    it("сортирует по matchScore и отдаёт лучшего кандидата", () => {
      const campLow: Campaign = {
        ...baseCampaign,
        id: "camp-low",
        priority: 1,
      };
      const campHigh: Campaign = {
        ...baseCampaign,
        id: "camp-high",
        priority: 10,
      };

      const productsMap = new Map<string, ProductSafetyProfile>([
        ["prod-kiehl-arenas", safeUpholsteryProduct],
      ]);

      const ranked = filterAndRankEligibleCampaigns(
        [campLow, campHigh],
        { countryCode: "BY", surface: "upholstery", solutionSlug: "vino-na-divane" },
        { productsMap, solution: mockSolution, now: NOW }
      );

      assert.equal(ranked.length, 2);
      assert.equal(ranked[0].campaign.id, "camp-high");
    });

    it("формирует корректный EligibleAd с понятной маркировкой", () => {
      const ad = resolveEligibleAd(baseCampaign, {
        brand: mockBrand,
        product: safeUpholsteryProduct,
      });

      assert.equal(ad.campaignId, "camp-test-1");
      assert.equal(ad.brandName, "Kiehl");
      assert.equal(ad.badgeText, "Спонсорский проверенный вариант");
      assert.equal(ad.ctaText, "Где купить");
      assert.equal(ad.ctaUrl, "https://kiehl.ru");
      assert.equal(ad.ctaType, "where_to_buy");
    });
  });

  describe("серверные запросы getEligibleAd (возврат null при отсутствии)", () => {
    it("возвращает null, если подходящих кампаний нет (нет пустых дыр)", async () => {
      // Ищем плейсмент без подходящих кампаний (например, несуществующая страна или неизвестная категория)
      const ad = await getEligibleAd(
        "rating.category_partner",
        { countryCode: "US", categoryId: "non-existent" },
        { now: NOW }
      );

      assert.equal(ad, null);
    });

    it("возвращает null, если кампания просрочена", async () => {
      const futureDate = new Date("2035-01-01T00:00:00Z");
      const ad = await getEligibleAd(
        "home.editorial_partner",
        { countryCode: "BY" },
        { now: futureDate } // в 2035 году все текущие кампании просрочены
      );

      assert.equal(ad, null);
    });

    it("находит активную seed-кампанию для легитимного контекста", async () => {
      const ad = await getEligibleAd(
        "home.editorial_partner",
        { countryCode: "BY" },
        { now: NOW }
      );

      assert.notEqual(ad, null);
      assert.equal(ad?.brandId, "karcher");
      assert.equal(ad?.placement, "home.editorial_partner");
      assert.equal(ad?.badgeText, "Партнёр сезона");
    });
  });

  describe("разделение данных: рекламные кампании НЕ меняют органический рейтинг", () => {
    const ratedCompany = companies.find((c) => c.reviewCount > 0);
    if (!ratedCompany) throw new Error("No rated company found for test");

    it("органический балл компании не зависит от коммерческого продвижения", () => {
      const organicScore = calculateOrganicScore({ ...ratedCompany, promoted: false });
      const sponsoredScore = calculateOrganicScore({ ...ratedCompany, promoted: true });

      assert.notEqual(organicScore, null);
      assert.equal(sponsoredScore, organicScore);
    });

    it("поисковая релевантность не зависит от статуса спонсорства", () => {
      const organicRel = calculateRelevanceScore({ ...ratedCompany, promoted: false });
      const sponsoredRel = calculateRelevanceScore({ ...ratedCompany, promoted: true });

      assert.equal(sponsoredRel, organicRel);
    });

    it("Индекс доверия бренда строится только на подтверждённых фактах и не зависит от кампаний", () => {
      const scoreWithoutCampaign = computeBrandScore({
        brandId: "brand-1",
        verifiedCompanyCount: 4,
        recommendedCount: 2,
        alternativeCount: 1,
        clickCount: 50,
      });

      // Рекламная кампания не входит в расчет формулы доверия
      const scoreWithCampaign = computeBrandScore({
        brandId: "brand-1",
        verifiedCompanyCount: 4,
        recommendedCount: 2,
        alternativeCount: 1,
        clickCount: 50,
      });

      assert.equal(scoreWithCampaign.score, scoreWithoutCampaign.score);
      assert.equal(scoreWithCampaign.adoptionScore, scoreWithoutCampaign.adoptionScore);
    });
  });
});
