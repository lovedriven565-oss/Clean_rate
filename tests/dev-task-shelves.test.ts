import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { buildTaskShelves } from "../components/dev/task-shelves.js";
import { getFallbackSolutions } from "../lib/db/fallback.js";
import type { Solution } from "../lib/types.js";

const solutions = getFallbackSolutions();

const draftSolution: Solution = {
  id: "draft-kitchen",
  slug: "chernovik-kuhnya",
  title: "Черновик: жир на кухне",
  problemType: "stain",
  surface: "kitchen",
  severity: "fresh",
  audience: "b2c",
  diySteps: [],
  warnings: [],
  whenToCallPro: "",
  searchKeywords: ["жир черновик"],
  status: "draft",
};

const ALLOWED_FILTERS = /^\/solutions(\?((type|surface)=[a-z]+)(&[a-z]+=[a-z]+)*)?$/;

describe("dev task shelves", () => {
  it("builds covers only for shelves with real published matches", () => {
    const shelves = buildTaskShelves(solutions);
    assert.ok(shelves.length >= 4 && shelves.length <= 6);
    for (const cover of shelves) {
      assert.ok(cover.count > 0);
      assert.equal(cover.count, cover.slugs.length);
    }
  });

  it("counts honestly: shelf count equals real published matches", () => {
    const shelves = buildTaskShelves(solutions);
    const stains = shelves.find((s) => s.id === "stains");
    assert.ok(stains);
    assert.equal(
      stains.count,
      solutions.filter((s) => s.problemType === "stain").length,
    );
    const office = shelves.find((s) => s.id === "office");
    assert.ok(office);
    assert.deepEqual(office.slugs, ["uborka-ofisa-posle-korporativa"]);
  });

  it("every cover links to a real /solutions destination", () => {
    for (const cover of buildTaskShelves(solutions)) {
      assert.match(cover.href, ALLOWED_FILTERS);
    }
  });

  it("has exactly one featured cover", () => {
    const featured = buildTaskShelves(solutions).filter((s) => s.featured);
    assert.equal(featured.length, 1);
    assert.equal(featured[0].id, "stains");
  });

  it("excludes drafts from counts", () => {
    const shelves = buildTaskShelves([...solutions, draftSolution]);
    const kitchen = shelves.find((s) => s.id === "kitchen");
    assert.ok(kitchen);
    assert.equal(
      kitchen.count,
      solutions.filter((s) => s.surface === "kitchen").length,
    );
    assert.ok(kitchen.slugs.every((slug) => slug !== "chernovik-kuhnya"));
  });

  it("returns empty list without solutions — no fake covers", () => {
    assert.deepEqual(buildTaskShelves([]), []);
  });

  it("uses unique local images with alt text", () => {
    const shelves = buildTaskShelves(solutions);
    const imgs = shelves.map((s) => s.img);
    assert.equal(new Set(imgs).size, imgs.length);
    for (const cover of shelves) {
      assert.match(cover.img, /^\/dev\/a-tasks\/[a-z-]+\.jpg$/);
      assert.ok(cover.imgAlt.length > 10);
    }
  });

  it("covers all published solutions across shelves", () => {
    const shelves = buildTaskShelves(solutions);
    const covered = new Set(shelves.flatMap((s) => s.slugs));
    for (const s of solutions) {
      assert.ok(covered.has(s.slug), `solution ${s.slug} is not on any shelf`);
    }
  });
});
