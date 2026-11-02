import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { seedCompanies, seedPriceEstimates } from "../db/seed-data";
import { CLEANING_SERVICES, pickCategoryEstimate, pickTopCompany } from "../lib/home/cleaning-services";
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
