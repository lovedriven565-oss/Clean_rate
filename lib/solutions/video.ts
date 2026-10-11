/**
 * Парсер ссылок на видеоразборы протоколов.
 *
 * Поддерживаются YouTube (watch/shorts/youtu.be/embed), VK Видео и клипы,
 * Rutube и прямые файлы (mp4/webm). Чистая функция — тестируется без DOM.
 */

export type VideoSource =
  | { kind: "iframe"; provider: "youtube" | "vk" | "rutube"; embedUrl: string; vertical: boolean }
  | { kind: "file"; url: string };

const YOUTUBE_HOSTS = new Set(["youtube.com", "www.youtube.com", "m.youtube.com", "youtube-nocookie.com", "www.youtube-nocookie.com"]);

function isYouTubeShort(url: URL): boolean {
  return url.pathname.startsWith("/shorts/");
}

function youtubeId(url: URL): string | null {
  if (url.hostname === "youtu.be") {
    return url.pathname.slice(1).split("/")[0] || null;
  }
  if (isYouTubeShort(url)) {
    return url.pathname.split("/")[2] || null;
  }
  if (url.pathname.startsWith("/embed/")) {
    return url.pathname.split("/")[2] || null;
  }
  return url.searchParams.get("v");
}

function rutubeId(url: URL): string | null {
  // rutube.ru/video/<id>/ и rutube.ru/shorts/<id>/
  const parts = url.pathname.split("/").filter(Boolean);
  const kindIndex = parts.findIndex((p) => p === "video" || p === "shorts" || p === "play");
  return kindIndex >= 0 ? parts[kindIndex + 1] ?? null : null;
}

function vkEmbed(url: URL): string | null {
  // vkvideo.ru/video-<oid>_<id> и vk.com/video<oid>_<id>
  const match = url.pathname.match(/video(-?\d+)_(\d+)/);
  if (!match) return null;
  return `https://vk.com/video_ext.php?oid=${match[1]}&id=${match[2]}&hd=2`;
}

/**
 * Преобразует ссылку на видео в источник плеера.
 * Возвращает null для неподдерживаемых или небезопасных (не https) адресов.
 */
export function parseVideoSource(raw: string | null | undefined): VideoSource | null {
  if (!raw) return null;
  let url: URL;
  try {
    url = new URL(raw.trim());
  } catch {
    return null;
  }
  if (url.protocol !== "https:") return null;
  const host = url.hostname.toLowerCase();

  if (YOUTUBE_HOSTS.has(host) || host === "youtu.be") {
    const id = youtubeId(url);
    if (!id) return null;
    return {
      kind: "iframe",
      provider: "youtube",
      embedUrl: `https://www.youtube-nocookie.com/embed/${id}`,
      vertical: isYouTubeShort(url),
    };
  }
  if (host === "rutube.ru" || host === "www.rutube.ru") {
    const id = rutubeId(url);
    if (!id) return null;
    return {
      kind: "iframe",
      provider: "rutube",
      embedUrl: `https://rutube.ru/play/embed/${id}`,
      vertical: url.pathname.startsWith("/shorts/"),
    };
  }
  if (host === "vk.com" || host === "www.vk.com" || host === "vkvideo.ru" || host === "www.vkvideo.ru" || host === "m.vk.com") {
    const embedUrl = vkEmbed(url);
    if (!embedUrl) return null;
    return { kind: "iframe", provider: "vk", embedUrl, vertical: url.pathname.includes("/clip") };
  }
  if (/\.(mp4|webm|mov)$/i.test(url.pathname)) {
    return { kind: "file", url: url.toString() };
  }
  return null;
}
