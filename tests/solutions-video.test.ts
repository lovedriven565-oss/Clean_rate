import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { parseVideoSource } from "../lib/solutions/video.js";

describe("parseVideoSource", () => {
  it("returns null for missing, malformed or non-https input", () => {
    assert.equal(parseVideoSource(undefined), null);
    assert.equal(parseVideoSource(""), null);
    assert.equal(parseVideoSource("not a url"), null);
    assert.equal(parseVideoSource("http://youtube.com/watch?v=abc123"), null);
    assert.equal(parseVideoSource("javascript:alert(1)"), null);
  });

  it("parses YouTube watch links into a nocookie embed", () => {
    const source = parseVideoSource("https://www.youtube.com/watch?v=dQw4w9WgXcQ");
    assert.deepEqual(source, {
      kind: "iframe",
      provider: "youtube",
      embedUrl: "https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ",
      vertical: false,
    });
  });

  it("parses youtu.be and YouTube Shorts (vertical)", () => {
    const short = parseVideoSource("https://www.youtube.com/shorts/AbC123XyZ");
    assert.equal(short?.kind === "iframe" && short.embedUrl, "https://www.youtube-nocookie.com/embed/AbC123XyZ");
    assert.equal(short?.kind === "iframe" && short.vertical, true);

    const mobile = parseVideoSource("https://youtu.be/dQw4w9WgXcQ?t=10");
    assert.equal(mobile?.kind === "iframe" && mobile.embedUrl, "https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ");
  });

  it("parses Rutube video and shorts links", () => {
    const video = parseVideoSource("https://rutube.ru/video/0123abc456def/");
    assert.deepEqual(video, {
      kind: "iframe",
      provider: "rutube",
      embedUrl: "https://rutube.ru/play/embed/0123abc456def",
      vertical: false,
    });
    const short = parseVideoSource("https://rutube.ru/shorts/0123abc456def/");
    assert.equal(short?.kind === "iframe" && short.vertical, true);
  });

  it("parses VK video links into an external embed", () => {
    const source = parseVideoSource("https://vkvideo.ru/video-123456_789");
    assert.equal(source?.kind === "iframe" && source.provider, "vk");
    assert.equal(
      source?.kind === "iframe" && source.embedUrl,
      "https://vk.com/video_ext.php?oid=-123456&id=789&hd=2"
    );
  });

  it("passes through direct video files and rejects unknown hosts", () => {
    const file = parseVideoSource("https://cdn.example.com/guides/wine.mp4");
    assert.deepEqual(file, { kind: "file", url: "https://cdn.example.com/guides/wine.mp4" });
    assert.equal(parseVideoSource("https://vimeo.com/12345"), null);
    assert.equal(parseVideoSource("https://youtube.com/"), null);
  });
});
