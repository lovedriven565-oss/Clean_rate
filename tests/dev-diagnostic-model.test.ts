import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  DIAGNOSTIC_CONTEXT,
  buildDiagnosticResult,
  buildProCompanies,
  companyPriceLabel,
  externalRating,
  findProtocols,
  formatEstimate,
  listProblems,
  listSurfaces,
  nextRadioIndex,
  pickEstimate,
  rankOrganicCompanies,
  resolveSelection,
  telHref,
} from "../components/dev/diagnostic-model.js";
import { getFallbackCompanies, getFallbackPriceEstimates, getFallbackSolutions } from "../lib/db/fallback.js";
import type { Solution } from "../lib/types.js";

const solutions = getFallbackSolutions();
const companies = getFallbackCompanies();
const estimates = getFallbackPriceEstimates({ countryCode: "BY" });
const wine = solutions.find((s) => s.slug === "vino-na-divane")!;

describe("diagnostic: surfaces and problems", () => {
  it("surfaces come only from published solutions and counts are honest", () => {
    const surfaces = listSurfaces(solutions);
    assert.ok(surfaces.length > 0);
    for (const s of surfaces) {
      assert.equal(s.count, solutions.filter((x) => x.surface === s.id).length);
      assert.ok(s.count > 0);
      assert.ok(s.label.length > 0);
    }
    assert.equal(surfaces.reduce((sum, s) => sum + s.count, 0), solutions.length);
    assert.ok(!surfaces.some((s) => s.id === "carpet" || s.id === "facade"), "no protocols, so no tile");
  });

  it("draft and archived solutions never produce tiles", () => {
    const hidden: Solution[] = [
      { ...wine, id: "d", slug: "d", surface: "carpet", status: "draft" },
      { ...wine, id: "a", slug: "a", surface: "facade", status: "archived" },
    ];
    const surfaces = listSurfaces([...solutions, ...hidden]);
    assert.ok(!surfaces.some((s) => s.id === "carpet" || s.id === "facade"));
    assert.deepEqual(listProblems(hidden, "carpet"), []);
  });

  it("problems are only those that exist for the surface", () => {
    const problems = listProblems(solutions, "upholstery");
    assert.deepEqual(
      problems.map((p) => p.id),
      ["stain"],
    );
    assert.equal(problems[0].count, 2);
    assert.deepEqual(
      listProblems(solutions, "mattress").map((p) => p.id),
      ["stain", "odor"],
    );
    assert.deepEqual(listProblems(solutions, "facade"), []);
  });
});

describe("diagnostic: selection", () => {
  it("combination without a protocol yields null solution and no protocols", () => {
    assert.deepEqual(findProtocols(solutions, "facade", "stain"), []);
    assert.deepEqual(findProtocols(solutions, "upholstery", "odor"), []);
    const resolved = resolveSelection([], {});
    assert.equal(resolved.solution, null);
    assert.equal(resolved.surface, null);
    assert.equal(resolved.problem, null);
    assert.deepEqual(resolved.protocols, []);
  });

  it("empty selection auto-picks the first surface and its first problem", () => {
    const resolved = resolveSelection(solutions, {});
    assert.equal(resolved.surface, listSurfaces(solutions)[0].id);
    assert.equal(resolved.problem, listProblems(solutions, resolved.surface!)[0].id);
    assert.ok(resolved.solution);
  });

  it("invalid problem for a surface falls back to the first available problem", () => {
    const resolved = resolveSelection(solutions, { surface: "upholstery", problem: "odor" });
    assert.equal(resolved.problem, "stain");
    assert.equal(resolved.solution!.surface, "upholstery");
  });

  it("variant picks among several protocols for the same combination, unknown variant falls back", () => {
    const base = resolveSelection(solutions, { surface: "upholstery", problem: "stain" });
    assert.equal(base.protocols.length, 2);
    const other = base.protocols[1];
    assert.equal(resolveSelection(solutions, { surface: "upholstery", problem: "stain", variant: other.slug }).solution!.slug, other.slug);
    assert.equal(resolveSelection(solutions, { surface: "upholstery", problem: "stain", variant: "nope" }).solution!.slug, base.protocols[0].slug);
  });
});

