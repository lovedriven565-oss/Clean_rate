"use client";

import { useState } from "react";
import { Play } from "lucide-react";
import { parseVideoSource } from "@/lib/solutions/video";
import type { EligibleAd } from "@/lib/types";

type AdMedia = Pick<EligibleAd, "mediaType" | "mediaUrl" | "mediaPoster" | "mediaAlt" | "brandName">;

/**
 * Медиа-креатив рекламной кампании: проверенное фото или видео бренда.
 * Видео — click-to-play: iframe не грузится до явного нажатия (как в витрине решений).
 * Без корректного mediaUrl возвращает null — родитель показывает фирменный знак.
 */
export function AdMediaPanel({ mediaType, mediaUrl, mediaPoster, mediaAlt, brandName }: AdMedia) {
  const [playing, setPlaying] = useState(false);

  if (!mediaType || !mediaUrl) return null;

  if (mediaType === "image") {
    return (
      <div className="overflow-hidden rounded-panel border border-border/70 bg-surface-2">
        {/* eslint-disable-next-line @next/next/no-img-element -- внешний креатив бренда, домен заранее неизвестен */}
        <img
          src={mediaUrl}
          alt={mediaAlt ?? `Материалы бренда ${brandName}`}
          loading="lazy"
          className="aspect-[4/3] w-full object-cover"
        />
      </div>
    );
  }

  const source = parseVideoSource(mediaUrl);
  if (!source) return null;

  if (source.kind === "file") {
    return (
      <div className="overflow-hidden rounded-panel border border-border/70 bg-black">
        <video
          controls
          preload="metadata"
          poster={mediaPoster ?? undefined}
          src={source.url}
          className="aspect-video w-full"
        />
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden rounded-panel border border-border/70 bg-black">
      {playing ? (
        <iframe
          src={source.embedUrl}
          title={mediaAlt ?? `Видео бренда ${brandName}`}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="aspect-video w-full"
        />
      ) : (
        <button
          type="button"
          onClick={() => setPlaying(true)}
          aria-label={mediaAlt ?? `Смотреть видео бренда ${brandName}`}
          className="group relative flex aspect-video w-full items-center justify-center"
        >
          {mediaPoster ? (
            // eslint-disable-next-line @next/next/no-img-element -- обложка креатива бренда
            <img
              src={mediaPoster}
              alt=""
              loading="lazy"
              className="absolute inset-0 h-full w-full object-cover opacity-80 transition-opacity group-hover:opacity-60"
            />
          ) : (
            <span aria-hidden className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,hsl(var(--primary)/0.25),hsl(var(--background)))]" />
          )}
          <span className="relative flex h-16 w-16 items-center justify-center rounded-full bg-white/90 text-black shadow-lg transition-transform group-hover:scale-105">
            <Play className="ml-1 h-7 w-7" fill="currentColor" />
          </span>
        </button>
      )}
    </div>
  );
}
