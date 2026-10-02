import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  HERO_SEARCH_LIMIT,
  heroExampleChips,
  heroSubmitTarget,
  normalizeHeroQuery,
  searchHeroSolutions,
} from "../components/dev/hero-search.js";
import { getFallbackSolutions } from "../lib/db/fallback.js";
import type { Solution } from "../lib/types.js";

const solutions = getFallbackSolutions();

const draftSolution: Solution = {
  id: "draft-vino",
  slug: "chernovik-vino",
  title: "Черновик: вино на ковре",
  problemType: "stain",
  surface: "carpet",
  severity: "fresh",
  audience: "b2c",
  diySteps: [],
  warnings: [],
  whenToCallPro: "",
  searchKeywords: ["вино черновик"],
  status: "draft",
};

describe("dev hero search", () => {
  it("returns nothing for empty or whitespace query", () => {
    assert.deepEqual(searchHeroSolutions("", "b2c", solutions), []);
    assert.deepEqual(searchHeroSolutions("   ", "b2b", solutions), []);
  });

  it("matches by title keywords for a natural b2c query", () => {
    const items = searchHeroSolutions("вино на диване", "b2c", solutions);
    assert.equal(items[0]?.slug, "vino-na-divane");
    assert.equal(items[0]?.href, "/solutions/vino-na-divane");
  });

  it("handles free phrasing via token ranking", () => {
    const items = searchHeroSolutions("как отмыть старый кофе с обивки", "b2c", solutions);
    assert.ok(items.some((i) => i.slug === "kofe-na-tekstile"));
  });

  it("never returns drafts and produces no duplicates", () => {
    const withDraft = [...solutions, draftSolution];
    const items = searchHeroSolutions("вино", "b2c", withDraft);
    assert.ok(items.every((i) => i.slug !== "chernovik-vino"));
    assert.equal(new Set(items.map((i) => i.slug)).size, items.length);
  });

  it("filters by audience: b2c excludes b2b-only, keeps 'both'", () => {
    const office = searchHeroSolutions("уборка офиса", "b2c", solutions);
    assert.ok(office.every((i) => i.slug !== "uborka-ofisa-posle-korporativa"));

    const officeB2b = searchHeroSolutions("уборка офиса", "b2b", solutions);
    assert.ok(officeB2b.some((i) => i.slug === "uborka-ofisa-posle-korporativa"));

    // «both»-протокол доступен обеим аудиториям
    const zatirkaB2c = searchHeroSolutions("затирка на плитке", "b2c", solutions);
    const zatirkaB2b = searchHeroSolutions("затирка на плитке", "b2b", solutions);
    assert.ok(zatirkaB2c.some((i) => i.slug === "poslestroy-zatirka-plitka"));
    assert.ok(zatirkaB2b.some((i) => i.slug === "poslestroy-zatirka-plitka"));
  });

  it("honestly returns empty for 'pro' (not part of SolutionAudience)", () => {
    assert.deepEqual(searchHeroSolutions("вино", "pro", solutions), []);
    assert.deepEqual(searchHeroSolutions("офис", "pro", solutions), []);
  });

  it("returns empty on no-match and caps at the limit", () => {
    assert.deepEqual(searchHeroSolutions("экзистенциальная несуществующая задача", "b2c", solutions), []);
    const items = searchHeroSolutions("на", "b2c", solutions);
    assert.ok(items.length <= HERO_SEARCH_LIMIT);
  });

  it("maps every item to a safe existing /solutions href", () => {
    const slugs = new Set(solutions.map((s) => s.slug));
    for (const item of searchHeroSolutions("пятно", "b2c", solutions)) {
      assert.equal(item.href, `/solutions/${item.slug}`);
      assert.ok(slugs.has(item.slug));
    }
  });

  it("submit target is the first suggestion or null", () => {
    const items = searchHeroSolutions("вино", "b2c", solutions);
    assert.equal(heroSubmitTarget(items), items[0]?.href);
    assert.equal(heroSubmitTarget([]), null);
  });

  it("normalizes whitespace and picks real chips from published solutions", () => {
    assert.equal(normalizeHeroQuery("  Вино   на   диване "), "вино на диване");
    const chips = heroExampleChips(solutions);
    assert.equal(chips.length, 3);
    const keywords = new Set(solutions.flatMap((s) => s.searchKeywords));
    for (const chip of chips) assert.ok(keywords.has(chip));
  });
});
