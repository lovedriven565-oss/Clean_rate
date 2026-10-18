import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { describe, it } from "node:test";
import {
  CONTACT_HASH_PREFIX,
  TRANSIT_CONTACT_LABEL,
  hashContactForAudit,
  normalizeContact,
  redactLeadPii,
} from "../lib/privacy/pii.js";

describe("Zero-PII: hashContactForAudit", () => {
  it("returns tg-sha256:<16 hex> matching SHA-256 of the normalized contact", async () => {
    const hash = await hashContactForAudit("+375 (29) 123-45-67");
    assert.match(hash, /^tg-sha256:[0-9a-f]{16}$/);
    const expected = createHash("sha256").update("375291234567").digest("hex").slice(0, 16);
    assert.equal(hash, `${CONTACT_HASH_PREFIX}${expected}`);
  });

  it("is stable across phone formatting and email case, so duplicates are detectable", async () => {
    assert.equal(await hashContactForAudit("+375291234567"), await hashContactForAudit("375 29 123 45 67"));
    assert.equal(await hashContactForAudit(" Sales@Brand.BY "), await hashContactForAudit("sales@brand.by"));
    assert.notEqual(await hashContactForAudit("+375291234567"), await hashContactForAudit("+375291234568"));
  });

  it("changes the digest when a pepper is set", async () => {
    const plain = await hashContactForAudit("+375291234567");
    const peppered = await hashContactForAudit("+375291234567", "secret-pepper");
    assert.notEqual(plain, peppered);
    assert.match(peppered, /^tg-sha256:[0-9a-f]{16}$/);
  });

  it("never leaks the raw contact into the digest", async () => {
    const hash = await hashContactForAudit("+375291234567");
    assert.equal(hash.includes("375291234567"), false);
  });
});

describe("Zero-PII: redactLeadPii", () => {
  it("replaces the contact name with the transit label and the contact with a hash", async () => {
    const redacted = await redactLeadPii({ contactName: "Иван Петров", contact: "+7 999 123-45-67" });
    assert.equal(redacted.contactName, TRANSIT_CONTACT_LABEL);
    assert.match(redacted.contactHash, /^tg-sha256:[0-9a-f]{16}$/);
    assert.equal(JSON.stringify(redacted).includes("Иван"), false);
    assert.equal(JSON.stringify(redacted).includes("999"), false);
  });

  it("keeps an empty contact name empty (null)", async () => {
    assert.equal((await redactLeadPii({ contactName: "  ", contact: "+375291234567" })).contactName, null);
    assert.equal((await redactLeadPii({ contact: "+375291234567" })).contactName, null);
  });

  it("normalizes telegram handles and short values as text", () => {
    assert.equal(normalizeContact("@CleanBoss"), "@cleanboss");
    assert.equal(normalizeContact("12-34"), "12-34");
  });
});
