import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  RESCUE_SCENARIO_ORDER,
  buildRescueComparison,
  buildRescueScenarios,
} from "../components/solution/RescueCalculator.js";
import { getFallbackPriceEstimates, getFallbackSolutions } from "../lib/db/fallback.js";

const solutions = getFallbackSolutions();
const allEstimates = getFallbackPriceEstimates();
const wine = solutions.find((s) => s.slug === "vino-na-divane")!;

describe("RescueCalculator scenarios", () => {
  it("exposes 3 scenarios in order: fresh (85%), dried (40%), rubbed (15%)", () => {
    assert.deepEqual(RESCUE_SCENARIO_ORDER, ["fresh", "dried", "rubbed"]);
    const scenarios = buildRescueScenarios(wine, "60 Br");

    assert.equal(scenarios.fresh.buttonLabel, "Только что (свежее)");
    assert.equal(scenarios.fresh.chancePercent, 85);
    assert.equal(scenarios.fresh.ctaHref, "#diy-steps");
    assert.equal(scenarios.fresh.recommendProCall, false);

    assert.equal(scenarios.dried.buttonLabel, "Засохло (вчера и раньше)");
    assert.equal(scenarios.dried.chancePercent, 40);
    assert.equal(scenarios.dried.ctaHref, "#diy-products");
    assert.equal(scenarios.dried.recommendProCall, false);

    assert.equal(scenarios.rubbed.buttonLabel, "Уже тёрли бытовой химией / содой / горячей водой");
    assert.equal(scenarios.rubbed.chancePercent, 15);
    assert.match(scenarios.rubbed.headline, /Стоп! Шанс дома: 15%/);
    assert.match(scenarios.rubbed.explanation, /экстрактор/);
    assert.match(scenarios.rubbed.ctaLabel, /60 Br/);
    assert.equal(scenarios.rubbed.recommendProCall, true);
  });
});

describe("RescueCalculator money & time comparison table", () => {
  it("builds 3 rows (household, pro_diy, master) with BYN estimate for Minsk", () => {
    const rows = buildRescueComparison(wine, allEstimates, {
      countryCode: "BY",
      city: "Минск",
      currency: "BYN",
    });

    assert.equal(rows.length, 3);
    assert.equal(rows[0].id, "household");
    assert.match(rows[0].costLabel, /^0/);
    assert.match(rows[0].timeLabel, /15 минут/);

    assert.equal(rows[1].id, "pro_diy");
    assert.equal(rows[1].costLabel, wine.diyCostNote);
    assert.match(rows[1].timeLabel, /30 мин/);

    assert.equal(rows[2].id, "master");
    assert.match(rows[2].costLabel, /60/);
    assert.match(rows[2].costLabel, /120/);
    assert.match(rows[2].timeLabel, /с гарантией/);
  });

  it("formats master and pro_diy costs in RUB and KZT for RU and KZ markets", () => {
    const ruRows = buildRescueComparison(wine, allEstimates, {
      countryCode: "RU",
      city: "Москва",
      currency: "RUB",
    });
    assert.match(ruRows[1].costLabel, /800/);
    assert.match(ruRows[2].costLabel, /2\s?500/);
    assert.match(ruRows[2].costLabel, /5\s?000/);

    const kzRows = buildRescueComparison(wine, allEstimates, {
      countryCode: "KZ",
      city: "Алматы",
      currency: "KZT",
    });
    assert.match(kzRows[1].costLabel, /4\s?000/);
    assert.match(kzRows[2].costLabel, /12\s?000/);
    assert.match(kzRows[2].costLabel, /25\s?000/);
  });
});
