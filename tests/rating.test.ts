import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { getFallbackCompanies } from "../lib/db/fallback.js";
import {
  calculateOrganicScore,
  calculateRelevanceScore,
  hasPublishedRating,
  pickHomeCompanies,
  splitSponsors,
} from "../lib/rating.js";

const companies = getFallbackCompanies();

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

describe("home rating block", () => {
  it("moves promoted companies out of the ranked organic list", () => {
    const { organic, sponsors } = pickHomeCompanies(companies);
    assert.equal(organic.every((c) => !c.promoted), true);
    assert.equal(sponsors.every((c) => c.promoted), true);
    assert.equal(organic.length <= 3, true);
  });

  it("sorts organic top by relevance, not by payment", () => {
    const { organic } = pickHomeCompanies(companies);
    for (let i = 1; i < organic.length; i++) {
      assert.ok(calculateRelevanceScore(organic[i - 1]) >= calculateRelevanceScore(organic[i]));
    }
  });
});

describe("sponsor shelf split", () => {
  it("moves promoted companies out of organic without reordering either group", () => {
    const flagged = companies.map((c, i) => ({ ...c, promoted: i === 0 || i === 2 }));
    const { sponsors, organic } = splitSponsors(flagged);
    assert.deepEqual(sponsors.map((c) => c.id), [flagged[0].id, flagged[2].id]);
    assert.equal(organic.every((c) => !c.promoted), true);
    assert.deepEqual(
      organic.map((c) => c.id),
      flagged.filter((_, i) => i !== 0 && i !== 2).map((c) => c.id)
    );
  });

  it("keeps everything organic when nobody pays", () => {
    const { sponsors, organic } = splitSponsors(companies.map((c) => ({ ...c, promoted: false })));
    assert.equal(sponsors.length, 0);
    assert.equal(organic.length, companies.length);
  });
});
