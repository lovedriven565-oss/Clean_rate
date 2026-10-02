import { ImageResponse } from "next/og";
import { Monogram, ogFonts } from "@/lib/og/template";
import { BRAND_COLORS } from "@/lib/site";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default async function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: BRAND_COLORS.primary,
          fontFamily: "Geist",
        }}
      >
        <Monogram size={180} />
      </div>
    ),
    { ...size, fonts: await ogFonts() }
  );
}
