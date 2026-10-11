import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { getInitials } from "../lib/avatar-utils.js";

describe("avatar initials", () => {
  it("takes two letters from a single word", () => {
    assert.equal(getInitials("FreshClean"), "FR");
  });

  it("takes the first letters of the first two words", () => {
    assert.equal(getInitials("Спектр Клининг"), "СК");
  });

  it("skips words that start with punctuation", () => {
    assert.equal(getInitials("Клин-Ап (CleanUP)"), "КЛ");
  });

  it("falls back for empty and punctuation-only names", () => {
    assert.equal(getInitials("   "), "?");
    assert.equal(getInitials("(--)"), "(-");
  });
});
