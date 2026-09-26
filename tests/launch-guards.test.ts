import assert from "node:assert/strict";
import { afterEach, describe, it } from "node:test";
import { GET as searchGET } from "../app/api/search/route.js";
import { POST as partnerLeadPOST } from "../app/api/partner-lead/route.js";
import { POST as brandLeadPOST } from "../app/api/brand-lead/route.js";
import { ENABLED_MARKETS, getMarket, getMarketByCity } from "../lib/markets.js";
import { formatCompanyPriceFrom } from "../lib/format.js";
import { pageAlternates } from "../lib/site.js";
import { isValidPhone } from "../lib/telegram.js";
import { verifyTurnstile } from "../lib/security/guard.js";

const realFetch = globalThis.fetch;
const envBackup = { ...process.env };

afterEach(() => {
  globalThis.fetch = realFetch;
  process.env = { ...envBackup };
});

function jsonRequest(url: string, body: unknown): Request {
  return new Request(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
}

describe("search cache", () => {
  it("never shares a region-dependent answer through the CDN", async () => {
    const res = await searchGET(new Request("http://localhost/api/search?q=диван", { headers: { cookie: "ch_region=BY:minsk" } }));
    const cacheControl = res.headers.get("Cache-Control") ?? "";
    assert.match(cacheControl, /private/);
    assert.doesNotMatch(cacheControl, /public|s-maxage/);
    assert.equal(res.headers.get("Vary"), "Cookie");
  });
});

describe("lead forms", () => {
  const validPartner = { companyName: "Чистый <b>дом</b>", phone: "+375 29 123-45-67", consent: true };

  it("escapes user input before sending HTML to Telegram", async () => {
    process.env.TELEGRAM_BOT_TOKEN = "test-token";
    process.env.TELEGRAM_CHAT_ID = "1";
    let sentText = "";
    globalThis.fetch = (async (_url: string, init?: RequestInit) => {
      sentText = JSON.parse(String(init?.body)).text;
      return new Response("{}", { status: 200 });
    }) as typeof fetch;

    const res = await partnerLeadPOST(
      jsonRequest("http://localhost/api/partner-lead", { ...validPartner, message: "<script>alert(1)</script>" })
    );
    assert.equal(res.status, 200);
    assert.match(sentText, /Чистый &lt;b&gt;дом&lt;\/b&gt;/);
    assert.match(sentText, /&lt;script&gt;/);
    assert.doesNotMatch(sentText, /<script>/);
  });

  it("requires explicit consent on the server", async () => {
    const res = await partnerLeadPOST(jsonRequest("http://localhost/api/partner-lead", { ...validPartner, consent: false }));
    assert.equal(res.status, 400);
  });

  it("rejects a missing Turnstile token when the secret is configured", async () => {
    process.env.TURNSTILE_SECRET_KEY = "secret";
    const partner = await partnerLeadPOST(jsonRequest("http://localhost/api/partner-lead", validPartner));
    assert.equal(partner.status, 403);
    const brand = await brandLeadPOST(
      jsonRequest("http://localhost/api/brand-lead", {
        brandName: "Grass",
        website: "",
        contactName: "Анна",
        contact: "anna@example.by",
        role: "dealer",
        goal: "",
        consent: true,
      })
    );
    assert.equal(brand.status, 403);
  });
});

describe("turnstile verification", () => {
  it("is skipped without a secret (local dev)", async () => {
    delete process.env.TURNSTILE_SECRET_KEY;
    assert.equal(await verifyTurnstile(undefined, new Request("http://localhost")), true);
  });

  it("trusts only a successful siteverify answer", async () => {
    process.env.TURNSTILE_SECRET_KEY = "secret";
    globalThis.fetch = (async () => new Response(JSON.stringify({ success: false }))) as typeof fetch;
    assert.equal(await verifyTurnstile("token", new Request("http://localhost")), false);
    globalThis.fetch = (async () => new Response(JSON.stringify({ success: true }))) as typeof fetch;
    assert.equal(await verifyTurnstile("token", new Request("http://localhost")), true);
  });
});

describe("market focus", () => {
  it("opens only Belarus until other markets have companies", () => {
    assert.deepEqual(
      ENABLED_MARKETS.map((m) => m.countryCode),
      ["BY"]
    );
  });

  it("falls back to the default market for a disabled country (old cookie)", () => {
    assert.equal(getMarket("RU").countryCode, "BY");
    assert.equal(getMarket("KZ").countryCode, "BY");
  });

  it("emits hreflang only for enabled markets", () => {
    const languages = Object.keys(pageAlternates("/").languages ?? {});
    assert.ok(languages.includes("ru-BY"));
    assert.ok(!languages.includes("ru-RU"));
    assert.ok(!languages.includes("ru-KZ"));
  });

  it("formats company prices and map links by the company city", () => {
    assert.match(formatCompanyPriceFrom(35, { city: "Минск", priceUnit: "м²" }), /Br|BYN/);
    assert.equal(getMarketByCity("Москва").mapsHost, "yandex.ru");
  });

  it("accepts phone numbers of any market within E.164 bounds", () => {
    assert.equal(isValidPhone("+375 29 123-45-67"), true);
    assert.equal(isValidPhone("+7 (999) 123-45-67"), true);
    assert.equal(isValidPhone("12345"), false);
    assert.equal(isValidPhone("1".repeat(16)), false);
  });
});

describe("admin surface", () => {
  it("is open in dev and requires Cloudflare Access in production", async () => {
    const { isAdminAllowed } = await import("../lib/admin/guard.js");
    process.env.NEXTJS_ENV = "development";
    assert.equal(isAdminAllowed(new Headers()), true);
    process.env.NEXTJS_ENV = "production";
    assert.equal(isAdminAllowed(new Headers()), false);
    assert.equal(
      isAdminAllowed(new Headers({ "cf-access-authenticated-user-email": "owner@cleanhub.by" })),
      true
    );
  });

  it("returns 404 for the CSV report without admin access", async () => {
    const { GET } = await import("../app/api/admin/report/route.js");
    process.env.NEXTJS_ENV = "production";
    const res = await GET(new Request("http://localhost/api/admin/report"));
    assert.equal(res.status, 404);
  });

  it("exports a parseable CSV report with BOM and campaign columns", async () => {
    const { GET } = await import("../app/api/admin/report/route.js");
    process.env.NEXTJS_ENV = "development";
    const res = await GET(new Request("http://localhost/api/admin/report"));
    assert.equal(res.status, 200);
    assert.match(res.headers.get("Content-Type") ?? "", /text\/csv/);
    const buf = new Uint8Array(await res.arrayBuffer());
    assert.deepEqual([...buf.slice(0, 3)], [0xef, 0xbb, 0xbf]);
    const text = new TextDecoder().decode(buf.slice(3));
    assert.match(text.split("\r\n")[0], /Кампания.*CTR/);
  });
});
