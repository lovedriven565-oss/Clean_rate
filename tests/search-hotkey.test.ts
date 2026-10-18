import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { isEditableTarget, isSearchHotkey } from "../lib/search/hotkey.js";

describe("isSearchHotkey", () => {
  it("triggers on / outside of inputs", () => {
    assert.equal(isSearchHotkey({ key: "/", code: "Slash" }, false), true);
    assert.equal(isSearchHotkey({ key: "/", code: "Slash" }, true), false);
  });

  it("triggers on ⌘K and Ctrl+K everywhere, including the Russian layout", () => {
    assert.equal(isSearchHotkey({ key: "k", code: "KeyK", metaKey: true }, false), true);
    assert.equal(isSearchHotkey({ key: "k", code: "KeyK", ctrlKey: true }, true), true);
    assert.equal(isSearchHotkey({ key: "л", code: "KeyK", ctrlKey: true }, false), true);
    assert.equal(isSearchHotkey({ key: ".", code: "Slash" }, false), true);
  });

  it("ignores plain letters and modified slashes", () => {
    assert.equal(isSearchHotkey({ key: "k", code: "KeyK" }, false), false);
    assert.equal(isSearchHotkey({ key: "/", code: "Slash", ctrlKey: true }, false), false);
    assert.equal(isSearchHotkey({ key: "k", code: "KeyK", ctrlKey: true, altKey: true }, false), false);
  });
});

describe("isEditableTarget", () => {
  it("detects inputs, textareas and contenteditable", () => {
    assert.equal(isEditableTarget({ tagName: "INPUT" } as unknown as EventTarget), true);
    assert.equal(isEditableTarget({ tagName: "TEXTAREA" } as unknown as EventTarget), true);
    assert.equal(isEditableTarget({ tagName: "DIV", isContentEditable: true } as unknown as EventTarget), true);
    assert.equal(isEditableTarget({ tagName: "BUTTON" } as unknown as EventTarget), false);
    assert.equal(isEditableTarget(null), false);
  });
});
