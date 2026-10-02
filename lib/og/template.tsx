import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { BRAND_COLORS, SITE_MONOGRAM, SITE_NAME, SITE_TAGLINE } from "@/lib/site";

/**
 * Общий шаблон OG-картинок (1200×630). Картинки генерируются на этапе сборки (SSG),
 * поэтому шрифт читается с диска один раз — в рантайме Workers файловая система не нужна.
 * Geist содержит кириллицу; встроенный шрифт next/og — только латиница.
 */
export const OG_SIZE = { width: 1200, height: 630 };
export const OG_CONTENT_TYPE = "image/png";

const fontDir = join(process.cwd(), "node_modules/geist/dist/fonts/geist-sans");
let fontsPromise: Promise<{ regular: Buffer; bold: Buffer }> | undefined;

function loadFonts() {
  fontsPromise ??= Promise.all([
    readFile(join(fontDir, "Geist-Regular.ttf")),
    readFile(join(fontDir, "Geist-Bold.ttf")),
  ]).then(([regular, bold]) => ({ regular, bold }));
  return fontsPromise;
}

export async function ogFonts() {
  const { regular, bold } = await loadFonts();
  return [
    { name: "Geist", data: regular, weight: 400 as const, style: "normal" as const },
    { name: "Geist", data: bold, weight: 700 as const, style: "normal" as const },
  ];
}

export interface OgCardProps {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  /** Крупная метрика справа внизу: смета, балл, индекс. */
  metric?: { value: string; label: string };
}

function clamp(text: string, max: number) {
  return text.length > max ? `${text.slice(0, max - 1).trimEnd()}…` : text;
}

export function Monogram({ size }: { size: number }) {
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: size * 0.22,
        background: BRAND_COLORS.primary,
        color: BRAND_COLORS.paper,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: size * 0.42,
        fontWeight: 700,
        letterSpacing: "-0.04em",
      }}
    >
      {SITE_MONOGRAM}
    </div>
  );
}

export async function renderOgCard({ eyebrow, title, subtitle, metric }: OgCardProps) {
  const titleText = clamp(title, 90);
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 64,
          background: `radial-gradient(circle at 85% 0%, ${BRAND_COLORS.inkSoft} 0%, ${BRAND_COLORS.ink} 60%)`,
          color: BRAND_COLORS.paper,
          fontFamily: "Geist",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <Monogram size={64} />
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ fontSize: 30, fontWeight: 700, letterSpacing: "-0.02em" }}>{SITE_NAME}</div>
            <div style={{ fontSize: 20, color: BRAND_COLORS.muted }}>{SITE_TAGLINE}</div>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {eyebrow && (
            <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase", color: BRAND_COLORS.primaryBright }}>
              {clamp(eyebrow, 60)}
            </div>
          )}
          <div
            style={{
              fontSize: titleText.length > 50 ? 56 : 68,
              fontWeight: 700,
              lineHeight: 1.08,
              letterSpacing: "-0.035em",
              maxWidth: 1000,
            }}
          >
            {titleText}
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 40 }}>
          <div style={{ fontSize: 24, lineHeight: 1.4, color: BRAND_COLORS.muted, maxWidth: 760, display: "flex" }}>
            {subtitle ? clamp(subtitle, 120) : ""}
          </div>
          {metric && (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
              <div style={{ fontSize: 52, fontWeight: 700, color: BRAND_COLORS.primaryBright, letterSpacing: "-0.03em" }}>{metric.value}</div>
              <div style={{ fontSize: 20, color: BRAND_COLORS.muted }}>{metric.label}</div>
            </div>
          )}
        </div>
      </div>
    ),
    { ...OG_SIZE, fonts: await ogFonts() }
  );
}
