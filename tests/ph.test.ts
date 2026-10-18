import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  buildHumanSafetyBadge,
  findSeedProduct,
  formatProPhLabel,
  phPosition,
  phZone,
  phZoneLabel,
  riskZonesForSurface,
  surfaceLabel,
  surfaceVerdict,
} from "../lib/ph.js";

const acidCleaner = { id: "acid", name: "Cement cleaner", ph: 1.5, compatibleSurfaces: ["floor"], prohibitedSurfaces: ["upholstery", "marble"] };
const neutralSpotter = { id: "neutral", name: "Spotter", ph: 7, compatibleSurfaces: ["upholstery"], prohibitedSurfaces: ["leather"] };
const mildAlkaliEnzyme = { id: "enzyme", name: "Enzyme", ph: 8.5, compatibleSurfaces: ["upholstery"], prohibitedSurfaces: ["silk"] };
const alkaliDegreaser = { id: "alkali", name: "Degreaser", ph: 11.5, compatibleSurfaces: ["kitchen"] };

describe("pH scale", () => {
  it("classifies zones at the documented boundaries", () => {
    assert.equal(phZone(1.5), "acid");
    assert.equal(phZone(3), "mild-acid");
    assert.equal(phZone(5.9), "mild-acid");
    assert.equal(phZone(6), "neutral");
    assert.equal(phZone(8), "neutral");
    assert.equal(phZone(8.5), "mild-alkali");
    assert.equal(phZone(11.5), "alkali");
    assert.equal(phZoneLabel(7), "Нейтральный");
  });

  it("marks risk zones with the safety gate thresholds", () => {
    assert.deepEqual(riskZonesForSurface("marble"), [{ from: 0, to: 6 }]);
    assert.deepEqual(riskZonesForSurface("wool"), [{ from: 9.5, to: 14 }]);
    assert.deepEqual(riskZonesForSurface("upholstery"), []);
  });

  it("clamps the marker to the 0–14 scale", () => {
    assert.equal(phPosition(7), 50);
    assert.equal(phPosition(-2), 0);
    assert.equal(phPosition(20), 100);
  });
});

describe("surface compatibility", () => {
  it("forbids what the safety gate forbids", () => {
    assert.equal(surfaceVerdict(acidCleaner, "marble").verdict, "forbidden");
    assert.equal(surfaceVerdict(acidCleaner, "upholstery").verdict, "forbidden");
    assert.equal(surfaceVerdict(alkaliDegreaser, "wool").verdict, "forbidden");
  });

  it("allows manufacturer-approved surfaces and neutral chemistry", () => {
    assert.equal(surfaceVerdict(acidCleaner, "floor").verdict, "ok");
    assert.equal(surfaceVerdict(neutralSpotter, "carpet").verdict, "ok");
  });

  it("asks for caution when there is no explicit approval", () => {
    const result = surfaceVerdict(alkaliDegreaser, "floor");
    assert.equal(result.verdict, "caution");
    assert.ok(result.reason);
  });

  it("labels solution surfaces and raw materials in Russian", () => {
    assert.equal(surfaceLabel("marble"), "Мрамор");
    assert.equal(surfaceLabel("upholstery"), "Мебель");
  });
});

describe("human safety traffic light badges", () => {
  it("returns green badge for neutral safe product with compact pro pH label", () => {
    const badge = buildHumanSafetyBadge({ product: neutralSpotter, surface: "upholstery" });
    assert.equal(badge.light, "green");
    assert.equal(badge.label, "Не оставляет белых разводов · Безопасно для обивки и ворса");
    assert.match(badge.className, /bg-success\/10/);
    assert.match(badge.className, /text-success/);
    assert.equal(badge.proPhLabel, "Для профи: pH 7.0");
    assert.deepEqual(badge.compatibleLabels, ["Мебель"]);
    assert.deepEqual(badge.prohibitedLabels, ["Кожа"]);
  });

  it("returns yellow caution badge for non-neutral enzyme formula or delicate material", () => {
    const badge = buildHumanSafetyBadge({ product: mildAlkaliEnzyme, surface: "upholstery" });
    assert.equal(badge.light, "yellow");
    assert.equal(badge.label, "Сначала тест на незаметном шве · Деликатное покрытие");
    assert.match(badge.className, /bg-star\/15/);
    assert.match(badge.className, /text-star/);
    assert.equal(badge.proPhLabel, "Для профи: pH 8.5");
  });

  it("returns red danger badge when product is prohibited on the surface", () => {
    const badge = buildHumanSafetyBadge({ product: acidCleaner, surface: "upholstery" });
    assert.equal(badge.light, "red");
    assert.match(badge.label, /Риск смыть краску или оставить вечный ореол/);
    assert.match(badge.className, /bg-danger\/10/);
    assert.match(badge.className, /text-danger/);
    assert.equal(badge.proPhLabel, "Для профи: pH 1.5");
  });

  it("formats pro pH label only when numeric pH is provided", () => {
    assert.equal(formatProPhLabel(7), "Для профи: pH 7.0");
    assert.equal(formatProPhLabel(8.5), "Для профи: pH 8.5");
    assert.equal(formatProPhLabel(undefined), null);
    assert.equal(formatProPhLabel(null), null);
  });

  it("resolves seedProducts by productId or by product name inside solution note", () => {
    const byId = findSeedProduct({ productId: "prod-kiehl-arenas" });
    assert.equal(byId?.name, "Kiehl Arenas-exet 3");

    const byNote = findSeedProduct({
      brandId: "kiehl",
      note: "Kiehl Arenas-exet 3 (удаление танинов и растительных пигментов)",
    });
    assert.equal(byNote?.id, "prod-kiehl-arenas");
    assert.equal(byNote?.ph, 7.0);
  });
});