describe("diagnostic: keyboard", () => {
  it("roving radio navigation wraps and supports Home/End", () => {
    assert.equal(nextRadioIndex("ArrowRight", 0, 3), 1);
    assert.equal(nextRadioIndex("ArrowDown", 2, 3), 0);
    assert.equal(nextRadioIndex("ArrowLeft", 0, 3), 2);
    assert.equal(nextRadioIndex("ArrowUp", 1, 3), 0);
    assert.equal(nextRadioIndex("Home", 2, 5), 0);
    assert.equal(nextRadioIndex("End", 0, 5), 4);
    assert.equal(nextRadioIndex("Enter", 0, 5), null);
    assert.equal(nextRadioIndex("ArrowRight", 0, 0), null);
  });
});

describe("diagnostic: estimate", () => {
  it("picks the BY/Minsk estimate of the solution and never a category-level one", () => {
    const e = pickEstimate(estimates, wine)!;
    assert.equal(e.countryCode, DIAGNOSTIC_CONTEXT.countryCode);
    assert.equal(e.city, DIAGNOSTIC_CONTEXT.city);
    assert.equal(e.solutionId, wine.id);
    assert.equal(e.currency, "BYN");
    const all = getFallbackPriceEstimates();
    assert.equal(pickEstimate(all, wine)!.countryCode, "BY", "other markets must not leak in");
  });

  it("does not throw and returns null without data", () => {
    assert.equal(pickEstimate([], wine), null);
    assert.equal(pickEstimate(estimates, { ...wine, id: "missing" }), null);
    const result = buildDiagnosticResult(wine, []);
    assert.equal(result.estimate, null);
  });

  it("formats min and max in the market currency with the unit", () => {
    const e = pickEstimate(estimates, wine)!;
    const view = formatEstimate(e);
    assert.match(view.min, /60/);
    assert.match(view.max, /120/);
    assert.equal(view.unit, e.unit);
    assert.equal(view.city, "Минск");
  });
});

describe("diagnostic: result", () => {
  it("warnings first-class, steps limited, hidden count is honest", () => {
    const result = buildDiagnosticResult(wine, estimates, 2);
    assert.deepEqual(result.warnings, wine.warnings);
    assert.ok(result.warnings.length > 0);
    assert.equal(result.steps.length, Math.min(2, wine.diySteps.length));
    assert.equal(result.totalSteps, wine.diySteps.length);
    assert.equal(result.hiddenSteps, wine.diySteps.length - result.steps.length);
    assert.equal(result.href, `/solutions/${wine.slug}`);
    assert.equal(result.whenToCallPro, wine.whenToCallPro);
    assert.ok(result.estimate);
  });

  it("every published solution builds a result without inventing fields", () => {
    for (const s of solutions) {
      const r = buildDiagnosticResult(s, estimates);
      assert.equal(r.title, s.title);
      assert.ok(r.steps.length >= 1 && r.steps.length <= 2);
      for (const step of r.steps) assert.ok(!("minutes" in step) && !("duration" in step));
    }
  });
});

