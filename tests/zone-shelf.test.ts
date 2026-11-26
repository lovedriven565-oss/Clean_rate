import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { seedAffiliateProducts, seedBrands, seedProducts, seedSolutionProducts } from "../db/seed-data";
import {
  HOME_ZONES,
  buildShelfProducts,
  displayPrice,
  productsInZone,
  safetyTags,
} from "../lib/products/zone-shelf";

const shelf = buildShelfProducts(seedAffiliateProducts, seedProducts, seedSolutionProducts, seedBrands);

describe("zone-shelf", () => {
  it("в каждой из 5 зон есть товары", () => {
    assert.equal(HOME_ZONES.length, 5);
    for (const zone of HOME_ZONES) {
      assert.ok(productsInZone(shelf, zone.id).length > 0, `пустая зона ${zone.id}`);
    }
  });

  it("аффилиат и паспорт продукта сливаются по slug", () => {
    const stainPro = shelf.find((p) => p.slug === "prochem-stain-pro");
    assert.ok(stainPro);
    assert.equal(stainPro.price, undefined); // цена скрыта без подтверждённого источника
    assert.equal(stainPro.ph, 10.5);         // из паспорта
    assert.ok(stainPro.zones.includes("furniture"));
  });

  it("человеческие теги не содержат сырых цифр pH", () => {
    for (const p of shelf) {
      for (const tag of p.safetyTags) {
        assert.ok(!/pH|\d/.test(tag), `${p.slug}: «${tag}»`);
      }
    }
  });

  it("теги отражают запреты и состав", () => {
    assert.ok(safetyTags({ ph: 7, compatibleSurfaces: ["upholstery"] }).includes("Нейтральный состав"));
    const tags = safetyTags({ ph: 1.5, prohibitedSurfaces: ["marble", "enamel"] });
    assert.ok(tags.includes("Сильный состав"));
    assert.ok(tags.some((t) => t === "Не для мрамора и эмали"));
  });

  it("пересчёт цены — ориентировочный и с округлением", () => {
    assert.deepEqual(displayPrice(68, "BYN"), { value: 68, approx: false });
    const rub = displayPrice(68, "RUB");
    assert.equal(rub.approx, true);
    assert.equal(rub.value % 50, 0);
    const kzt = displayPrice(68, "KZT");
    assert.equal(kzt.value % 500, 0);
  });

  it("продукт из паспорта связывается с протоколом по названию в заметке", () => {
    const sanikal = shelf.find((p) => p.slug === "kiehl-sanikal-eco");
    assert.equal(sanikal?.solutionSlug, "vodny-kamen-dushevaya");
  });
});
