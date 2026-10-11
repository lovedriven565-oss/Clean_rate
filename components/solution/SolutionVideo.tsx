import { Play } from "lucide-react";
import { parseVideoSource } from "@/lib/solutions/video";
import { cn } from "@/lib/utils";

/**
 * Видеоразбор протокола в «Пути 1»: короткое вертикальное видео (Shorts/Клипы)
 * или горизонтальный разбор. Слот появляется только при заполненном videoUrl.
 * Серверный компонент — iframe рендерится в SSR без сдвига вёрстки.
 */
export function SolutionVideo({ videoUrl, title }: { videoUrl?: string; title: string }) {
  const source = parseVideoSource(videoUrl);
  if (!source) return null;

  return (
    <figure className="mt-6">
      <figcaption className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-muted-foreground">
        <Play className="h-3.5 w-3.5 text-primary" />
        Видеоразбор протокола
      </figcaption>
      <div
        className={cn(
          "data-surface relative overflow-hidden rounded-panel",
          source.kind === "iframe" && source.vertical
            ? "mx-auto aspect-[9/16] w-full max-w-[320px]"
            : "aspect-video w-full"
        )}
      >
        {source.kind === "iframe" ? (
          <iframe
            src={source.embedUrl}
            title={`Видеоразбор: ${title}`}
            loading="lazy"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            className="absolute inset-0 h-full w-full"
          />
        ) : (
          <video
            src={source.url}
            controls
            preload="metadata"
            className="absolute inset-0 h-full w-full object-cover"
          >
            Ваш браузер не поддерживает воспроизведение видео.
          </video>
        )}
      </div>
    </figure>
  );
}