describe("pro companies", () => {
  it("telHref keeps the real number and strips formatting", () => {
    assert.equal(telHref("+375 29 186-98-88"), "tel:+375291869888");
    assert.equal(telHref("+375 29 66 33 555"), "tel:+375296633555");
    assert.equal(telHref("8 (017) 123-45-67"), "tel:80171234567");
  });

  it("external rating only for Google/Yandex with reviews", () => {
    const base = companies.find((c) => !c.promoted)!;
    assert.equal(externalRating({ ...base, ratingSource: "unverified", baseRating: 4.9, reviewCount: 50 }), null);
    assert.equal(externalRating({ ...base, ratingSource: "new", baseRating: 5, reviewCount: 3 }), null);
    assert.equal(externalRating({ ...base, ratingSource: "google", baseRating: 4.5, reviewCount: 0 }), null);
    assert.deepEqual(externalRating({ ...base, ratingSource: "yandex", baseRating: 4.5, reviewCount: 8 }), {
      value: 4.5,
      count: 8,
      source: "Яндекс",
    });
  });

  it("organic ranking ignores payment: flipping promoted never changes the order", () => {
    const order = (list: typeof companies) => rankOrganicCompanies(list, wine).map((c) => c.id);
    const base = order(companies);
    assert.deepEqual(order(companies.map((c) => ({ ...c, promoted: false }))), base);
    assert.deepEqual(order(companies.map((c) => ({ ...c, promoted: true }))), base);
    const sponsorId = companies.find((c) => c.promoted)!.id;
    assert.deepEqual(order(companies.map((c) => (c.id === sponsorId ? { ...c, promoted: false } : { ...c, promoted: !c.promoted }))), base);
  });

  it("organic order is trust-based: relevance, verified, confirmed external rating, experience", () => {
    const ranked = rankOrganicCompanies(companies, wine);
    const relevant = ranked.filter((c) => c.categories.includes(wine.relatedCategory!));
    assert.deepEqual(ranked.slice(0, relevant.length), relevant, "relevant companies come first");
    const verifiedFlags = relevant.map((c) => c.verified);
    assert.deepEqual(verifiedFlags, [...verifiedFlags].sort((a, b) => Number(b) - Number(a)));
    const unverified = relevant.filter((c) => !c.verified);
    const withRating = unverified.filter((c) => externalRating(c));
    const withoutRating = unverified.filter((c) => !externalRating(c));
    assert.ok(withRating.length > 0 && withoutRating.length > 0, "seed has both kinds");
    assert.ok(unverified.indexOf(withRating[0]) < unverified.indexOf(withoutRating[0]));
    const experienced = withoutRating.filter((c) => c.experienceYears);
    const unknown = withoutRating.filter((c) => !c.experienceYears);
    if (experienced.length && unknown.length) {
      assert.ok(withoutRating.indexOf(experienced[0]) < withoutRating.indexOf(unknown[0]));
    }
  });

  it("sponsor goes to a separate slot and is not duplicated in the organic list", () => {
    const { sponsor, organic } = buildProCompanies(companies, wine);
    assert.ok(sponsor, "demo sponsor covers upholstery");
    assert.ok(sponsor!.promoted);
    assert.ok(!organic.some((c) => c.id === sponsor!.id));
    assert.ok(organic.length <= 3 && organic.length > 0);
    assert.ok(organic.every((c) => c.city === DIAGNOSTIC_CONTEXT.city));
  });

  it("organic list is identical with and without a sponsor (minus the sponsor himself)", () => {
    const without = buildProCompanies(
      companies.map((c) => ({ ...c, promoted: false })),
      wine,
      { limit: 20 },
    );
    const withSponsor = buildProCompanies(companies, wine, { limit: 20 });
    assert.equal(without.sponsor, null);
    const expected = without.organic.filter((c) => c.id !== withSponsor.sponsor!.id).map((c) => c.id);
    assert.deepEqual(withSponsor.organic.map((c) => c.id), expected);
  });

  it("sponsor must be relevant to the solution category, otherwise no slot", () => {
    const sponsorOnly = companies.map((c) => (c.promoted ? { ...c, categories: ["apartments" as const] } : c));
    assert.equal(buildProCompanies(sponsorOnly, wine).sponsor, null);
  });

  it("no companies in the city gives an honest empty result", () => {
    const empty = buildProCompanies([], wine);
    assert.equal(empty.sponsor, null);
    assert.deepEqual(empty.organic, []);
    const foreign = buildProCompanies(companies.map((c) => ({ ...c, city: "Брест" })), wine);
    assert.equal(foreign.sponsor, null);
    assert.deepEqual(foreign.organic, []);
  });

  it("price label never invents a price and removes currency from the unit", () => {
    const base = companies.find((c) => !c.promoted)!;
    assert.equal(companyPriceLabel({ ...base, priceFrom: undefined }), "Цена по запросу");
    const cleanoff = companies.find((c) => c.slug === "cleanoff")!;
    const label = companyPriceLabel(cleanoff);
    assert.match(label, /^от /);
    assert.doesNotMatch(label, /BYN\/|Br\/BYN/);
    assert.match(label, /\/мес$/);
  });
});
