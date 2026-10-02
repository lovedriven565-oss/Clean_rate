import { ImageResponse } from "next/og";
import { Monogram, ogFonts } from "@/lib/og/template";

export const size = { width: 64, height: 64 };
export const contentType = "image/png";

export default async function Icon() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", fontFamily: "Geist" }}>
        <Monogram size={64} />
      </div>
    ),
    { ...size, fonts: await ogFonts() }
  );
}
