import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { seedCompanies, seedPriceEstimates } from "../db/seed-data";
import { CLEANING_SERVICES, cleanerCardPrice, pickCategoryEstimate, pickTopCompany } from "../lib/home/cleaning-services";
import type { Company, PriceEstimate } from "../lib/types";

describe("cleaning-services", () => {
  const estimates = seedPriceEstimates as unknown as PriceEstimate[];

  it("для каждого рынка есть смета по всем 6 услугам", () => {
    assert.equal(CLEANING_SERVICES.length, 6);
    for (const [countryCode, city] of [["BY", "Минск"], ["RU", "Москва"], ["KZ", "Алматы"]]) {
      for (const s of CLEANING_SERVICES) {
        const e = pickCategoryEstimate(estimates, s.id, { countryCode, city });
        assert.ok(e && e.priceMin > 0, `${countryCode}/${s.id}`);
      }
    }
  });

  it("компания выбирается только из города и категории", () => {
    const companies = seedCompanies as unknown as Company[];
    const top = pickTopCompany(companies, "apartments", "Минск");
    if (top) {
      assert.equal(top.city, "Минск");
      assert.ok(top.categories.includes("apartments"));
    }
    assert.equal(pickTopCompany(companies, "apartments", "Нигде"), null);
  });

  it("цена в карточке — только когда единица прайса совпадает с единицей услуги", () => {
    const companies = seedCompanies as unknown as Company[];
    const perMeter = companies.find((c) => c.priceFrom && c.priceUnit === "м²")!;
    assert.match(cleanerCardPrice(perMeter, "м²"), /^от /);
    assert.equal(cleanerCardPrice(perMeter, "уборку"), "Цена по запросу");
    assert.equal(cleanerCardPrice(perMeter, null), "Цена по запросу");
    const noUnit = companies.find((c) => c.priceFrom && !c.priceUnit)!;
    assert.equal(cleanerCardPrice(noUnit, "уборку"), "Цена по запросу");
  });

  it("в каждом открытом городе есть топ-компания по всем 6 услугам — блок клинеров не пуст", () => {
    const companies = seedCompanies as unknown as Company[];
    for (const city of ["Минск", "Москва", "Алматы"]) {
      for (const s of CLEANING_SERVICES) {
        const top = pickTopCompany(companies, s.id, city);
        assert.ok(top, `${city}/${s.id}`);
      }
    }
  });
});
