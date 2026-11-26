import assert from "node:assert/strict";
import { describe, it } from "node:test";
import sitemap from "../app/sitemap.js";
import { getFallbackCompanies, getFallbackSolutions } from "../lib/db/fallback.js";
import {
  cityStaticParams,
  getFooterCityLinks,
  getIndexableCities,
  getIndexableLandings,
  resolveCityParams,
  resolveLandingParams,
} from "../lib/landing.js";
import { buildSolutionFaq, buildSolutionJsonLd, serializeJsonLd } from "../lib/solutions/structured-data.js";
import { CATEGORY_GUIDES } from "../lib/landings/category-guides.js";
import { CATEGORIES } from "../lib/categories.js";
import { getFooterLandingLinksByCity } from "../lib/landing.js";
import { absoluteUrl, cityAlternates, pageAlternates } from "../lib/site.js";

describe("regional SEO architecture", () => {
  it("exposes city hubs only for open cities", () => {
    assert.deepEqual(
      cityStaticParams().map((p) => p.city).sort(),
      ["minsk", "moscow"]
    );
    assert.equal(resolveCityParams("minsk")?.city.slug, "minsk");
    assert.equal(resolveCityParams("spb"), undefined);
    // Рынок KZ закрыт флагом — хаб Алматы не генерируется.
    assert.equal(resolveCityParams("almaty"), undefined);
    assert.equal(resolveCityParams("companies"), undefined);
    assert.equal(resolveLandingParams("moscow", "uborka-kvartir")?.category.id, "apartments");
    assert.equal(resolveLandingParams("moscow", "ne-sushchestvuet"), undefined);
  });

  it("maps regional hreflang to the first open city of each market", () => {
    const moscow = cityAlternates("moscow", "uborka-kvartir");
    assert.equal(moscow.canonical, absoluteUrl("/moscow/uborka-kvartir"));
    const languages = moscow.languages ?? {};
    assert.equal(languages["ru-BY"], absoluteUrl("/minsk/uborka-kvartir"));
    assert.equal(languages["ru-RU"], absoluteUrl("/moscow/uborka-kvartir"));
    // Закрытый рынок не попадает в hreflang-кластер.
    assert.equal(languages["ru-KZ"], undefined);
    // x-default стабилен внутри кластера: первый индексируемый рынок (BY → minsk),
    // а не canonical текущей страницы.
    assert.equal(languages["x-default"], absoluteUrl("/minsk/uborka-kvartir"));

    const hub = cityAlternates("moscow");
    assert.equal((hub.languages ?? {})["ru-RU"], absoluteUrl("/moscow"));
    assert.equal((hub.languages ?? {})["x-default"], absoluteUrl("/minsk"));
  });

  it("drops hreflang alternates for thin regional pages", () => {
    // В обоих открытых городах сейчас хватает компаний во всех категориях,
    // поэтому тонкость моделируем явным includeCitySlugs.
    const alternates = cityAlternates("moscow", "uborka-posle-remonta", { includeCitySlugs: new Set(["minsk"]) });
    const languages = alternates.languages ?? {};
    // Москва не входит в список индексируемых для категории — её hreflang не отдаётся.
    assert.equal(languages["ru-RU"], undefined);
    assert.equal(languages["ru-BY"], absoluteUrl("/minsk/uborka-posle-remonta"));
    assert.equal(languages["x-default"], absoluteUrl("/minsk/uborka-posle-remonta"));
  });

  it("keeps indexable city hubs and landings consistent with the company threshold", () => {
    const companies = getFallbackCompanies();
    const cities = getIndexableCities(companies).map((c) => c.city);
    assert.ok(cities.includes("minsk"));
    assert.ok(cities.includes("moscow"));
    // Закрытый рынок исключён из хабов даже при наличии компаний в данных.
    assert.ok(!cities.includes("almaty"));
    assert.deepEqual(getIndexableCities([]), []);

    const landings = getIndexableLandings(companies);
    assert.ok(landings.length > 0);
    assert.ok(landings.every((l) => cities.includes(l.city)));
    assert.deepEqual(getIndexableLandings([]), []);

    const footerCities = getFooterCityLinks(companies);
    assert.deepEqual(
      footerCities.map((l) => l.href).sort(),
      ["/minsk", "/moscow"]
    );
  });
});

