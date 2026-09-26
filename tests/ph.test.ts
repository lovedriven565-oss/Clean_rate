import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { phPosition, phZone, phZoneLabel, riskZonesForSurface, surfaceLabel, surfaceVerdict } from "../lib/ph.js";

const acidCleaner = { id: "acid", name: "Cement cleaner", ph: 1.5, compatibleSurfaces: ["floor"], prohibitedSurfaces: ["upholstery"] };
const neutralSpotter = { id: "neutral", name: "Spotter", ph: 7, compatibleSurfaces: ["upholstery"] };
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
