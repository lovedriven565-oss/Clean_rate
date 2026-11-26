import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { seedBrands, seedProducts, seedSolutionProducts, seedSolutions } from "../db/seed-data";
import { checkProductSafety } from "../lib/ads/eligibility";
import { findSeedProduct } from "../lib/ph";

/**
 * Регрессия по итогам веб-аудита средств (инцидент Kiehl Arenas-exet 3 —
 * кислотный пятновыводитель ржавчины был выдан за нейтральное средство для обивки):
 * - все связи протокол↔бренд/решение ссылаются на существующие сущности;
 * - каждый продукт, разрешённый из заметки по названию, проходит проверку
 *   совместимости с поверхностью своего протокола (checkProductSafety);
 * - Arenas-exet и прочие кислотные средства не маскируются под нейтральные.
 */
describe("product audit regression", () => {
  it("every solution-product link references existing brand and solution", () => {
    const brandIds = new Set(seedBrands.map((b) => b.id));
    const solutionIds = new Set(seedSolutions.map((s) => s.id));
    for (const sp of seedSolutionProducts) {
      assert.ok(sp.brandId && brandIds.has(sp.brandId), `${sp.id}: unknown brandId «${sp.brandId}»`);
      assert.ok(solutionIds.has(sp.solutionId), `${sp.id}: unknown solutionId «${sp.solutionId}»`);
    }
  });

  it("resolved products are safe for their protocol surface", () => {
    for (const sp of seedSolutionProducts) {
      const solution = seedSolutions.find((s) => s.id === sp.solutionId);
      assert.ok(solution, `${sp.id}: solution not found`);
      const product = findSeedProduct({ brandId: sp.brandId, note: sp.note });
      if (!product) continue; // бренд-уровневые рекомендации (техника, Vileda, Bosch)
      const safety = checkProductSafety({ product, surface: solution.surface, solution });
      assert.ok(safety.safe, `${sp.id}: «${product.name}» несовместим с «${solution.slug}» — ${safety.reason}`);
    }
  });

  it("no Arenas-exet or fabricated stain removers remain in catalog", () => {
    for (const p of seedProducts) {
      assert.ok(!/arenas/i.test(p.name), `запрещённый продукт в каталоге: ${p.name}`);
    }
    for (const sp of seedSolutionProducts) {
      assert.ok(!/arenas/i.test(sp.note ?? ""), `${sp.id}: ссылка на Arenas-exet`);
    }
  });

  it("pH values are inside the measurable range and acidic products are not sold as neutral", () => {
    for (const p of seedProducts) {
      if (p.ph !== undefined) {
        assert.ok(p.ph >= 0 && p.ph <= 14, `${p.name}: pH ${p.ph} вне диапазона`);
      }
      const desc = `${p.name} ${p.description}`.toLowerCase();
      if (p.ph !== undefined && p.ph < 5) {
        assert.ok(!/нейтральн/.test(desc), `${p.name}: pH ${p.ph} не может называться нейтральным`);
      }
    }
  });
});