describe("sitemap", () => {
  it("includes static pages, city hubs and only indexable landings", async () => {
    const entries = await sitemap();
    const urls = entries.map((e) => e.url);
    for (const path of ["/", "/solutions", "/rating", "/brands", "/terms", "/privacy"]) {
      assert.ok(urls.includes(absoluteUrl(path)), `missing ${path}`);
    }
    for (const city of ["/minsk", "/moscow"]) {
      assert.ok(urls.includes(absoluteUrl(city)), `missing city hub ${city}`);
    }
    const companies = getFallbackCompanies();
    const landings = getIndexableLandings(companies);
    for (const { city, category } of landings) {
      assert.ok(urls.includes(absoluteUrl(`/${city}/${category}`)), `missing landing /${city}/${category}`);
    }
    // Страниц закрытых рынков и скрытых городов в sitemap нет.
    assert.ok(!urls.some((u) => u.includes("/almaty") || u.includes("/spb") || u.includes("/brest")));
    // Обратная проверка: в sitemap только индексируемые посадочные, без «тонких».
    const indexableSet = new Set(landings.map((l) => absoluteUrl(`/${l.city}/${l.category}`)));
    const citySlugs = new Set(cityStaticParams().map((p) => p.city));
    for (const url of urls) {
      const match = url.match(/\/([^/]+)\/([^/]+)$/);
      if (match && citySlugs.has(match[1])) {
        assert.ok(indexableSet.has(url), `thin landing in sitemap: ${url}`);
      }
    }
  });
});

describe("solution structured data", () => {
  const solution = getFallbackSolutions()[0];
  const url = absoluteUrl(`/solutions/${solution.slug}`);
  const faq = buildSolutionFaq(solution, []);
  const jsonLd = buildSolutionJsonLd(solution, url, faq, [
    { name: "Главная", url: absoluteUrl("/") },
    { name: solution.title, url },
  ]);

  it("emits HowTo + FAQPage + BreadcrumbList without a hardcoded currency", () => {
    const graph = jsonLd["@graph"] as Record<string, unknown>[];
    const types = graph.map((n) => n["@type"]);
    assert.ok(types.includes("HowTo"));
    assert.ok(types.includes("FAQPage"));
    assert.ok(types.includes("BreadcrumbList"));
    const serialized = JSON.stringify(jsonLd);
    assert.ok(!serialized.includes('"currency":"BYN"'));
    const howTo = graph.find((n) => n["@type"] === "HowTo") as Record<string, unknown>;
    assert.ok(Array.isArray(howTo.image));
    // author/publisher ссылаются на единый узел Organization по @id
    assert.equal((howTo.author as Record<string, unknown>)["@id"], `${absoluteUrl("/")}#organization`);
    assert.equal((howTo.publisher as Record<string, unknown>)["@id"], `${absoluteUrl("/")}#organization`);
    // E-E-A-T: проверяющий, даты и источники присутствуют
    assert.equal(typeof howTo.reviewedBy, "object");
    assert.ok(typeof howTo.datePublished === "string");
    assert.ok(typeof howTo.dateModified === "string");
    // Свободный текст стоимости не должен попадать в estimatedCost
    assert.equal(howTo.estimatedCost, undefined);
  });

  it("escapes < in serialized JSON-LD", () => {
    const out = serializeJsonLd({ html: "<script>" });
    assert.ok(!out.includes("<script>"));
    assert.ok(out.includes("\\u003c"));
  });
});

describe("category guides and footer linking", () => {
  it("provides unique guide content for every category", () => {
    for (const category of CATEGORIES) {
      const guide = CATEGORY_GUIDES[category.id];
      assert.ok(guide, `missing guide for ${category.id}`);
      assert.ok(guide.priceFactors.length >= 4, `${category.id}: priceFactors`);
      assert.ok(guide.checklist.length >= 5, `${category.id}: checklist`);
      assert.ok(guide.faq.length >= 4, `${category.id}: faq`);
      // Страница мульти-рыночная — валюта не должна быть зашита в текст гайда.
      for (const item of guide.faq) {
        assert.ok(!item.answer.includes("BYN"), `${category.id}: hardcoded currency in "${item.question}"`);
      }
    }
  });

  it("footer links only indexable landings of open cities", () => {
    const companies = getFallbackCompanies();
    const byCity = getFooterLandingLinksByCity(companies);
    const indexable = new Set(getIndexableLandings(companies).map((l) => `/${l.city}/${l.category}`));
    assert.ok(byCity.length >= 2, "expected at least 2 indexable cities");
    for (const city of byCity) {
      assert.ok(city.links.length > 0, `city ${city.cityName} has no links`);
      for (const link of city.links) {
        assert.ok(indexable.has(link.href), `non-indexable link ${link.href}`);
      }
    }
    // Без компаний посадочные «тонкие» — ссылок на noindex-страницы нет.
    assert.deepEqual(getFooterLandingLinksByCity([]), []);
  });
});

describe("llms.txt", () => {
  it("describes the platform and links key sections and protocols", async () => {
    const { GET } = await import("../app/llms.txt/route.js");
    const response = await GET();
    assert.equal(response.headers.get("content-type"), "text/plain; charset=utf-8");
    const text = await response.text();
    assert.ok(text.includes("ChistoLab"));
    assert.ok(text.includes("/solutions"));
    assert.ok(text.includes("/rating/methodology"));
    assert.ok(text.includes("/solutions/vino-na-divane"));
    assert.ok(text.includes("/minsk"));
  });
});
