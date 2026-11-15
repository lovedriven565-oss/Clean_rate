import { getCloudflareContext } from "@opennextjs/cloudflare";

export const dynamic = "force-dynamic";

/** Белый список расширений: svg/html не отдаём — иначе XSS на основном домене. */
const MEDIA_TYPES: Record<string, string> = {
  mp4: "video/mp4",
  webm: "video/webm",
  mov: "video/quicktime",
  mp3: "audio/mpeg",
  m4a: "audio/mp4",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  avif: "image/avif",
  gif: "image/gif",
};

type MediaEnv = { MEDIA?: R2Bucket };

function notFound() {
  return new Response("Not found", { status: 404 });
}

/**
 * Отдаёт файлы из R2-бакета `chisyolab` (биндинг MEDIA) как
 * https://chistolab.pro/media/<key>. Кастомный домен у бакета не используем —
 * он конфликтовал бы с доменом воркера. Поддерживает Range (перемотка видео)
 * и If-None-Match/304. Объекты Headers никуда не передаём (ни в get(), ни в
 * writeHttpMetadata): dev-прокси getPlatformProxy не сериализует их через RPC.
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ key: string[] }> },
) {
  const { key } = await params;

  let objectKey: string;
  try {
    objectKey = key.map((segment) => decodeURIComponent(segment)).join("/");
  } catch {
    return notFound();
  }

  const ext = objectKey.split(".").pop()?.toLowerCase() ?? "";
  const hasUnsafeSegment = objectKey.split("/").some((s) => s === "" || s === "." || s === "..");
  if (hasUnsafeSegment || !(ext in MEDIA_TYPES)) {
    return notFound();
  }

  let bucket: R2Bucket | undefined;
  try {
    const { env } = await getCloudflareContext({ async: true });
    bucket = (env as MediaEnv).MEDIA;
  } catch {
    bucket = undefined;
  }
  if (!bucket) return notFound();

  const meta = await bucket.head(objectKey);
  if (!meta) return notFound();
  const total = meta.size;

  const headers = new Headers();
  const md = meta.httpMetadata;
  if (md?.contentLanguage) headers.set("content-language", md.contentLanguage);
  if (md?.contentDisposition) headers.set("content-disposition", md.contentDisposition);
  if (md?.contentEncoding) headers.set("content-encoding", md.contentEncoding);
  headers.set("content-type", MEDIA_TYPES[ext]);
  headers.set("accept-ranges", "bytes");
  headers.set("etag", meta.httpEtag);
  headers.set("cache-control", "public, max-age=31536000, immutable");

  // If-None-Match → 304 (список тегов, W/-слабые и *).
  const ifNoneMatch = request.headers.get("if-none-match");
  if (ifNoneMatch) {
    const strip = (etag: string) => etag.replace(/^W\//, "").replace(/^"|"$/g, "");
    const current = strip(meta.httpEtag);
    const hit = ifNoneMatch
      .split(",")
      .map((value) => value.trim())
      .some((candidate) => candidate === "*" || strip(candidate) === current);
    if (hit) {
      return new Response(null, { status: 304, headers });
    }
  }

  // Разбор Range (один диапазон; мультидиапазоны и мусор игнорируем → 200).
  let range: { offset: number; length: number } | undefined;
  const rangeHeader = request.headers.get("range");
  const match = rangeHeader ? /^bytes=(\d+)-(\d*)$|^bytes=-(\d+)$/.exec(rangeHeader.trim()) : null;
  if (match) {
    let start: number;
    let end: number;
    if (match[3] !== undefined) {
      const suffix = Math.min(Number.parseInt(match[3], 10), total);
      start = total - suffix;
      end = total - 1;
    } else {
      start = Number.parseInt(match[1], 10);
      end = match[2] ? Math.min(Number.parseInt(match[2], 10), total - 1) : total - 1;
    }
    if (start < total && start <= end) {
      range = { offset: start, length: end - start + 1 };
      headers.set("content-range", `bytes ${start}-${end}/${total}`);
    } else {
      headers.set("content-range", `bytes */${total}`);
      return new Response(null, { status: 416, headers });
    }
  }

  const object = await bucket.get(objectKey, range ? { range } : undefined);
  if (!object) return notFound();

  headers.set("content-length", String(range ? range.length : total));
  return new Response(object.body, { status: range ? 206 : 200, headers });
}
