import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { companies } from "../lib/mock-data.js";
import { calculateOrganicScore, calculateRelevanceScore, hasPublishedRating } from "../lib/rating.js";

const ratedCompany = companies.find((company) => company.reviewCount > 0);
const unratedCompany = companies.find((company) => company.reviewCount === 0);

if (!ratedCompany || !unratedCompany) throw new Error("Rating fixtures are incomplete");

describe("organic rating", () => {
  it("publishes a score only with a supported review source", () => {
    assert.equal(hasPublishedRating(ratedCompany), true);
    assert.notEqual(calculateOrganicScore(ratedCompany), null);
    assert.equal(hasPublishedRating(unratedCompany), false);
    assert.equal(calculateOrganicScore(unratedCompany), null);
  });

  it("never uses paid promotion in the organic score", () => {
    const organic = calculateOrganicScore({ ...ratedCompany, promoted: false });
    const promoted = calculateOrganicScore({ ...ratedCompany, promoted: true });
    assert.equal(promoted, organic);
  });

  it("never uses paid promotion in relevance", () => {
    const organic = calculateRelevanceScore({ ...ratedCompany, promoted: false });
    const promoted = calculateRelevanceScore({ ...ratedCompany, promoted: true });
    assert.equal(promoted, organic);
  });

  it("keeps the published score within the documented range", () => {
    const score = calculateOrganicScore({ ...ratedCompany, baseRating: 5, reviewCount: 100000 });
    assert.notEqual(score, null);
    assert.ok((score as number) >= 0);
    assert.ok((score as number) <= 100);
  });
});
