import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  AD_CTA_META,
  AD_MARK_LABEL,
  adCtaMeta,
  adTrackingEntity,
  buildAdReasons,
  describePh,
  isAdVisibleInCountry,
} from "../lib/ads/presentation.js";
import { getEligibleAd, getEligibleAdsForCategories } from "../lib/ads/queries.js";
import type { AdCtaType } from "../lib/types.js";

const NOW = new Date("2026-09-01T12:00:00Z");

describe("Блок 3 — презентационный слой рекламы", () => {
  describe("постоянная маркировка и CTA", () => {
    it("маркировка — видимое слово «Реклама», а не tooltip", () => {
      assert.equal(AD_MARK_LABEL, "Реклама");
    });

    it("каждый тип CTA имеет подпись, иконку и объяснение действия", () => {
      const types: AdCtaType[] = ["where_to_buy", "request_quote", "training", "demo", "website"];
      for (const type of types) {
        const meta = AD_CTA_META[type];
        assert.ok(meta.label.length > 0, `label для ${type}`);
        assert.ok(meta.hint.length > 0, `hint для ${type}`);
        assert.ok(meta.icon.length > 0, `icon для ${type}`);
      }
      assert.equal(AD_CTA_META.where_to_buy.label, "Где купить у дилера");
      assert.equal(AD_CTA_META.request_quote.label, "Запросить оптовый прайс");
      assert.equal(AD_CTA_META.training.label, "Записаться на обучение");
      assert.equal(AD_CTA_META.demo.label, "Запросить демо");
    });

    it("текст CTA кампании переопределяет подпись по умолчанию, иконка остаётся по типу", () => {
      const meta = adCtaMeta({ ctaType: "where_to_buy", ctaText: "Купить у официального дилера" });
      assert.equal(meta.label, "Купить у официального дилера");
      assert.equal(meta.icon, "store");
    });
  });

  describe("«Почему подходит» — только проверяемые факты", () => {
    it("собирает причину допуска, класс pH и допуски производителя (текущая поверхность первой)", () => {
      const reasons = buildAdReasons(
        {
          reasonText: "Продукт или бренд подтверждён в официальном протоколе решения",
          productPh: 7,
          productCompatibleSurfaces: ["carpet", "upholstery", "mattress"],
        },
        "upholstery"
      );

      assert.equal(reasons.length, 3);
      assert.match(reasons[0], /подтверждён в официальном протоколе/);
      assert.match(reasons[1], /pH 7 — нейтральный/);
      assert.match(reasons[2], /^Допущен производителем для: мебель, ковёр, матрас$/);
    });

    it("не выдумывает факты: без данных список пустой", () => {
      assert.deepEqual(buildAdReasons({}), []);
    });

    it("игнорирует неизвестные поверхности в паспорте продукта", () => {
      const reasons = buildAdReasons({ productCompatibleSurfaces: ["unknown_surface"] });
      assert.deepEqual(reasons, []);
    });

    it("честно классифицирует pH", () => {
      assert.match(describePh(1.5), /кислотный/);
      assert.match(describePh(7), /нейтральный/);
      assert.match(describePh(11.5), /щелочной/);
    });
  });

  describe("трекинг и гео-гейт", () => {
    it("событие атрибутируется продукту, если он есть у кампании, иначе бренду", () => {
      assert.deepEqual(adTrackingEntity({ productId: "prod-1", brandId: "kiehl" }), {
        entityType: "product",
        entityId: "prod-1",
      });
      assert.deepEqual(adTrackingEntity({ brandId: "karcher" }), { entityType: "brand", entityId: "karcher" });
    });

    it("кампания без гео-ограничений видна везде, с ограничениями — только в своих странах", () => {
      assert.equal(isAdVisibleInCountry({ targetCountries: null }, "KZ"), true);
      assert.equal(isAdVisibleInCountry({ targetCountries: ["BY", "RU"] }, "by"), true);
      assert.equal(isAdVisibleInCountry({ targetCountries: ["BY", "RU"] }, "KZ"), false);
    });
  });

  describe("серверная выборка для шаблонов", () => {
    it("спонсорский состав получает причину допуска и факты паспорта для блока «Почему подходит»", async () => {
      const ad = await getEligibleAd(
        "solution.sponsored_product",
        { solutionSlug: "vino-na-divane", surface: "upholstery", countryCode: "BY" },
        { now: NOW }
      );

      assert.notEqual(ad, null);
      assert.equal(ad?.productId, "prod-kiehl-arenas");
      assert.ok(ad?.reasonText, "reasonText должен быть заполнен relevance-гейтом");
      assert.equal(ad?.productPh, 7);
      assert.ok(ad?.brandAccent, "brandAccent нужен шаблону для деликатного акцента");
      assert.ok(buildAdReasons(ad!, "upholstery").length >= 2);
    });

    it("пакетная выборка по категориям: партнёр только у таргетированной категории, остальным — null", async () => {
      const ads = await getEligibleAdsForCategories(
        "rating.category_partner",
        ["offices", "apartments", "windows"],
        { countryCode: "BY" },
        { now: NOW }
      );

      assert.equal(ads.offices?.brandId, "grass");
      assert.equal(ads.offices?.placement, "rating.category_partner");
      assert.equal(ads.apartments, null);
      assert.equal(ads.windows, null);
    });

    it("пакетная выборка возвращает null для всех категорий, если кампании просрочены", async () => {
      const ads = await getEligibleAdsForCategories(
        "rating.category_partner",
        ["offices"],
        { countryCode: "BY" },
        { now: new Date("2035-01-01T00:00:00Z") }
      );

      assert.equal(ads.offices, null);
    });
  });
});
