import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { buildDemandRadar, percentDelta, type DemandEventCount } from "../lib/admin/demand-radar.js";
import type { Category, CategoryId, IntentKeyword, Solution } from "../lib/types.js";

const solutions = [
  { slug: "vino-na-divane", title: "Вино на диване", relatedCategory: "upholstery" },
  { slug: "plesen-v-vannoy", title: "Плесень в ванной", relatedCategory: "deep-cleaning" },
] as Solution[];

const categories: Category[] = [
  { id: "upholstery", name: "Химчистка мебели", icon: "sofa" },
  { id: "offices", name: "Уборка офисов", icon: "building" },
  { id: "deep-cleaning", name: "Генеральная уборка", icon: "sparkles" },
];

const keywords: IntentKeyword[] = [
  { keyword: "вино на диване", intent: "b2c", weight: 10, targetKind: "solution", targetSlug: "vino-na-divane" },
  { keyword: "пятно от вина", intent: "b2c", weight: 5, targetKind: "solution", targetSlug: "vino-na-divane" },
  { keyword: "плесень", intent: "b2c", weight: 5, targetKind: "solution", targetSlug: "plesen-v-vannoy" },
  { keyword: "офис", intent: "b2b", weight: 15, targetKind: "category", targetSlug: "offices" },
  { keyword: "kiehl", intent: "pro", weight: 5, targetKind: "brand", targetSlug: "kiehl" },
];

const companies = [{ id: "c1", slug: "spectrclean", categories: ["offices", "upholstery"] as CategoryId[] }];

describe("buildDemandRadar", () => {
  it("ranks protocols by keyword weight when there are no events", () => {
    const radar = buildDemandRadar({ keywords, solutions, categories, companies, events: [], missed: [] });
    assert.equal(radar.hasEvents, false);
    assert.deepEqual(
      radar.topics.map((t) => [t.slug, t.keywords, t.weight]),
      [
        ["vino-na-divane", 2, 15],
        ["plesen-v-vannoy", 1, 5],
      ]
    );
  });

  it("computes intent shares from keyword weights", () => {
    const radar = buildDemandRadar({
      keywords,
      solutions,
      categories,
      companies,
      events: [],
      missed: [{ query: "ковёр", intent: "b2c" }, { query: "склад", intent: "b2b" }, { query: "склад", intent: "b2b" }],
    });
    assert.deepEqual(
      radar.intents.map((i) => [i.intent, i.share, i.missed]),
      [
        ["b2c", 50, 1],
        ["b2b", 38, 2],
        ["pro", 13, 0],
      ]
    );
    assert.deepEqual(radar.missedQueries, [
      { query: "склад", count: 2 },
      { query: "ковёр", count: 1 },
    ]);
  });

  it("puts real page views first and tracks category dynamics", () => {
    const events: DemandEventCount[] = [
      { entityType: "page", entityId: "/solutions/plesen-v-vannoy", eventType: "view", period: "current", count: 40 },
      { entityType: "page", entityId: "/solutions/plesen-v-vannoy", eventType: "view", period: "previous", count: 20 },
      { entityType: "page", entityId: "/solutions/vino-na-divane", eventType: "view", period: "current", count: 5 },
      { entityType: "page", entityId: "/minsk/uborka-ofisov", eventType: "view", period: "current", count: 7 },
      { entityType: "company", entityId: "c1", eventType: "phone", period: "previous", count: 4 },
      { entityType: "page", entityId: "/brands/kiehl", eventType: "view", period: "current", count: 99 },
    ];
    const radar = buildDemandRadar({ keywords, solutions, categories, companies, events, missed: [] });

    assert.equal(radar.hasEvents, true);
    assert.equal(radar.topics[0].slug, "plesen-v-vannoy");
    assert.equal(radar.topics[0].views, 40);
    assert.equal(percentDelta(radar.topics[0].views, radar.topics[0].previousViews), 100);

    const byId = Object.fromEntries(radar.categories.map((c) => [c.id, c]));
    assert.deepEqual([byId["deep-cleaning"].current, byId["deep-cleaning"].previous, byId["deep-cleaning"].delta], [40, 20, 100]);
    assert.deepEqual([byId.offices.current, byId.offices.previous, byId.offices.delta], [7, 4, 75]);
    assert.deepEqual([byId.upholstery.current, byId.upholstery.previous, byId.upholstery.delta], [5, 4, 25]);
    assert.equal(radar.categories[0].id, "deep-cleaning");
  });

  it("percentDelta returns null without a baseline", () => {
    assert.equal(percentDelta(10, 0), null);
    assert.equal(percentDelta(5, 10), -50);
  });
});
