import type { Metadata, Viewport } from "next";
import { ViewTransition } from "react";
import { Golos_Text, JetBrains_Mono } from "next/font/google";
import { ExternalAnalytics } from "@/components/analytics/ExternalAnalytics";
import { PageViewTracker } from "@/components/analytics/PageViewTracker";
import { MotionProvider } from "@/components/providers/MotionProvider";
import { RegionProvider } from "@/components/providers/RegionProvider";
import { SpeculationRules } from "@/components/SpeculationRules";
import { BRAND_COLORS, SITE_NAME, SITE_URL } from "@/lib/site";
import "./globals.css";

const golos = Golos_Text({ subsets: ["latin", "cyrillic"], variable: "--font-golos", display: "swap" });
const jetbrains = JetBrains_Mono({ subsets: ["latin", "cyrillic"], variable: "--font-jetbrains", display: "swap" });

const description =
  "Лаборатория решений чистоты ChistoLab: пошаговые протоколы выведения пятен и уборки, честный рейтинг клининговых компаний и бренды для профи в Беларуси и России.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  applicationName: SITE_NAME,
  title: {
    default: `${SITE_NAME} — найдите решение любой задачи чистоты`,
    template: `%s | ${SITE_NAME}`,
  },
  description,
  keywords: ["ChistoLab", "клининг", "уборка", "химчистка", "рейтинг клининговых компаний", "клининг Минск", "клининг Москва", "химчистка мебели"],
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    locale: "ru_BY",
    url: SITE_URL,
    title: `${SITE_NAME} — найдите решение любой задачи чистоты`,
    description,
  },
  twitter: { card: "summary_large_image", title: SITE_NAME, description },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, "max-image-preview": "large" } },
  formatDetection: { telephone: true, email: false, address: false },
};

export const viewport: Viewport = {
  themeColor: BRAND_COLORS.paper,
  width: "device-width",
  initialScale: 1,
};

const themeScript = `(function(){try{var t=localStorage.getItem("ch_theme");if(t==="dark"){document.documentElement.classList.add("dark");document.documentElement.style.colorScheme="dark"}else{document.documentElement.classList.remove("dark");document.documentElement.style.colorScheme="light"}}catch(e){}})()`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" suppressHydrationWarning className={`${golos.variable} ${jetbrains.variable}`}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <SpeculationRules />
      </head>
      <body>
        <MotionProvider>
          <RegionProvider>
            <ViewTransition>{children}</ViewTransition>
          </RegionProvider>
        </MotionProvider>
        <PageViewTracker />
        <ExternalAnalytics />
      </body>
    </html>
  );
}
